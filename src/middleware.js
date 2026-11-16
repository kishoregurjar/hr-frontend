import { NextResponse } from "next/server";

/**
 * Next.js Edge Middleware for HireQuest Multi-Tenant SaaS
 *
 * Responsibilities:
 * 1. Inspect incoming Host header.
 * 2. Discriminate strictly between Main Platform Domain vs Customer Tenant Domains.
 * 3. Enforce that Customer Tenant Domains (*.hirequest.com, *.localhost, custom domains):
 *    - Root `/` serves tenant workspace:
 *      * Authenticated user -> redirects to `/dashboard`
 *      * Logged-out visitor -> rewrites/shows tenant-specific company login (`/login`)
 *    - Public pricing `/plans` -> redirects to tenant's private `/company/plans`
 *    - Public registration `/register` -> redirects to platform domain `/register`
 *    - Platform Super Admin `/admin/*` -> redirects to `/dashboard` or `/login` (blocked on tenant domains)
 * 4. Main Platform Domain (hirequest.com, localhost:3000):
 *    - Serves public landing page, public plans, demo registration, and super-admin login.
 * 5. Inject x-tenant-identifier, x-tenant-slug and x-tenant-domain headers into downstream server components.
 * 6. Set hq_tenant_identifier and hq_tenant_slug cookies for client components.
 */

const ROOT_DOMAINS = [
  "hirequest.com",
  "www.hirequest.com",
  "app.hirequest.com",
  "admin.hirequest.com",
  "api.hirequest.com",
  "localhost",
  "127.0.0.1",
];

const PLATFORM_SUBDOMAINS = ["www", "app", "admin", "api", "staging"];

function getPlatformRootUrl(request) {
  const host = request.headers.get("host") || "";
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
  const protocol = request.nextUrl.protocol || (isLocal ? "http:" : "https:");
  if (isLocal) {
    const port = host.split(":")[1] || "3000";
    return `${protocol}//localhost:${port}`;
  }
  return `${protocol}//hirequest.com`;
}

function applyTenantCookies(response, tenantIdentifier, subdomain, customDomain) {
  if (tenantIdentifier) {
    response.cookies.set("hq_tenant_identifier", tenantIdentifier, {
      path: "/",
      sameSite: "lax",
    });
    if (subdomain) {
      response.cookies.set("hq_tenant_slug", subdomain, {
        path: "/",
        sameSite: "lax",
      });
    }
    if (customDomain) {
      response.cookies.set("hq_tenant_domain", customDomain, {
        path: "/",
        sameSite: "lax",
      });
    }
  } else {
    response.cookies.delete("hq_tenant_identifier");
    response.cookies.delete("hq_tenant_slug");
    response.cookies.delete("hq_tenant_domain");
  }
}

export function middleware(request) {
  const host = request.headers.get("host") || "";
  const hostname = host.replace(/:\d+$/, "").toLowerCase();
  const pathname = request.nextUrl.pathname;

  let subdomain = null;
  let customDomain = null;
  let tenantIdentifier = null;

  // 1. Development: *.localhost (e.g. bestpeer.localhost:3000)
  if (hostname.endsWith(".localhost")) {
    const parts = hostname.split(".");
    if (parts.length >= 2 && parts[0] && !PLATFORM_SUBDOMAINS.includes(parts[0])) {
      subdomain = parts[0];
      tenantIdentifier = parts[0];
    }
  }
  // 2. Production: *.hirequest.com (e.g. bestpeer.hirequest.com)
  else if (hostname.endsWith(".hirequest.com")) {
    const parts = hostname.replace(/\.hirequest\.com$/, "").split(".");
    const candidateSubdomain = parts[parts.length - 1];
    if (candidateSubdomain && !PLATFORM_SUBDOMAINS.includes(candidateSubdomain)) {
      subdomain = candidateSubdomain;
      tenantIdentifier = candidateSubdomain;
    }
  }
  // 3. Custom Enterprise Domains (e.g. careers.bestpeer.com)
  else if (!ROOT_DOMAINS.includes(hostname)) {
    customDomain = hostname;
    tenantIdentifier = hostname;
  }

  // Also check if fallback ?tenant= query parameter is provided (e.g. in dev testing)
  const urlTenant = request.nextUrl.searchParams.get("tenant");
  if (!tenantIdentifier && urlTenant) {
    tenantIdentifier = urlTenant.toLowerCase().trim();
    subdomain = tenantIdentifier;
  }

  const isCustomerTenant = Boolean(tenantIdentifier);

  const requestHeaders = new Headers(request.headers);

  if (tenantIdentifier) {
    requestHeaders.set("x-tenant-identifier", tenantIdentifier);
  } else {
    requestHeaders.delete("x-tenant-identifier");
  }

  if (subdomain) {
    requestHeaders.set("x-tenant-slug", subdomain);
  } else {
    requestHeaders.delete("x-tenant-slug");
  }

  if (customDomain) {
    requestHeaders.set("x-tenant-domain", customDomain);
  } else {
    requestHeaders.delete("x-tenant-domain");
  }

  // ──────────────────────────────────────────────────────────
  // Customer Tenant Domain Isolation Rules
  // (e.g. bestpeer.localhost:3000, bestpeer.hirequest.com)
  // ──────────────────────────────────────────────────────────
  if (isCustomerTenant) {
    const hasAuthSession = Boolean(
      request.cookies.get("refreshToken")?.value ||
      request.cookies.get("accessToken")?.value
    );

    // Rule 1: Root `/` must serve the tenant workspace, NEVER the public marketing page
    if (pathname === "/") {
      if (hasAuthSession) {
        const dashboardUrl = request.nextUrl.clone();
        dashboardUrl.pathname = "/dashboard";
        const redirectRes = NextResponse.redirect(dashboardUrl);
        applyTenantCookies(redirectRes, tenantIdentifier, subdomain, customDomain);
        return redirectRes;
      }
      // Logged-out visitor: Rewrite root `/` directly to `/login` to render tenant branded login
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      const rewriteRes = NextResponse.rewrite(loginUrl, {
        request: { headers: requestHeaders },
      });
      applyTenantCookies(rewriteRes, tenantIdentifier, subdomain, customDomain);
      return rewriteRes;
    }

    // Rule 2: Public pricing `/plans` must NOT be exposed on customer tenant domains.
    // Redirect company users to their private workspace subscription page `/company/plans`.
    if (pathname === "/plans" || pathname.startsWith("/plans/")) {
      const privatePlansUrl = request.nextUrl.clone();
      privatePlansUrl.pathname = "/company/plans";
      const redirectRes = NextResponse.redirect(privatePlansUrl);
      applyTenantCookies(redirectRes, tenantIdentifier, subdomain, customDomain);
      return redirectRes;
    }

    // Rule 3: Public organization registration `/register` belongs exclusively to the main platform domain.
    if (pathname === "/register" || pathname.startsWith("/register/")) {
      const platformRoot = getPlatformRootUrl(request);
      const search = request.nextUrl.search || "";
      const platformRegisterUrl = new URL(`/register${search}`, platformRoot);
      const redirectRes = NextResponse.redirect(platformRegisterUrl);
      applyTenantCookies(redirectRes, tenantIdentifier, subdomain, customDomain);
      return redirectRes;
    }

    // Rule 4: Platform Super Admin `/admin/*` is strictly forbidden on customer tenant subdomains.
    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      const fallbackUrl = request.nextUrl.clone();
      fallbackUrl.pathname = hasAuthSession ? "/dashboard" : "/login";
      const redirectRes = NextResponse.redirect(fallbackUrl);
      applyTenantCookies(redirectRes, tenantIdentifier, subdomain, customDomain);
      return redirectRes;
    }
  }

  // ──────────────────────────────────────────────────────────
  // Main Platform Domain Handling
  // ──────────────────────────────────────────────────────────
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  applyTenantCookies(response, tenantIdentifier, subdomain, customDomain);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, sitemap.xml
     * - Static images/fonts (.svg, .png, .jpg, .woff2, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)).*)",
  ],
};

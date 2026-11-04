import { NextResponse } from "next/server";

/**
 * Next.js Edge Middleware for HireQuest Multi-Tenant SaaS
 *
 * Responsibilities:
 * 1. Inspect incoming Host header.
 * 2. Detect tenant subdomains (e.g. acme.hirequest.com or acme.localhost:3000).
 * 3. Detect custom domains (e.g. careers.acme.com) and local custom simulation (e.g. facebookcompany.localhost:3000).
 * 4. Inject x-tenant-identifier, x-tenant-slug and x-tenant-domain headers into downstream server components.
 * 5. Set hq_tenant_identifier and hq_tenant_slug cookies so client components can seamlessly access active tenant context.
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

export function middleware(request) {
  const host = request.headers.get("host") || "";
  const hostname = host.replace(/:\d+$/, "").toLowerCase();

  let subdomain = null;
  let customDomain = null;
  let tenantIdentifier = null;

  // 1. Development: *.localhost (e.g. facebook.localhost or facebookcompany.localhost)
  if (hostname.endsWith(".localhost")) {
    const parts = hostname.split(".");
    if (parts.length >= 2 && parts[0] && parts[0] !== "www") {
      subdomain = parts[0];
      tenantIdentifier = parts[0];
    }
  }
  // 2. Production: *.hirequest.com
  else if (hostname.endsWith(".hirequest.com")) {
    const parts = hostname.replace(/\.hirequest\.com$/, "").split(".");
    const candidateSubdomain = parts[parts.length - 1];
    if (
      candidateSubdomain &&
      !["www", "app", "admin", "api", "staging"].includes(candidateSubdomain)
    ) {
      subdomain = candidateSubdomain;
      tenantIdentifier = candidateSubdomain;
    }
  }
  // 3. Custom Enterprise Domains (e.g. careers.acme.com or facebookcompany.com)
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

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Attach cookies for client-side accessibility, or clear when accessing platform root
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

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawBackendDestination =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://walkingdreamzhrmanagement.up.railway.app";

// Auto-sanitize: remove any trailing /api/v1 or slashes to prevent /api/v1/api/v1 duplicate routes
const backendDestination = rawBackendDestination
  .replace(/\/api\/v1\/?$/, "")
  .replace(/\/+$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendDestination}/api/v1/:path*`,
      },
    ];
  },
  turbopack: {
    root: __dirname,
  },
  outputFileTracingRoot: __dirname,
};

export default nextConfig;

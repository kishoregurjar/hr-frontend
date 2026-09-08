import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendDestination =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://enjoyable-preoccupy-scowling.ngrok-free.dev";

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendDestination.replace(/\/+$/, "")}/api/v1/:path*`,
      },
    ];
  },
  turbopack: {
    root: __dirname,
  },
  outputFileTracingRoot: __dirname,
};

export default nextConfig;

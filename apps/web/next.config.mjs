import { fileURLToPath } from "node:url";

const appRoot = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = fileURLToPath(new URL("../../", import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@risklens/shared"],
  outputFileTracingRoot: repoRoot,
  turbopack: {
    root: repoRoot
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
  }
};

export default nextConfig;

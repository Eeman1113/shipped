import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/shipped-2026",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;

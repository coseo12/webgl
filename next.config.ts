import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/webgl",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

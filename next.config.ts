import type { NextConfig } from "next";
const isPages = process.env.GITHUB_PAGES === "true";
const config: NextConfig = { output: "export", trailingSlash: true, images: { unoptimized: true }, ...(isPages ? { basePath: "/hd-wallet-explorer", assetPrefix: "/hd-wallet-explorer/" } : {}) };
export default config;

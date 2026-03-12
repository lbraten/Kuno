import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : undefined,
  images: {
    unoptimized: true,
  },
  basePath,
  assetPrefix: basePath || undefined,
};

export default withNextIntl(nextConfig);

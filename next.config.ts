import type { NextConfig } from 'next';

// Without ADMIN_ENABLED=true the admin area is rewritten to a path that has no route, so it answers 404.
export function adminRewrites(enabled: boolean) {
  if (enabled) return [];
  return [
    { source: '/yonetim', destination: '/yonetim-kapali' },
    { source: '/yonetim/:path*', destination: '/yonetim-kapali' },
  ];
}

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 85],
  },
  async headers() {
    return [
      {
        source: '/yonetim/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
  async rewrites() {
    return { beforeFiles: adminRewrites(process.env.ADMIN_ENABLED === 'true'), afterFiles: [], fallback: [] };
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  // Exclude problematic folders from TypeScript checking
  typescript: {
    ignoreBuildErrors: false,
  },
  // Exclude folders from compilation
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  // Serve static files from public directory
  async rewrites() {
    return [
      {
        source: '/game/:path*',
        destination: '/game/:path*',
      },
      {
        source: '/website/:path*',
        destination: '/website/:path*',
      },
      {
        source: '/videogame/:path*',
        destination: '/videogame/:path*',
      },
      {
        source: '/js/:path*',
        destination: '/js/:path*',
      },
      {
        source: '/css/:path*',
        destination: '/css/:path*',
      },
      // Rewrite /website to serve the HTML file
      {
        source: '/website',
        destination: '/website/index.html',
      },
    ];
  },
  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  // Webpack configuration for Three.js and game files
  webpack: (config, { isServer }) => {
    // Handle ES modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Handle Three.js and game files
    config.module.rules.push({
      test: /\.(glb|gltf|fbx|obj)$/,
      type: 'asset/resource',
    });

    // Exclude BORTtheBOT folder from compilation
    config.module.rules.push({
      test: /\.(ts|tsx|js|jsx)$/,
      include: /threeJS_Development\/BORTtheBOT/,
      use: 'ignore-loader',
    });

    return config;
  },
};

module.exports = nextConfig;



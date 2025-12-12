/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: ['kteobfyferrukqeolofj.supabase.co'],
  },
  // Handle server-side packages
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Dont resolve server-only modules on client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        pg: false,
        crypto: false,
        stream: false,
        dns: false,
        child_process: false,
      };
    }
    // Externalize pg on server side
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('pg', 'pg-native');
    }
    return config;
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig

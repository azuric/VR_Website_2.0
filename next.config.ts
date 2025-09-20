const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
    dirs: [],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    eslint: {
      ignoreDuringBuilds: true,
    },
  },
}

export default nextConfig
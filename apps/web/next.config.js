/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  async redirects() {
    return [
      {
        source: '/pages/dashboard.html',
        destination: '/',
        permanent: true,
      },
      {
        source: '/dashboard.html',
        destination: '/',
        permanent: true,
      },
      {
        source: '/pages/:path*.html',
        destination: '/:path*',
        permanent: true,
      },
      {
        source: '/:path*.html',
        destination: '/:path*',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig

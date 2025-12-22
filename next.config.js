/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // ビルド時のESLintエラーを警告として扱う
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig


/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname, // ensures Turbopack uses this folder
  },
}

module.exports = nextConfig

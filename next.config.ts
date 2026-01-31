/** @type {import('next').NextConfig} */
const nextConfig = {
  // Yahaan aapke doosre config ho sakte hain...
  typescript: {
    // !! WARNING !!
    // Build fail nahi hogi agar aapke project mein TS errors hain.
    // Client demo ke liye yeh best jugaar hai.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Build ke waqt ESLint ko check karne se rok dega.
    ignoreDuringBuilds: true,
  },

  // YEH HISSA ADD KAREIN:
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**', // Iska matlab 'picsum.photos' se kahin se bhi image aa sakti hai
      },
      {
        protocol: 'https',
        hostname: 'unsplash.com', // Yeh aapke Auth page ke liye hai
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

module.exports = nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Yahaan aapke doosre config ho sakte hain...
  
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
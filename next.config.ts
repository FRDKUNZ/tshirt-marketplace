import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow local dev origins
  allowedDevOrigins: ["192.168.56.1", "localhost"],
  
  // Image optimization for production
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Add your Supabase storage domain here:
      // {
      //   protocol: "https",
      //   hostname: "*.supabase.co",
      // },
    ],
  },
  
  // Production optimizations are enabled by default
  reactStrictMode: true,
  
  // Compression for production
  compress: true,
};

export default nextConfig;

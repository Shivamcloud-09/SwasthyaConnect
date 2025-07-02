import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: ["https://6000-firebase-studio-1751300020193.cluster-isls3qj2gbd5qs4jkjqvhahfv6.cloudworkstations.dev"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

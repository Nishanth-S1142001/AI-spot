import withVideos from 'next-videos';
/** @type {import('next').NextConfig} */
const nextConfig = { reactStrictMode: true,
    experimental:{serverComponentsExternalPackages: ['pdf2json'], }
     
};

export default withVideos(nextConfig);

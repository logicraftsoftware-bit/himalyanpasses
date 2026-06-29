/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  outputFileTracingIncludes: {
    "/[[...path]]": [
      "./*.html",
      "./config/**/*",
      "./controllers/**/*",
      "./favicon/**/*",
      "./images/**/*",
      "./includes/**/*",
      "./style/**/*"
    ]
  },
  async headers() {
    return [
      {
        source: "/:path*.(css|js|mjs|avif|webp|jpg|jpeg|png|gif|svg|ico|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable"
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          }
        ]
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          }
        ]
      }
    ];
  }
};

export default nextConfig;

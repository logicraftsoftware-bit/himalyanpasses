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

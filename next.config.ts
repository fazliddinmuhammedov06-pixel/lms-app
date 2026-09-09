import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Запрет встраивания в iframe (защита от clickjacking)
          { key: "X-Frame-Options", value: "DENY" },
          // Запрет MIME-sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Политика реферера
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Запрет доступа к камере, микрофону, геолокации
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob:",
              "connect-src 'self' https://lms-app-tan-iota.vercel.app wss://lms-app-tan-iota.vercel.app",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;



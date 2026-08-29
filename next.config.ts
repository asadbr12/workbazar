import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["firebase-admin"],
  outputFileTracingIncludes: {
    "/api/auth/verify-otp": [
      "./node_modules/firebase-admin/**/*",
      "./node_modules/@firebase/**/*",
      "./node_modules/google-auth-library/**/*",
      "./node_modules/gaxios/**/*",
      "./node_modules/gcp-metadata/**/*",
      "./node_modules/gtoken/**/*",
      "./node_modules/jwks-rsa/**/*",
      "./node_modules/jsonwebtoken/**/*",
      "./node_modules/jws/**/*",
      "./node_modules/jwa/**/*",
      "./node_modules/@fastify/busboy/**/*",
    ],
  },
};

export default nextConfig;

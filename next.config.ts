import type { NextConfig } from "next";

// Identifica cada deploy para o Next detectar páginas abertas de uma versão anterior
// e recarregá-las sozinho (version skew). Usa o commit informado pela plataforma de deploy;
// sem nenhuma dessas variáveis, a proteção fica desligada (comportamento anterior).
const deploymentId = process.env.NEXT_DEPLOYMENT_ID || process.env.SOURCE_COMMIT || process.env.RAILWAY_GIT_COMMIT_SHA || undefined

const nextConfig: NextConfig = {
  deploymentId,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

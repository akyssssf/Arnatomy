import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* React Compiler (React 19): memoization otomatis, tanpa useMemo/useCallback manual */
  reactCompiler: true,
  /* Tautan bertipe: href pada <Link> dan router.push() dicek TypeScript */
  typedRoutes: true,
  /* Akar proyek eksplisit agar Turbopack tidak menebak dari lockfile di luar folder */
  turbopack: { root: import.meta.dirname },
};

export default nextConfig;

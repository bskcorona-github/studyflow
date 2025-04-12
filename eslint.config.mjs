import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      // Prismaの自動生成コードをESLintから除外
      "./node_modules/**",
      "./.next/**",
      "./prisma/client/**",
      "./@prisma/client/**",
      "./src/generated/prisma/**",
    ],
  },
];

export default eslintConfig;

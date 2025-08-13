import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Next.jsの基本設定のみを適用（古いオプションを削除）
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript"],
    rules: {
      // TypeScript関連
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_"
        }
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      
      // React関連  
      "react/display-name": "off",
      "react/no-unescaped-entities": "off",
      
      // 一般的なルール
      "no-console": [
        "warn",
        {
          allow: ["warn", "error", "info"]
        }
      ]
    }
  }),
  
  // 無視するパターン
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/out/**",
      "**/public/**",
      "**/*.config.js",
      "**/*.config.mjs",
      "**/dist/**",
      "**/build/**"
    ]
  }
];

export default eslintConfig;
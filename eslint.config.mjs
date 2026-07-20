import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "drizzle/**",
  ]),
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    rules: {
      complexity: ["error", 15],
      "max-depth": ["error", 4],
      "max-lines-per-function": [
        "error",
        { max: 80, skipBlankLines: true, skipComments: true },
      ],
      "max-params": ["error", 4],
      "no-console": ["error", { allow: ["warn", "error"] }],
      eqeqeq: ["error", "smart"],
      "no-nested-ternary": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // Custom: keep conditional Tailwind/class strings via `clsx`. Manual
      // template/concat joins on JSX `className` are easy to get wrong (extra
      // spaces, falsey "undefined") and harder to review. There is no dedicated
      // eslint-plugin for this — enforce with AST selectors.
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "JSXAttribute[name.name='className'] JSXExpressionContainer > TemplateLiteral",
          message:
            "Do not build className with template literals. Use clsx(...) from \"clsx\".",
        },
        {
          selector:
            "JSXAttribute[name.name='className'] JSXExpressionContainer > BinaryExpression[operator='+']",
          message:
            "Do not concatenate className with +. Use clsx(...) from \"clsx\".",
        },
      ],
    },
  },
  {
    files: ["scripts/**/*.{js,mjs,cjs,ts}"],
    rules: {
      "no-console": "off",
      // CLI scripts are intentionally linear and longer than UI units.
      "max-lines-per-function": "off",
      complexity: "off",
    },
  },
]);

export default eslintConfig;

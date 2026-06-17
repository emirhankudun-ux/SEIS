import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginSecurity from "eslint-plugin-security";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
  { 
    languageOptions: { 
      globals: {
        ...globals.browser,
        ...globals.node
      } 
    },
    ignores: [
      // Dependencies
      "node_modules/",
      
      // Build outputs
      "dist/",
      "build/",
      
      // Generated documentation
      "docs/testing/coverage-report.md",
      "DEVELOPMENT_REPORT.md",
      
      // Go files
      "**/*.go",
      "polyglot/go/",
      "packages/seis_kernel_go/",
      
      // Python files
      "**/*.py",
      "scripts/*.py",
      
      // Rust files
      "**/*.rs",
      "**/Cargo.toml",
      "**/Cargo.lock",
      
      // Markdown and documentation
      "**/*.md",
      
      // JSON data files (except config)
      "**/*.json",
      "!package.json",
      "!package-lock.json",
      "!.eslintrc.json",
      "!.prettierrc.json",
      "!tsconfig.json",
      
      // YAML configurations
      "**/*.yml",
      "**/*.yaml",
      
      // HTML files
      "**/*.html",
      
      // CSS files
      "**/*.css",
      "**/*.scss",
      "**/*.sass",
      "**/*.less",
      
      // Image and media files
      "**/*.png",
      "**/*.jpg",
      "**/*.jpeg",
      "**/*.gif",
      "**/*.svg",
      "**/*.ico",
      "**/*.webp",
      "**/*.mp4",
      "**/*.webm",
      "**/*.mp3",
      "**/*.wav",
      
      // Font files
      "**/*.woff",
      "**/*.woff2",
      "**/*.ttf",
      "**/*.eot",
      
      // Binary files
      "**/*.bin",
      "**/*.exe",
      "**/*.dll",
      "**/*.so",
      "**/*.dylib",
      
      // Lock files (except root)
      "**/package-lock.json",
      "**/yarn.lock",
      "**/go.sum"
    ]
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginSecurity.configs.recommended,
  {
    rules: {
      "no-console": "warn",
      "prefer-const": "error",
      "no-var": "error",
      "eqeqeq": ["error", "always"],
      "@typescript-eslint/no-unused-vars": ["error", { 
        "argsIgnorePattern": "^_|^error$",
        "varsIgnorePattern": "^_|^error$"
      }],
      "security/detect-object-injection": "off",
      "security/detect-non-literal-fs-filename": "off",
      "security/detect-eval-with-expression": "error",
      "security/detect-possible-timing-attacks": "off",
      "security/detect-child-process": "off",
      "no-useless-assignment": "warn"
    }
  },
  {
    files: ["**/*.test.js"],
    languageOptions: {
      globals: {
        ...globals.node
      }
    },
    rules: {
      "no-console": "off"
    }
  },
  {
    files: ["apps/web/src/scripts/*.js"],
    rules: {
      "security/detect-object-injection": "off",
      "security/detect-non-literal-fs-filename": "off"
    }
  },
  {
    files: ["apps/web/*.js", "apps/seis-demo-web/*.js"],
    rules: {
      "no-console": "warn",
      "security/detect-object-injection": "off"
    }
  }
];

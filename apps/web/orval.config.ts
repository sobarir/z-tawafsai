import { defineConfig } from 'orval';

/**
 * Generates typed TanStack Query hooks from the NestJS OpenAPI spec.
 *
 *   pnpm generate:api        # from the repo root (emits spec, then hooks)
 *
 * Output: src/libs/api/generated (do not edit — regenerate instead).
 */
export default defineConfig({
  api: {
    input: {
      target: '../api/openapi.json',
    },
    output: {
      target: './src/libs/api/generated/endpoints.ts',
      schemas: './src/libs/api/generated/models',
      client: 'react-query',
      httpClient: 'fetch',
      clean: true,
      prettier: false,
      override: {
        mutator: {
          path: './src/libs/api/mutator.ts',
          name: 'customFetch',
        },
        fetch: {
          // customFetch (mutator.ts) returns the parsed body directly, not a
          // { data, status, headers } envelope — this must match, or every
          // generated hook is typed one level too deep for its runtime value.
          includeHttpResponseReturnType: false,
        },
      },
    },
  },
});

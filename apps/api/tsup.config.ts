import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  target: 'es2022',
  clean: true,
  bundle: true,
  noExternal: [
    '@bamboo/domain-types',
    '@bamboo/engine',
    '@bamboo/content-schema',
    '@bamboo/design-tokens',
  ],
  external: [
    'fastify',
    '@fastify/cors',
    '@fastify/jwt',
    'socket.io',
    'dotenv',
    'zod',
  ],
});

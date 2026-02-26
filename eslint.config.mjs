import nextVitals from 'eslint-config-next/core-web-vitals';

const config = [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      '.open-next/**',
      '.wrangler/**',
      'out/**',
      'dist/**',
      'build/**',
      'tsconfig.tsbuildinfo',
    ],
  },
  ...nextVitals,
];

export default config;

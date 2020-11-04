import { terser } from 'rollup-plugin-terser';

export default [
  {
    input: 'src/index.js',
    output: {
      file: 'dist/synergy.js',
      format: 'es',
    },
  },
  {
    input: 'src/index.js',
    plugins: [terser()],
    output: {
      file: 'dist/synergy.min.js',
      format: 'es',
    },
  },
];

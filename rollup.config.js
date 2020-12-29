import typescript from '@rollup/plugin-typescript';
import { sizeSnapshot } from 'rollup-plugin-size-snapshot';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

export default {
  input: 'src/main.ts',
  output: [
    {
      file: pkg.main,
      format: 'umd',
      sourcemap: true,
      name: pkg.name,
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
      name: pkg.name,
    },
  ],
  plugins: [
    typescript(),
    sizeSnapshot(),
    terser(),
  ],
};

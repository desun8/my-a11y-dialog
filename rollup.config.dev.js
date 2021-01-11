import typescript from '@rollup/plugin-typescript';
import { sizeSnapshot } from 'rollup-plugin-size-snapshot';
import { terser } from 'rollup-plugin-terser';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import pkg from './package.json';

export default {
  input: 'src/main.ts',
  output: [
    {
      file: `example/${pkg.name}.js`,
      format: 'umd',
      sourcemap: true,
      name: 'A11yDialog',
    },
    {
      file: `example/${pkg.name}.esm.js`,
      format: 'es',
      sourcemap: true,
      name: 'A11yDialog',
    },
  ],
  plugins: [
    typescript(),
    sizeSnapshot(),
    terser(),
    serve({
      open: true,
      host: 'localhost',
      port: 3000,
      contentBase: ['./example'],
    }),
    livereload({
      watch: ['./example'],
      exts: ['html', 'js'],
    }),
  ],
};

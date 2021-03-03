import { babel } from '@rollup/plugin-babel';
import typescript from '@rollup/plugin-typescript';


const config = {
    input: './src/index.ts',
    output: {
      dir: 'dist',
      format: 'iife',
      globals:{
        "pixi.js": "PIXI"
      }
    },
    plugins: [babel({ babelHelpers: 'bundled' }), typescript()]
};
  
export default config;
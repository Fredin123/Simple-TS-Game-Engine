import { babel } from '@rollup/plugin-babel';
import typescript from '@rollup/plugin-typescript';


const config = {
    input: './src/developerTools/src/index.ts',
    output: {
      dir: 'src/developerTools/electronApp/',
      format: 'iife',
      globals:{
        'pixi.js': 'PIXI',
        '@pixi/filter-glow': 'PIXI.filters',
        '@pixi/filter-advanced-bloom': 'PIXI.filters',
        '@pixi/filter-tilt-shift':'PIXI.filters',
        '@pixi/filter-godray': 'PIXI.filters',
        '@pixi/filter-bloom':'PIXI.filters',
        '@pixi/filter-drop-shadow': 'PIXI.filters',
        '@pixi/filter-adjustment': 'PIXI.filters',
        '@pixi/filter-simple-lightmap': 'PIXI.filters',
        '@pixi/core': 'PIXI',
        '@pixi/settings': 'PIXI',
        '@pixi/math': 'PIXI',
        '@pixi/utils': 'PIXI.utils',
        '@pixi/filter-alpha': 'PIXI.filters',
        '@pixi/filter-blur': 'PIXI.filters',
        '@pixi/constants': 'PIXI',
        '@pixi/display': 'PIXI',
        '@pixi/runner': 'PIXI',
      }
    },
    plugins: [babel({ babelHelpers: 'bundled' }), typescript()]
};
  
export default config;
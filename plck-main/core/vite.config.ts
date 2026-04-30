import { fileURLToPath, URL } from 'node:url'
import Inspect from 'vite-plugin-inspect'
import yaml from '@rollup/plugin-yaml'
import PLCKPlugin from './plugins/PLCKPlugin.js'
import path from 'path'

import {defineConfig} from 'vite'
import type {PluginOption} from "vite"
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  root: path.resolve(__dirname),
  publicDir: path.resolve(`${__dirname}/../public`),
  base: './',
  plugins: [
    vue(),
    PLCKPlugin() as PluginOption,
    yaml(),
    Inspect(),
  ],
  server: {
    port: 8000,
    host: '0.0.0.0',
  },
  build: {
    outDir: '../dist',
    minify: false,
    cssMinify: false,
  },
  resolve: {
    extensions: ['.ts', '.js', '.vue', 'css', 'scss', 'less'],
    alias: {
      'vue-runtime': 'vue/dist/vue.esm-bundler.js',
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@frame': fileURLToPath(new URL('./../frame', import.meta.url)),
      '@corePlck': fileURLToPath(new URL('./plck', import.meta.url)),
      '@plck': fileURLToPath(new URL('./../.plck', import.meta.url)),
      '@scenes': fileURLToPath(new URL('./../scenes', import.meta.url)),
    }
  }
})

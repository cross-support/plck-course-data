import path from 'path'

export default{
    resolve: {
        extensions: ['.ts', '.js', '.vue', 'css', 'scss', 'less'],
        alias: {
            'vue-runtime': 'vue/dist/vue.esm-bundler.js',
            '@': path.resolve(__dirname, './src'),
            '@frame': path.resolve(__dirname, './../frame'),
            '@corePlck': path.resolve(__dirname, './plck'),
            '@plck': path.resolve(__dirname, './../.plck'),
            '@scenes': path.resolve(__dirname, './../scenes'),
        }
    }
}

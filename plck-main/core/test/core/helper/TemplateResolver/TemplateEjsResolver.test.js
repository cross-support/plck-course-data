import { describe, it, expect } from "vitest";
import TemplateEjsResolver from "../../../../plck/components/common/TemplateResolver/TemplateEjsResolver";

describe('TemplateResolver', () => {

    it('テンプレートにプロパティーを渡し、正しく処理されるか', async () => {

        const option = {
            name: 'component-name',
            customHookUrl: '@plck/video/component-name/customHook.js',
            style: '.test { display: none }'
        }

        const template = `
<script setup>
    import { onBeforeMount, onMounted } from 'vue'
    import { beforeVideoOptionCreate, videoInitialized } from '<%= customHookUrl %>'

</script>
<template>
    <div>
        <p>タイトル: {{ $t('<%= name %>_title') }}</p>
        <p>btn_next_unit_name: {{ $t('<%= name %>_btn_next_scene_name') }}</p>
        <p>btn_end_unit_name: {{ $t('<%= name %>_btn_next_scene_name') }}</p>
    </div>
</template>
<style>
    <%= style %>
</style>
        `

        // eslint-disable-next-line no-undef
        const templateResolver = new TemplateEjsResolver(template, option)
        const result = await templateResolver.create()
        console.log(result)
        expect(!!result.match(/component-name_title/)).toBe(true)
        expect(!!result.match(/component-name_btn_next_scene_name/)).toBe(true)
        expect(!!result.match(/@plck\/video\/component-name\/customHook.js/)).toBe(true)
        expect(!!result.match(/\.test \{ display: none \}/)).toBe(true)

    })

})
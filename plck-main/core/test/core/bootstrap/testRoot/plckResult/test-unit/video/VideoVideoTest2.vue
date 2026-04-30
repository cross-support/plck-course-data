<script setup lang="ts">
import {onMounted, onUnmounted} from 'vue'
import { videoInitialized } from '@scenes/video/customHook.js'
import type {VideoConfig} from "@corePlck/components/scene/scene/video/video.type";
import {useVideo} from "@corePlck/components/scene/scene/video/useVideo";
import {useScene} from "@corePlck/components/scene/scene/useScene";

const config: VideoConfig = {"title":"動画シーンタイトル","video_url":"scene.com","complete_end_video":"on","btn_next_scene_name":"次へ","btn_next_unit_name":"次のユニットへ","btn_end_unit_name":"終了する"};

const { sceneInitialized } = useScene('video-test-2')
const {
   videoStyle,
   videoUrl,
   videoFrame,
   btnNextUnitString,
   btnNextSceneString,
   btnEndUnitString,
   isCompleted,
   hasNextUnit,
   hasNextScene,
   componentOnMounted,
   componentOnUnmounted,
   onEndUnitButtonClicked,
   onNextUnitButtonClicked,
   onNextSceneButtonClicked,
   onIframeLoaded
} = useVideo(config, 'video-test-2', videoInitialized)


onMounted(async () => {
   await sceneInitialized()
   componentOnMounted()
})

onUnmounted(() => {
   componentOnUnmounted()
})

</script>
<template>

   <div id="type_video">
      <!--動画表示領域-->
      <div id="video_cover"></div>
      <div id="type_video_movie" :style="videoStyle">
         <iframe ref="videoFrame" allowfullscreen scrolling="no" :src="videoUrl" @load="onIframeLoaded"></iframe>
      </div>

      <div class="video_button_area">
         <!-- 次のシーンボタン -->
         <div v-if="isCompleted && hasNextScene" class="video_button" id="video_next_scene">
            <button-next-scene v-html="btnNextSceneString"></button-next-scene>
         </div>

         <!-- 次のユニットへボタン -->
         <div v-if="hasNextUnit" class="video_button" id="video_next_unit">
            <button-next-unit v-html="btnNextUnitString"></button-next-unit>
         </div>

         <!-- 終了ボタン -->
         <div v-if="isCompleted" class="video_button" id="video_end_unit">
            <button
                    type="button"
                    class="btn"
                    v-html="btnEndUnitString"
                    @click.prevent="onEndUnitButtonClicked"
            ></button>
         </div>
      </div>
   </div>
</template>
<style scoped>
.style { display: none }
</style>
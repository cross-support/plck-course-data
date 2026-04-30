<script setup>
import FrameMenu from "../../components/plck/FrameMenu/FrameMenu.vue";
import FrameHeader from "../../components/plck/FrameHeader/FrameHeader.vue";
import {useMainFrame} from "@/views/MainFrame/mainFrame";
import UnitDoneDialog from "@/components/plck/base/UnitDoneDialog.vue";

const { handleToggleMenu, state, componentName, loading } = useMainFrame()

</script>
<template>

  <div id="wrapper">
    <frame-header
        @toggle-menu="() => handleToggleMenu(true)"
    />
    <!--各シーンのコンテンツをここに読み込む-->
    <component :is="componentName" />
    <frame-menu
        :open="state.menuIsOpen"
        @close-menu="() => handleToggleMenu(false)"
    />
  </div>

  <unit-done-dialog />

</template>
<style>
@media (min-width: 769px) {
  /*コンテンツ全体枠*/
  #wrapper{
    background-color: #fff;
    position: relative;
    width: 100%;
    height: 100%;
    margin: 0 auto;
    padding-bottom: 0.5em;
  }
}

</style>
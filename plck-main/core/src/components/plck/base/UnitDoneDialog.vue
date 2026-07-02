<script setup lang="ts">
import { useI18n } from "vue-i18n";
import ButtonNextUnit from "@/components/plck/base/ButtonNextUnit.vue";
import {computed} from "vue";
import BaseButton from "@/components/plck/base/BaseButton.vue";
import { usePlckStore } from "@/store/plck.ts";
import {storeToRefs} from "pinia";

const { t } = useI18n()

const { showPopup } = storeToRefs(usePlckStore())
const { toHidePopup } = usePlckStore()

const nextUnitText = computed(() => {
  return t('main_popup_next_unit_text')
})

const explanationText = computed(() => {
  return t('main_popup_explanation_text')
})

const closeText = computed(() => {
  return t('main_popup_close_text')
})

</script>
<template>
  <div class="unit-done-dialog-wrapper" v-if="showPopup">

    <div class="unit-done-dialog-content">
      <div class="unit-done-dialog-header">{{explanationText}}</div>
      <div class="unit-done-dialog-actions">
        <button-next-unit class="btn-next-unit" v-html="nextUnitText"></button-next-unit>
        <base-button class="btn-close" v-html="closeText" @click.prevent="toHidePopup"></base-button>
      </div>
    </div>

    <div class="unit-done-dialog-overlay"></div>
  </div>
</template>
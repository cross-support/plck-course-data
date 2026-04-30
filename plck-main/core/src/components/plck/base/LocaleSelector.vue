<script setup lang="ts">
import { inject, computed } from "vue";
import {useI18n} from "vue-i18n";
import { plckConfigKey } from "@/plugins/PlckPlugin";
import {LanguageLocale} from "@corePlck/i18n/l18n.type.ts";
import type {PLCKConfigType} from "@corePlck/config/config.type";
import {usePlckStore} from "@/store/plck.ts";

const plckConfig = inject<PLCKConfigType>(plckConfigKey)
const { t, locale: currentLocale } = useI18n()
const { saveLocale } = usePlckStore()

const localeList = computed(() => {
  if (!plckConfig) return []
  return plckConfig.lang.map((locale) => {
    return {
      locale,
      label: t(`locale_${locale}`)
    }
  })
})

const chooseLocaleText = computed(() => {
  return t('main_label_text')
})

const emits = defineEmits<{
  (e: 'locale-changed'): void
}>()

async function onLocaleChanged(e) {
  const locale = (e.target as HTMLInputElement).value as LanguageLocale
  await saveLocale(locale)
  emits('locale-changed')
}

</script>
<template>
  <!-- Change lang -->
  <div id="langChoice" class="field">
    <label id="langLabel" class="label" v-html="chooseLocaleText"></label>
    <div class="control has-icons-left">

      <div class="select is-small">
        <select v-model="currentLocale" @change="onLocaleChanged">
          <option v-for="item in localeList" :key="item.locale" :value="item.locale">{{item.label}}</option>
        </select>
      </div>

    </div>
  </div>
</template>
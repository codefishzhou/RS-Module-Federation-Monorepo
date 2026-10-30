<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { findHtmlTool, resolvePublicUrl } from '../tools'

const route = useRoute()
const tool = computed(() => findHtmlTool(route.params.toolId))
const toolUrl = computed(() => (tool.value ? resolvePublicUrl(tool.value.entry) : ''))
</script>

<template>
  <section v-if="tool" class="tool-workspace">
    <header class="tool-workspace__header">
      <div>
        <RouterLink class="back-link" :to="{ name: 'tools' }">‹ 返回工具列表</RouterLink>
        <h2>{{ tool.name }}</h2>
        <p>{{ tool.description }}</p>
      </div>
      <a class="open-tool" :href="toolUrl" target="_blank" rel="noopener noreferrer">新窗口 ↗</a>
    </header>

    <iframe
      class="tool-frame"
      :src="toolUrl"
      :title="tool.name"
      sandbox="allow-scripts allow-forms allow-downloads allow-modals"
    />
  </section>

  <section v-else class="panel">
    <h2>工具不存在</h2>
    <p>该工具未登记或已经下线，请返回列表选择其他工具。</p>
    <RouterLink :to="{ name: 'tools' }">返回工具列表</RouterLink>
  </section>
</template>

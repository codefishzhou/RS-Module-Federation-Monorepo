<script setup lang="ts">
import { htmlTools } from '../tools'
</script>

<template>
  <section class="tool-directory">
    <div class="page-heading">
      <div>
        <p class="kicker">工作台 / 工具</p>
        <h2>浏览器工具</h2>
        <p class="page-heading__copy">文件只在本地处理。选择一个工具即可开始。</p>
      </div>
      <span class="tool-count"><strong>{{ htmlTools.length }}</strong> 个可用工具</span>
    </div>

    <div class="tool-list">
      <RouterLink
        v-for="(tool, index) in htmlTools"
        :key="tool.id"
        class="tool-card"
        :to="{ name: 'html-tool', params: { toolId: tool.id } }"
      >
        <span class="tool-card__index">0{{ index + 1 }}</span>
        <span class="tool-card__mark" aria-hidden="true">{{
          tool.id === 'json-formatter' ? '{}' : tool.id === 'zip-manager' ? 'ZIP' : 'IMG'
        }}</span>
        <span class="tool-card__body">
          <strong>{{ tool.name }}</strong>
          <small>{{ tool.description }}</small>
        </span>
        <span class="tool-card__arrow" aria-hidden="true">打开</span>
      </RouterLink>
    </div>
  </section>
</template>

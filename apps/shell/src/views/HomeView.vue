<script setup lang="ts">
import { htmlTools } from '../tools'
</script>

<template>
  <div class="overview">
    <header class="page-heading page-heading--home">
      <div>
        <p class="kicker">工作台 / 概览</p>
        <h2>今天要处理什么？</h2>
        <p class="page-heading__copy">常用的浏览器工具与独立模块，都在一个清晰的工作面里。</p>
      </div>
      <div class="system-state" aria-label="系统状态">
        <span>{{ htmlTools.length + 1 }}</span>
        <small>个模块可用</small>
      </div>
    </header>

    <section class="quick-launch" aria-labelledby="quick-launch-heading">
      <div class="section-title">
        <h3 id="quick-launch-heading">快速打开</h3>
        <RouterLink to="/tools">查看全部工具</RouterLink>
      </div>
      <div class="launch-list">
        <RouterLink
          v-for="(tool, index) in htmlTools"
          :key="tool.id"
          class="launch-row"
          :to="{ name: 'html-tool', params: { toolId: tool.id } }"
        >
          <span class="launch-row__index">0{{ index + 1 }}</span>
          <span class="launch-row__body">
            <strong>{{ tool.name }}</strong>
            <small>{{ tool.description }}</small>
          </span>
          <span class="launch-row__action" aria-hidden="true">打开</span>
        </RouterLink>
      </div>
    </section>

    <section class="architecture-note" aria-labelledby="architecture-heading">
      <div class="architecture-note__copy">
        <span class="module-glyph" aria-hidden="true">◇</span>
        <div>
          <h3 id="architecture-heading">远程模块验证</h3>
          <p>验证独立构建、部署与运行时加载链路。</p>
        </div>
      </div>
      <RouterLink class="button-link" to="/playground">进入验证页</RouterLink>
    </section>
  </div>
</template>

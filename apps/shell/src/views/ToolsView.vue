<script setup lang="ts">
import { htmlTools } from '../tools'
</script>

<template>
  <section class="tool-directory">
    <div class="section-heading">
      <div>
        <p class="eyebrow">Static HTML Tools</p>
        <h2>HTML 工具</h2>
      </div>
      <span class="tool-count">{{ htmlTools.length }} 个工具</span>
    </div>

    <div class="tool-grid">
      <RouterLink
        v-for="tool in htmlTools"
        :key="tool.id"
        class="tool-card"
        :to="{ name: 'html-tool', params: { toolId: tool.id } }"
      >
        <span class="tool-card__mark" aria-hidden="true">{ }</span>
        <span>
          <strong>{{ tool.name }}</strong>
          <small>{{ tool.description }}</small>
        </span>
        <span class="tool-card__arrow" aria-hidden="true">&#8594;</span>
      </RouterLink>
    </div>
  </section>
</template>

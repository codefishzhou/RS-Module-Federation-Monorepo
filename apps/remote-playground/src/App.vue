<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <article class="remote">
    <div>
      <p class="eyebrow">Remote Playground</p>
      <h3>独立 Remote 已加载</h3>
      <p>这是一个可独立构建、部署和测试的技术验证模块。</p>
    </div>
    <button type="button" @click="count++">测试状态：{{ count }}</button>
  </article>
</template>

<style scoped>
.remote {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 20px;
  border: 1px solid #b9c8dc;
  border-radius: 5px;
  background: #f6f9fd;
}
.eyebrow {
  margin-bottom: 6px;
  color: #35618f;
  font-size: 12px;
  text-transform: uppercase;
}
h3 {
  margin: 0 0 8px;
  font-size: 18px;
}
p {
  margin: 0;
  color: #5f6d82;
}
button {
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid #35618f;
  border-radius: 4px;
  background: #35618f;
  color: #fff;
  cursor: pointer;
}
@media (max-width: 640px) {
  .remote {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>

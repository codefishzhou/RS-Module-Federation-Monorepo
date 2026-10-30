<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <article class="remote">
    <div class="remote__identity">
      <span class="remote__symbol" aria-hidden="true">MF</span>
      <div>
        <h3>独立 Remote 已加载</h3>
        <p>该模块拥有独立的构建、部署和状态边界。</p>
      </div>
    </div>
    <div class="remote__test">
      <span>本地交互状态</span>
      <button type="button" @click="count++">测试状态：{{ count }}</button>
    </div>
  </article>
</template>

<style scoped>
.remote {
  display: flex;
  min-height: 190px;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 34px;
  background: #fff;
  color: #18221f;
  font-family: 'Avenir Next', Avenir, 'Segoe UI', sans-serif;
}
.remote__identity {
  display: flex;
  align-items: center;
  gap: 18px;
}
.remote__symbol {
  display: grid;
  width: 56px;
  height: 56px;
  flex: 0 0 56px;
  place-items: center;
  border: 1px solid #9eb5aa;
  border-radius: 5px;
  background: #edf3f0;
  color: #11563e;
  font-family: SFMono-Regular, Consolas, monospace;
  font-size: 13px;
  font-weight: 700;
}
h3 {
  margin: 0 0 8px;
  font-size: 21px;
  font-weight: 620;
}
p {
  margin: 0;
  color: #66736e;
  line-height: 1.55;
}
.remote__test {
  display: grid;
  flex: 0 0 auto;
  justify-items: end;
  gap: 8px;
}
.remote__test span {
  color: #78847f;
  font-size: 12px;
}
button {
  min-width: 126px;
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid #11563e;
  border-radius: 4px;
  background: #11563e;
  color: #fff;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
button:hover {
  background: #0d4935;
}
button:focus-visible {
  outline: 3px solid rgb(25 112 82 / 28%);
  outline-offset: 3px;
}
@media (max-width: 640px) {
  .remote {
    align-items: flex-start;
    flex-direction: column;
    padding: 24px 20px;
  }
  .remote__test {
    width: 100%;
    justify-items: stretch;
  }
  .remote__test span {
    text-align: left;
  }
}
</style>

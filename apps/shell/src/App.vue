<template>
  <main class="shell">
    <header class="shell__header">
      <div>
        <p class="eyebrow">Module Federation Host</p>
        <h1>产品 Shell</h1>
      </div>
      <div class="shell__actions">
        <nav aria-label="主导航">
          <RouterLink to="/">首页</RouterLink>
          <RouterLink to="/playground">Playground</RouterLink>
        </nav>
        <span class="status">独立部署骨架</span>
      </div>
    </header>

    <section class="shell__content">
      <RouterView />
    </section>
  </main>
</template>

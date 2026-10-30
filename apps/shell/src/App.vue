<template>
  <main class="shell">
    <header class="shell__header">
      <div class="brand">
        <span class="brand__mark" aria-hidden="true"><i /><i /><i /></span>
        <div>
          <h1>产品 Shell</h1>
          <p>前端工具工作台</p>
        </div>
      </div>
      <nav class="shell__nav" aria-label="主导航">
        <RouterLink to="/">
          <span class="nav-mark" aria-hidden="true">⌂</span>
          <span>概览</span>
        </RouterLink>
        <RouterLink to="/tools">
          <span class="nav-mark" aria-hidden="true">⌘</span>
          <span>工具</span>
        </RouterLink>
        <RouterLink to="/playground">
          <span class="nav-mark" aria-hidden="true">◇</span>
          <span>远程模块</span>
        </RouterLink>
      </nav>
      <div class="shell__meta">
        <span class="connection-dot" aria-hidden="true" />
        <span>模块服务在线</span>
      </div>
    </header>

    <section class="shell__content">
      <div class="content-rail" aria-hidden="true" />
      <RouterView />
    </section>
  </main>
</template>

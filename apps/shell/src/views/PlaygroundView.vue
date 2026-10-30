<template>
  <section class="playground-page">
    <header class="page-heading">
      <div>
        <p class="kicker">工作台 / 远程模块</p>
        <h2>Remote Playground</h2>
        <p class="page-heading__copy">通过 Remote Manifest 加载的独立运行模块。</p>
      </div>
      <span class="runtime-badge"><i aria-hidden="true" /> Runtime ready</span>
    </header>
    <div class="remote-stage">
      <div class="remote-stage__bar">
        <span>remote_playground / App</span>
        <span>Federated module</span>
      </div>
      <RemotePlayground />
    </div>
  </section>
</template>

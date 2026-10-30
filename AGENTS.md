# 项目协作指南

## 项目用途

本仓库是一个基于 Nx 与 pnpm 的 Vue 3 Module Federation 单体仓库。Shell 负责导航和内嵌浏览器工具；需要独立部署的功能则作为 Remote 应用维护。

## 目录结构

- `apps/shell`：宿主应用，包含路由、公共界面样式和静态 HTML 工具。
- `apps/remote-playground`：独立构建的 Module Federation Remote，用于验证集成链路。
- `apps/image-compressor`：独立的图片压缩应用，发布后集成到 Shell 部署目录。
- `packages/contracts`：共享 TypeScript 契约，不得放入特定应用的运行时代码。
- `tests/e2e`：Shell、Remote 与内嵌工具的 Playwright 端到端测试。
- `deploy`：生产环境 Web 服务器配置示例。

不要编辑 `dist`、`.nx`、`node_modules` 或 `test-results` 中的生成文件。

## 本地开发

使用 Node.js 22 和 pnpm 10.14.0。

```bash
corepack enable
pnpm install
pnpm dev
```

`pnpm dev` 会启动 Shell、Remote Playground 和 Image Compressor，并从 3000、3001、3002 开始选择首个可用端口。应读取终端打印的实际地址，不要假设默认端口始终可用。

## 质量验证

迭代时先运行与改动范围对应的最小检查。跨应用改动交付前，应运行完整验证：

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm e2e
```

检查单个项目时，优先使用 `pnpm nx <target> <project>`，例如 `pnpm nx typecheck shell`。

## 架构约束

- 保持 Host 与 Remote 的边界。Shell 可以加载 Remote，但不得导入其私有源码。
- 静态工具需要在 `apps/shell/src/tools.ts` 中登记，资源放在 `apps/shell/public/embedded-tools/<tool-id>`，并使用相对资源路径。
- iframe 应使用最小沙箱权限。需要跨应用通信时，先定义明确的 `postMessage` 契约，不要直接开放同源权限。
- 跨应用共享的数据结构应放入 `packages/contracts`，并兼容独立部署版本之间的差异。
- 修改路由或资源解析时，必须保留 `APP_BASE_PATH`、`ROUTER_MODE`、`REMOTE_PLAYGROUND_URL` 和 `MF_ASSET_PREFIX` 的既有行为。

## 前端约定

- 使用 Vue 3 Composition API 与 `<script setup lang="ts">`。
- 新增颜色、圆角、阴影或字体前，先复用现有设计令牌和视觉语言。
- 操作型页面应紧凑且便于扫描。卡片只用于重复项目或有明确边界的工具，不要嵌套卡片。
- 所有控件必须具有清晰的键盘焦点样式和无障碍名称，同时验证移动端和桌面端布局。
- 不要为单个组件引入 UI 依赖。确需共享组件或图标库时，在工作区级别添加并保持一致使用。
- 除 `Remote Manifest` 等稳定技术标识外，面向用户的文案使用中文。

## 修改纪律

- 保留工作区中与当前任务无关的修改。编辑存在重叠的文件前，先检查现有差异。
- 改动应限定在需求涉及的应用范围内；行为或契约变化时同步更新测试。
- 不要提交密钥、本地环境文件、部署凭据或机器相关的绝对路径。
- 创建提交时使用 Conventional Commits，例如 `feat(shell): refine tool workspace`。

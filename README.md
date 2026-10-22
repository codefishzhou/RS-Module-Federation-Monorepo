# RS Module Federation Monorepo

author: codefishzhou

本仓库提供单产品、多应用的最小工程骨架。业务未确定前，`shell` 承载产品功能，
`remote-playground` 仅验证 Module Federation 的独立构建和加载链路。

## 本地开发

```bash
corepack enable
pnpm install
pnpm dev
```

- Shell: <http://localhost:3000>
- Remote: <http://localhost:3001>
- Remote manifest: <http://localhost:3001/mf-manifest.json>

`pnpm dev` 会从上述默认值开始查找可用端口；如果端口已占用，终端会打印实际选中的
Shell 和 Remote 地址，并自动同步 Module Federation 与 CORS 配置。可通过 `SHELL_PORT`
和 `REMOTE_PLAYGROUND_PORT` 修改查找起始端口。

## 嵌入独立 HTML 工具

不需要参与 Vue 编译的独立 HTML 工具统一放在：

```text
apps/shell/public/embedded-tools/<tool-id>/
├── index.html
├── assets/
├── styles.css
└── main.js
```

入口文件固定为 `index.html`，HTML 内的 CSS、JavaScript、图片等资源使用相对路径。新增工具后，
在 [`apps/shell/src/tools.ts`](apps/shell/src/tools.ts) 的 `htmlTools` 中登记名称、说明和入口即可。
构建时目录会原样复制到 `dist/apps/shell/embedded-tools/`，Shell 通过 `/tools/:toolId` 路由在
沙箱 `iframe` 中加载它。示例位于
[`apps/shell/public/embedded-tools/json-formatter`](apps/shell/public/embedded-tools/json-formatter)。
ZIP 压缩与解压工具位于
[`apps/shell/public/embedded-tools/zip-manager`](apps/shell/public/embedded-tools/zip-manager)。

默认沙箱允许脚本、表单、下载和弹窗，但不授予同源权限。工具如果必须访问 Shell 登录态、
Cookie 或内部 API，不应直接放宽沙箱；应先设计明确的 `postMessage` 通信协议，或者将其改造成
Vue 模块/Module Federation Remote。

## 验证

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm e2e
```

## 生产构建

Shell 通过 `REMOTE_PLAYGROUND_URL` 指向部署后的 Remote manifest。Remote 通过
`MF_ASSET_PREFIX` 设置带版本号的同域资源目录：

```bash
pnpm nx build shell
MF_ASSET_PREFIX=/_mf/remote-playground/releases/2026-09-03-001/ pnpm nx build remote-playground
```

生产 Shell 默认读取 `/_mf/remote-playground/current/mf-manifest.json`。发布 Remote 时，
先将 `dist/apps/remote-playground` 上传到新的 `releases/<version>` 目录，验证资源完整后，
再原子切换 `current` 软链接；回滚同样只需切换软链接。不同环境也可使用
`REMOTE_PLAYGROUND_URL` 覆盖默认地址。

Nginx 应让 `/_mf/` 下不存在的文件直接返回 404，不能回退到 Shell 的
`index.html`。Shell 的业务路由才使用 SPA 回退，示例见
[`deploy/nginx.conf.example`](deploy/nginx.conf.example)。

## GitHub CI/CD

[`ci-cd.yml`](.github/workflows/ci-cd.yml) 参考 `a.yml`。推送到 `dev` 或创建 Pull Request
时执行格式、Lint、类型、单元测试和 Playwright；推送到 `main` 时跳过测试，将 Shell
与 Remote 组装成一个 GitHub Pages 制品并部署。

首次使用前，需要在 GitHub 仓库的 **Settings > Pages > Build and deployment** 中将
Source 设置为 **GitHub Actions**。项目站点会自动使用 `/<repository>/` 基础路径，
用户或组织站点会使用 `/`。GitHub Pages 是集成演示环境；生产环境仍使用前述 Nginx
版本目录方案，以保留 Shell 与 Remote 的独立发布和回滚能力。

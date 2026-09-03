# RS Module Federation Monorepo

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

[`ci-cd.yml`](.github/workflows/ci-cd.yml) 参考 `a.yml`，在 Pull Request 中执行格式、
Lint、类型、单元测试、Playwright 和构建检查；推送到 `dev` 分支或手动触发时，再将
Shell 与 Remote 组装成一个 GitHub Pages 制品并部署。

首次使用前，需要在 GitHub 仓库的 **Settings > Pages > Build and deployment** 中将
Source 设置为 **GitHub Actions**。项目站点会自动使用 `/<repository>/` 基础路径，
用户或组织站点会使用 `/`。GitHub Pages 是集成演示环境；生产环境仍使用前述 Nginx
版本目录方案，以保留 Shell 与 Remote 的独立发布和回滚能力。

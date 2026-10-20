export interface HtmlTool {
  id: string
  name: string
  description: string
  entry: string
}

export const htmlTools: HtmlTool[] = [
  {
    id: 'json-formatter',
    name: 'JSON 格式化',
    description: '校验、格式化并压缩 JSON 文本。',
    entry: 'embedded-tools/json-formatter/index.html',
  },
]

export function findHtmlTool(toolId: unknown) {
  return htmlTools.find((tool) => tool.id === toolId)
}

export function resolvePublicUrl(entry: string, basePath = process.env.APP_BASE_PATH ?? '/') {
  const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`
  return `${normalizedBase}${entry.replace(/^\/+/, '')}`
}

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
  {
    id: 'zip-manager',
    name: 'ZIP 压缩与解压',
    description: '在浏览器本地压缩文件或文件夹，并查看、解压 ZIP 内容。',
    entry: 'embedded-tools/zip-manager/index.html',
  },
  {
    id: 'image-compressor',
    name: '图片压缩',
    description: '在浏览器本地压缩 PNG、JPEG、WebP 图片，支持对比和批量下载。',
    entry: 'embedded-tools/image-compressor/index.html',
  },
]

export function findHtmlTool(toolId: unknown) {
  return htmlTools.find((tool) => tool.id === toolId)
}

export function resolvePublicUrl(entry: string, basePath = process.env.APP_BASE_PATH ?? '/') {
  const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`
  return `${normalizedBase}${entry.replace(/^\/+/, '')}`
}

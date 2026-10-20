import { describe, expect, it } from 'vitest'
import { findHtmlTool, resolvePublicUrl } from './tools'

describe('HTML tools', () => {
  it('resolves a registered tool', () => {
    expect(findHtmlTool('json-formatter')?.entry).toBe('embedded-tools/json-formatter/index.html')
    expect(findHtmlTool('batch-rename')?.entry).toBe('embedded-tools/batch-rename/index.html')
    expect(findHtmlTool('unknown')).toBeUndefined()
  })

  it('resolves entries against root and repository base paths', () => {
    expect(resolvePublicUrl('/embedded-tools/demo/index.html', '/')).toBe(
      '/embedded-tools/demo/index.html',
    )
    expect(
      resolvePublicUrl('embedded-tools/demo/index.html', '/RS-Module-Federation-Monorepo/'),
    ).toBe('/RS-Module-Federation-Monorepo/embedded-tools/demo/index.html')
  })
})

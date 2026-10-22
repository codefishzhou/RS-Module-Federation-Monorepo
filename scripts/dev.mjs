import { spawn } from 'node:child_process'
import console from 'node:console'
import { createServer } from 'node:net'
import process from 'node:process'

const DEFAULT_SHELL_PORT = 3000
const DEFAULT_REMOTE_PORT = 3001
const DEFAULT_IMAGE_COMPRESSOR_PORT = 3002

function readStartingPort(value, fallback, variableName) {
  if (value === undefined) return fallback

  const port = Number(value)
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${variableName} 必须是 1 到 65535 之间的整数。`)
  }
  return port
}

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = createServer()
    server.unref()
    server.once('error', () => resolve(false))
    server.listen({ host: '0.0.0.0', port, exclusive: true }, () => {
      server.close(() => resolve(true))
    })
  })
}

async function findAvailablePort(startingPort, reservedPorts = new Set()) {
  for (let port = startingPort; port <= 65535; port += 1) {
    if (!reservedPorts.has(port) && (await isPortAvailable(port))) return port
  }
  throw new Error(`从端口 ${startingPort} 开始没有找到可用端口。`)
}

const shellStartingPort = readStartingPort(process.env.SHELL_PORT, DEFAULT_SHELL_PORT, 'SHELL_PORT')
const remoteStartingPort = readStartingPort(
  process.env.REMOTE_PLAYGROUND_PORT,
  DEFAULT_REMOTE_PORT,
  'REMOTE_PLAYGROUND_PORT',
)
const imageCompressorStartingPort = readStartingPort(
  process.env.IMAGE_COMPRESSOR_PORT,
  DEFAULT_IMAGE_COMPRESSOR_PORT,
  'IMAGE_COMPRESSOR_PORT',
)
const shellPort = await findAvailablePort(shellStartingPort)
const remotePort = await findAvailablePort(remoteStartingPort, new Set([shellPort]))
const imageCompressorPort = await findAvailablePort(imageCompressorStartingPort, new Set([shellPort, remotePort]))
const remoteUrl = `http://localhost:${remotePort}/mf-manifest.json`

console.log(`开发端口：Shell http://localhost:${shellPort}`)
console.log(`开发端口：Remote http://localhost:${remotePort}`)
console.log(`开发端口：Image Compressor http://localhost:${imageCompressorPort}`)

const corepack = process.platform === 'win32' ? 'corepack.cmd' : 'corepack'
const supportsProcessGroups = process.platform !== 'win32'
const child = spawn(
  corepack,
  [
    'pnpm',
    'exec',
    'nx',
    'run-many',
    '-t',
    'dev',
    '--projects=shell,remote-playground,image-compressor',
    '--parallel=3',
  ],
  {
    env: {
      ...process.env,
      NX_TUI: 'false',
      NX_DAEMON: 'false',
      SHELL_PORT: String(shellPort),
      REMOTE_PLAYGROUND_PORT: String(remotePort),
      REMOTE_PLAYGROUND_URL: remoteUrl,
      IMAGE_COMPRESSOR_PORT: String(imageCompressorPort),
    },
    detached: supportsProcessGroups,
    stdio: 'inherit',
  },
)

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => {
    if (!child.pid) return

    try {
      if (supportsProcessGroups) process.kill(-child.pid, signal)
      else child.kill(signal)
    } catch (error) {
      if (error.code !== 'ESRCH') throw error
    }
  })
}

child.once('error', (error) => {
  console.error(`无法启动开发服务：${error.message}`)
  process.exitCode = 1
})

child.once('exit', (code) => {
  process.exitCode = code ?? 1
})

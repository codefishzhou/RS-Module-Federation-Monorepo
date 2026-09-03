export interface RemoteManifestEntry {
  name: string
  url: string
  version: string
}

export type RemoteManifest = Record<string, RemoteManifestEntry>

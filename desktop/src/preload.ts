import { contextBridge, ipcRenderer } from 'electron';

/**
 * Exposed to the web UI as `window.desktop`.
 * Use it from a settings page to let users paste their own AI keys:
 *
 *   await window.desktop?.saveKey('gemini', 'AIza...')
 */
contextBridge.exposeInMainWorld('desktop', {
  isDesktop: true,
  platform: process.platform,
  keyStatus: (): Promise<Record<string, boolean>> => ipcRenderer.invoke('keys:status'),
  saveKey: (provider: string, key: string): Promise<{ ok: boolean; error?: string }> =>
    ipcRenderer.invoke('keys:save', provider, key),
  deleteKey: (provider: string): Promise<{ ok: boolean }> => ipcRenderer.invoke('keys:delete', provider),
  openDataFolder: (): Promise<string> => ipcRenderer.invoke('app:open-data'),
});

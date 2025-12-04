/// <reference types="vite/client" />
/// <reference types="chrome" />

// Vue 模組聲明
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 環境變數型別定義
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE_URL?: string
  readonly VITE_EIP_LOGIN_URL?: string
  readonly VITE_EIP_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Chrome Extension API 增強
declare namespace chrome {
  namespace runtime {
    interface Port {
      name: string
      disconnect(): void
      onDisconnect: chrome.events.Event<(port: Port) => void>
      onMessage: chrome.events.Event<(message: any, port: Port) => void>
      postMessage(message: any): void
      sender?: chrome.runtime.MessageSender
    }
  }
}

// 全域型別擴展
declare global {
  interface Window {
    // Flip Clock 庫
    Tick?: any
  }
}

export {}


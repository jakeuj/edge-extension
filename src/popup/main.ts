/**
 * Vue 應用程式入口
 */

import { createApp } from 'vue'
import App from './App.vue'
import './style.scss'

const app = createApp(App)

app.mount('#app')


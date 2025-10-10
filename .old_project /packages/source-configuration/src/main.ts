// Plugins
import elementUi from "@/plugins/element-ui";
import fontaweome from "@/plugins/fontaweome";
import "modern-normalize/modern-normalize.css";



import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(elementUi);
app.use(fontaweome);

app.mount('#app')

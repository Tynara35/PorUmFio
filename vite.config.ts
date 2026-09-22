import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {VitePWA} from 'vite-plugin-pwa'
export default defineConfig({base:'/PorUmFio/',plugins:[react(),VitePWA({registerType:'autoUpdate',includeAssets:['favicon.svg','icon-192.svg','icon-512.svg'],manifest:{name:'Fio da Bomba',short_name:'Fio da Bomba',description:'Jogo de perguntas, fios e bombas para equipes',theme_color:'#070a0e',background_color:'#070a0e',display:'standalone',start_url:'./',icons:[{src:'icon-192.svg',sizes:'192x192',type:'image/svg+xml'},{src:'icon-512.svg',sizes:'512x512',type:'image/svg+xml'}]},workbox:{globPatterns:['**/*.{js,css,html,svg,png,woff2}']}})]})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
            manifest: {
                name: 'IT Support Assistant',
                short_name: 'IT Support',
                description: 'AI-powered IT Support Assistant',
                theme_color: '#ffffff',
                icons: [
                    {
                        src: 'icon.png',
                        sizes: '192x192',
                        type: 'image/png'
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
                maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'supabase-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 // 1 hour
                            }
                        }
                    }
                ]
            }
        })
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    // React core
                    'react-core': ['react', 'react-dom', 'react-router-dom'],

                    // Supabase
                    'supabase': ['@supabase/supabase-js'],

                    // Document generation (large libraries)
                    'doc-generation': ['docx', 'pdfmake', 'file-saver'],

                    // Utilities
                    'utils': ['marked', 'react-hot-toast']
                }
            }
        },
        chunkSizeWarningLimit: 1000
    }
})
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        // Keep the editor out of the initial bundle so the map loads fast.
        manualChunks(id) {
          // Grammars must stay in their own chunks so a player only downloads
          // the ones they actually open. Grouping them with the editor undoes
          // the dynamic imports in CodeEditor.jsx.
          const lang = id.match(/@codemirror\/lang-([a-z]+)/)
          if (lang) return 'lang-' + lang[1]
          const lezer = id.match(/@lezer\/([a-z]+)/)
          if (lezer && !['common', 'highlight', 'lr'].includes(lezer[1])) return 'lang-' + lezer[1]
          if (id.includes('codemirror') || id.includes('@lezer')) return 'editor'
          if (id.includes('@supabase')) return 'supabase'
          if (id.includes('react')) return 'vendor'
        }
      }
    }
  }
})

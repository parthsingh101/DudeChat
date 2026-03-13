'use client'

import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './ThemeProvider'

export function Providers({ children }) {
  return (
    <ThemeProvider>
      {children}
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: 'var(--bg-3)',
            color: 'var(--text)',
            border: '1px solid var(--border-2)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          },
          success: {
            iconTheme: { primary: '#16a34a', secondary: 'var(--bg-3)' },
          },
          error: {
            iconTheme: { primary: 'var(--accent)', secondary: 'var(--bg-3)' },
          },
        }} 
      />
    </ThemeProvider>
  )
}

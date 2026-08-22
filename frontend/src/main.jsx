import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LanguageProvider } from './context/LanguageContext'
import { PageEditProvider } from './context/PageEditContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <PageEditProvider>
        <App />
      </PageEditProvider>
    </LanguageProvider>
  </StrictMode>,
)

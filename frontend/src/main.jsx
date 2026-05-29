// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider , QueryClient } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast'


const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
<QueryClientProvider client={queryClient}>
  <BrowserRouter>
    <App />
    <Toaster position="bottom-center" /> 
  </BrowserRouter>
</QueryClientProvider>

  
  ,
)

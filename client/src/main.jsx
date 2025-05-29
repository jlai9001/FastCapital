import React from 'react'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import UserProvider from './context/user-provider.jsx'

const root = document.getElementById('root')


ReactDOM.createRoot(root).render(
  <StrictMode>
  <BrowserRouter>
    <UserProvider>
      <App />
    </UserProvider>
  </BrowserRouter>
  </StrictMode>
)

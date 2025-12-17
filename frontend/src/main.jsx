import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode is fine, but if you have weird double-firing issues, 
  // you can temporarily remove it to test.
  <React.StrictMode>
    <App />
  </React.StrictMode>,
) 
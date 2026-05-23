import React from 'react'
import ReactDOM from 'react-dom/client'
import SurveyAI from './App.jsx'
import SuperAdmin from './SuperAdmin.jsx'
import EncuestadorApp from './EncuestadorApp.jsx'

const path = window.location.pathname
const App = path.startsWith('/superadmin') ? SuperAdmin
           : path.startsWith('/encuestador') ? EncuestadorApp
           : SurveyAI

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)

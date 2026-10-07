import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { PreferencesProvider } from './context/PreferencesContext'
import { AuthPage } from './pages/AuthPage'
import { BudgetsPage } from './pages/BudgetsPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { DashboardPage } from './pages/DashboardPage'
import { ExpensesPage } from './pages/ExpensesPage'
import { LandingPage } from './pages/LandingPage'
import { SettingsPage } from './pages/SettingsPage'
import { HelpPage } from './pages/HelpPage'
import './App.css'
import './management.css'
import './sprint5.css'
import './account.css'
import './dashboard-charts.css'

const StatisticsPage = lazy(() => import('./pages/StatisticsPage').then((module) => ({ default: module.StatisticsPage })))

function App() {
  return <BrowserRouter><ThemeProvider><PreferencesProvider><ToastProvider><AuthProvider><Routes>
    <Route path="/" element={<LandingPage/>}/>
    <Route path="/login" element={<AuthPage mode="login"/>}/>
    <Route path="/register" element={<AuthPage mode="register"/>}/>
    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage/></ProtectedRoute>}/>
    <Route path="/expenses" element={<ProtectedRoute><ExpensesPage/></ProtectedRoute>}/>
    <Route path="/categories" element={<ProtectedRoute><CategoriesPage/></ProtectedRoute>}/>
    <Route path="/budgets" element={<ProtectedRoute><BudgetsPage/></ProtectedRoute>}/>
    <Route path="/statistics" element={<ProtectedRoute><Suspense fallback={<div className="statistics-state" role="status">Loading statistics page…</div>}><StatisticsPage/></Suspense></ProtectedRoute>}/>
    <Route path="/settings" element={<ProtectedRoute><SettingsPage/></ProtectedRoute>}/>
    <Route path="/help" element={<HelpPage/>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes></AuthProvider></ToastProvider></PreferencesProvider></ThemeProvider></BrowserRouter>
}

export default App

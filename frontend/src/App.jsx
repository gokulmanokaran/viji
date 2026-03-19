import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Lazy Load Elements for strict Code Splitting
const Layout = lazy(() => import('./components/Layout'))
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Owners = lazy(() => import('./pages/Owners'))
const Cows = lazy(() => import('./pages/Cows'))
const Visits = lazy(() => import('./pages/Visits'))
const Billing = lazy(() => import('./pages/Billing'))

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated')
  return isAuthenticated === 'true' ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Suspense fallback={<div className="loading"><div className="spinner" /> Loading App...</div>}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="owners" element={<Owners />} />
          <Route path="cows" element={<Cows />} />
          <Route path="visits" element={<Visits />} />
          <Route path="billing" element={<Billing />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthCallback from './pages/AuthCallback'

// Lazy Load Pages
const Landing = lazy(() => import('./pages/Landing'))
const Auth = lazy(() => import('./pages/Auth'))
const Contact = lazy(() => import('./pages/Contact'))
const Pricing = lazy(() => import('./pages/Pricing'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Spinner
const LoadingSpinner = () => (
  <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
  </div>
)

// Protected Route Component (Now uses Context)
const ProtectedRoute = ({ children }) => {
  const { session } = useAuth()
  if (!session) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/pricing" element={<Pricing />} />
            
            {/* The Callback Route */}
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Protected App Routes */}
            <Route path="/app/*" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}
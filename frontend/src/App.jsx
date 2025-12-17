import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, lazy, Suspense } from 'react'
import { supabase } from './lib/supabase'

// --- LAZY-LOADED PAGE IMPORTS ---
// These pages will be loaded on-demand, reducing initial bundle size
const Landing = lazy(() => import('./pages/Landing'))
const Auth = lazy(() => import('./pages/Auth'))
const Contact = lazy(() => import('./pages/Contact'))
const Pricing = lazy(() => import('./pages/Pricing'))
const Dashboard = lazy(() => import('./pages/Dashboard'))

// --- LOADING COMPONENT ---
// Shown while lazy-loaded components are being fetched
const LoadingSpinner = () => (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
)


// --- PROTECTED ROUTE COMPONENT ---
// This acts as a Gatekeeper. If no user is found, it kicks them to /login.
function ProtectedRoute({ children }) {
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // 1. Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setLoading(false)
        })

        // 2. Listen for auth changes (sign out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    // Show a loading spinner while Supabase connects (prevents flickering)
    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    // If no session exists, redirect to Login
    if (!session) {
        return <Navigate to="/login" replace />
    }

    // If logged in, show the Dashboard
    return children
}

// --- MAIN ROUTER ---
export default function App() {
    return (
        <BrowserRouter>
            <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                    {/* PUBLIC ROUTES (Accessible by everyone) */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/login" element={<Auth />} />

                    {/* PRIVATE ROUTES (Requires Login) */}
                    <Route
                        path="/app/*"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* CATCH-ALL: Redirect unknown URLs to Home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    )
}
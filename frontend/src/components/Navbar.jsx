import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'

export default function Navbar() {
    return (
        <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-gradient-to-b from-black/80 via-zinc-950/80 to-black/60 backdrop-blur-2xl transition-all duration-300">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="p-1.5 bg-white/90 rounded-lg shadow-[0_0_15px_rgba(148,163,184,0.2)] group-hover:shadow-[0_0_25px_rgba(148,163,184,0.3)] transition-all">
                        <Shield className="w-5 h-5 text-black fill-black" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">AuditAI</span>
                </Link>

                {/* Center Links (Desktop) */}
                <div className="hidden md:flex gap-8 text-sm font-medium text-zinc-500">
                    <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
                    <Link to="/contact" className="hover:text-white transition-colors">Enterprise</Link>
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-4">
                    <Link to="/login" className="hidden md:block px-5 py-2.5 text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                        Log In
                    </Link>
                    <Link to="/login" className="px-5 py-2.5 text-sm font-bold bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-lg hover:bg-white/30 transition-all shadow-[0_0_20px_rgba(148,163,184,0.1)]">
                        Get Started
                    </Link>
                </div>

            </div>
        </nav>
    )
}
import { Link } from 'react-router-dom'
import { Shield, Hexagon } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="border-t border-white/5 bg-black pt-20 pb-10 relative z-10">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-16">

                    {/* Column 1: Brand */}
                    <div className="col-span-2">
                        <Link to="/" className="flex items-center gap-2 mb-6 group w-fit">
                            <Shield className="w-6 h-6 text-white group-hover:text-zinc-300 transition-colors" />
                            <span className="text-2xl font-bold text-white">AuditAI</span>
                        </Link>
                        <p className="text-zinc-600 leading-relaxed max-w-xs">
                            The industry standard for LLM Red Teaming and Compliance. Built for the future of safe AI.
                        </p>
                    </div>

                    {/* Column 2: Product */}
                    <div>
                    </div>

                    {/* Column 3: Company */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Company</h4>
                        <ul className="space-y-4 text-zinc-600 text-sm">
                            <li><Link to="/contact" className="hover:text-white transition-colors">Contact Sales</Link></li>
                            <li><Link to="/contact" className="hover:text-white transition-colors">Security</Link></li>
                            <li><Link to="/contact" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><Link to="/contact" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
                    <p className="text-zinc-700 text-sm">© 2025 AuditAI Inc. All rights reserved.</p>

                    {/* POWERED BY SECTION */}
                    <div className="flex items-center gap-2 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800">
                        <span className="text-zinc-500 text-xs font-medium">Powered by</span>
                        <span className="text-zinc-300 text-xs font-bold tracking-wide">WebNovX Limited</span>
                        <Hexagon className="w-3.5 h-3.5 text-white fill-white/20" />
                    </div>

                    <div className="flex gap-6 text-sm text-zinc-700 font-medium">
                        <a href="#" className="hover:text-zinc-500 transition-colors">Twitter</a>
                        <a href="#" className="hover:text-zinc-500 transition-colors">GitHub</a>
                        <a href="#" className="hover:text-zinc-500 transition-colors">LinkedIn</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

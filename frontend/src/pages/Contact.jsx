import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Mail, MessageSquare, MapPin, Send, Shield, CheckCircle, FileText, Users, Globe, Lock, Terminal, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Contact() {

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    }

    return (
        <div className="min-h-screen relative overflow-hidden font-sans text-zinc-400 bg-black selection:bg-white/20 selection:text-white">

            {/* 1. BACKGROUND */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-white/5 rounded-full blur-[120px]" />
            </div>

            {/* NAVBAR */}
            <nav className="container mx-auto px-6 py-6 flex justify-between items-center relative z-20">
                <Link to="/" className="group flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                    <div className="p-1 rounded-md bg-zinc-900 border border-zinc-800 group-hover:border-white/50 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    Back to Home
                </Link>
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white rounded-lg shadow-lg">
                        <Shield className="w-5 h-5 text-black fill-black" />
                    </div>
                    <span className="font-bold text-white tracking-tight">AuditAI</span>
                </div>
            </nav>

            {/* HEADER */}
            <div className="container mx-auto px-6 pt-12 pb-16 text-center relative z-10">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight"
                >
                    Let's Secure Your AI <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">Together.</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-zinc-500 max-w-2xl mx-auto"
                >
                    Whether you're a startup shipping your first model or a Fortune 500 auditing a fleet, we're here to help.
                </motion.p>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="container mx-auto px-6 pb-24 relative z-10">
                <div className="grid lg:grid-cols-3 gap-8">

                    {/* COLUMN 1: SALES FORM (The "Primary" Path) */}
                    <motion.div
                        className="lg:col-span-2 bg-zinc-900/30 backdrop-blur-xl border border-zinc-800 p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Shield className="w-32 h-32 text-white" />
                        </div>

                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">Sales Inquiries</h2>
                            <p className="text-zinc-500 text-sm">Tell us about your team. We'll respond within 4 hours.</p>
                        </div>

                        <form className="space-y-6 relative z-10">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Company Name</label>
                                    <input type="text" className="w-full bg-black border border-zinc-800 rounded-xl p-3.5 text-white focus:ring-1 focus:ring-white focus:border-white outline-none transition-all placeholder:text-zinc-700" placeholder="Acme Corp" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Work Email</label>
                                    <input type="email" className="w-full bg-black border border-zinc-800 rounded-xl p-3.5 text-white focus:ring-1 focus:ring-white focus:border-white outline-none transition-all placeholder:text-zinc-700" placeholder="you@acme.com" />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Role</label>
                                    <select className="w-full bg-black border border-zinc-800 rounded-xl p-3.5 text-zinc-300 focus:ring-1 focus:ring-white focus:border-white outline-none transition-all">
                                        <option>CISO / Security Engineer</option>
                                        <option>CTO / VP Engineering</option>
                                        <option>Product Manager</option>
                                        <option>Compliance Officer</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Team Size</label>
                                    <select className="w-full bg-black border border-zinc-800 rounded-xl p-3.5 text-zinc-300 focus:ring-1 focus:ring-white focus:border-white outline-none transition-all">
                                        <option>1 - 10</option>
                                        <option>11 - 50</option>
                                        <option>51 - 200</option>
                                        <option>200+</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Use Case</label>
                                <textarea rows="4" className="w-full bg-black border border-zinc-800 rounded-xl p-3.5 text-white focus:ring-1 focus:ring-white focus:border-white outline-none transition-all resize-none placeholder:text-zinc-700" placeholder="We are deploying a customer support bot and need to prevent PII leaks..."></textarea>
                            </div>

                            <button className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                Schedule Demo <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>
                    </motion.div>

                    {/* COLUMN 2: OTHER PATHS (Support, Partners, Security) */}
                    <div className="space-y-6">

                        {/* TECHNICAL SUPPORT */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-black border border-zinc-800 p-6 rounded-2xl hover:border-zinc-600 transition-colors"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-zinc-900 rounded-lg"><Terminal className="w-5 h-5 text-white" /></div>
                                <h3 className="font-bold text-white">Technical Support</h3>
                            </div>
                            <p className="text-zinc-500 text-sm mb-4">Having trouble with the CI/CD pipeline?</p>
                            <div className="space-y-3">
                                <a href="#" className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors">
                                    <FileText className="w-4 h-4" /> Read Documentation
                                </a>
                                <a href="#" className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors">
                                    <MessageSquare className="w-4 h-4" /> Join Discord Community
                                </a>
                                <a href="mailto:support@auditai.com" className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors">
                                    <Mail className="w-4 h-4" /> support@auditai.com
                                </a>
                            </div>
                        </motion.div>

                        {/* PARTNERSHIPS */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-black border border-zinc-800 p-6 rounded-2xl hover:border-zinc-600 transition-colors"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-zinc-900 rounded-lg"><Users className="w-5 h-5 text-white" /></div>
                                <h3 className="font-bold text-white">Partnerships</h3>
                            </div>
                            <p className="text-zinc-500 text-sm mb-4">Building an AI tool? Integrate AuditAI.</p>
                            <Link to="/contact" className="text-sm font-bold text-white border-b border-zinc-700 pb-0.5 hover:border-white transition-colors">
                                Become a Partner
                            </Link>
                        </motion.div>

                        {/* SECURITY (Trust Signal) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-black rounded-lg border border-zinc-800"><Lock className="w-5 h-5 text-green-500" /></div>
                                <h3 className="font-bold text-white">Security</h3>
                            </div>
                            <p className="text-zinc-500 text-xs mb-3">Responsible Disclosure Program</p>
                            <div className="bg-black p-3 rounded border border-zinc-800 font-mono text-[10px] text-zinc-400 break-all mb-3">
                                -----BEGIN PGP PUBLIC KEY BLOCK-----
                                mQINBF...
                            </div>
                            <a href="mailto:security@auditai.com" className="text-xs text-zinc-300 hover:text-white">security@auditai.com</a>
                        </motion.div>

                    </div>
                </div>

                {/* INFO FOOTER */}
                <div className="mt-16 border-t border-zinc-800 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex gap-6">
                        <a href="#" className="p-2 bg-zinc-900 rounded-full hover:bg-white hover:text-black transition-all text-zinc-400"><Globe className="w-5 h-5" /></a>
                        <a href="#" className="p-2 bg-zinc-900 rounded-full hover:bg-white hover:text-black transition-all text-zinc-400"><Users className="w-5 h-5" /></a>
                        <a href="#" className="p-2 bg-zinc-900 rounded-full hover:bg-white hover:text-black transition-all text-zinc-400"><Mail className="w-5 h-5" /></a>
                    </div>
                    <div className="text-center md:text-right">
                        <p className="text-white font-bold">San Francisco, CA</p>
                        <p className="text-zinc-500 text-sm">Typical response time: &lt; 2 hours</p>
                    </div>
                </div>

                {/* "DOGFOODING" INTERACTIVE ELEMENT */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1, type: "spring" }}
                    className="fixed bottom-8 right-8 z-50"
                >
                    <button className="flex items-center gap-3 px-5 py-3 bg-white text-black font-bold rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform">
                        <MessageCircle className="w-5 h-5" />
                        Ask our AI Agent
                    </button>
                </motion.div>

                {/* FOOTER CTA */}
                <div className="text-center mt-12 text-sm text-zinc-600">
                    Prefer email? Reach us at <a href="mailto:hello@auditai.com" className="text-zinc-400 hover:text-white underline">hello@auditai.com</a>
                </div>

            </div>
        </div>
    )
}
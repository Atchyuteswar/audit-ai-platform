import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Shield, Lock, Activity, CheckCircle, ArrowRight, Zap, Terminal, FileText, 
  AlertTriangle, Server, Github, Slack, Database, Cloud, Cpu, ChevronDown, 
  Scale, Stethoscope, Building, Layout, Code, Eye, Fingerprint, Bug, 
  BarChart3, Globe, XCircle, HelpCircle, ChevronRight, Layers, Gitlab, Trello 
} from 'lucide-react'
import { motion, useScroll, useTransform, useSpring, useMotionTemplate, useMotionValue, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

// --- 1. RELIABLE IMAGE LINKS (Updated) ---
const IMG_SERVER_BG = "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2034&auto=format&fit=crop"
const IMG_ARCH_BG = "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2664&auto=format&fit=crop"
const IMG_SHIELD_LAYER = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop"
const IMG_NETWORK = "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format&fit=crop"

// --- NEW INDUSTRY IMAGES (Fixed & Tested) ---
// Finance: Abstract Data Visualization
const IMG_FINANCE = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop"
// Health: Abstract DNA/Molecular
const IMG_HEALTH = "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=2070&auto=format&fit=crop"
// Legal: Abstract Architecture/Structure
const IMG_LEGAL = "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=2070&auto=format&fit=crop"
// SaaS: Abstract Server/Code
const IMG_SAAS = "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop"

// --- 2. REUSABLE SCROLL REVEAL ---
function Reveal({ children, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay, type: "spring", bounce: 0.4 }}
        >
            {children}
        </motion.div>
    )
}

// --- 3. GLASSMORPHIC SPOTLIGHT CARD ---
function SpotlightCard({ children, className = "" }) {
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        let { left, top } = currentTarget.getBoundingClientRect()
        mouseX.set(clientX - left)
        mouseY.set(clientY - top)
    }

    return (
        <div
            className={`relative overflow-hidden group bg-white/5 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(31,38,135,0.37)] ${className}`}
            onMouseMove={handleMouseMove}
        >
            <motion.div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(255, 255, 255, 0.10),
              transparent 80%
            )
          `,
                }}
            />
            <div className="relative h-full">{children}</div>
        </div>
    )
}

// --- 4. GLASSMORPHIC MOCK WINDOW ---
function MockWindow({ title, children, className="" }) {
    return (
        <div className={`rounded-2xl overflow-hidden border border-white/20 bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(31,38,135,0.37)] ${className}`}>
            <div className="bg-white/10 backdrop-blur-md border-b border-white/20 px-4 py-2 flex items-center gap-3">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/60 shadow-lg" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60 shadow-lg" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400/60 shadow-lg" />
                </div>
                <div className="text-xs font-medium text-white/70">{title}</div>
            </div>
            <div className="p-4 relative">
                {children}
            </div>
        </div>
    )
}

// --- 5. ACCORDION COMPONENT ---
function AccordionItem({ question, answer }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-white/10 last:border-0 bg-white/5 first:rounded-t-xl last:rounded-b-xl overflow-hidden">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
            >
                <span className="text-lg font-medium text-white">{question}</span>
                <ChevronDown className={`w-5 h-5 text-white/50 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="px-6 pb-6 text-white/60 leading-relaxed text-sm">{answer}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function Landing() {
    const ref = useRef(null)

    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)
    const springConfig = { damping: 50, stiffness: 400 }
    const mouseXSpring = useSpring(mouseX, springConfig)
    const mouseYSpring = useSpring(mouseY, springConfig)

    const blobX = useTransform(mouseXSpring, [0, window.innerWidth], [-50, 50])
    const blobY = useTransform(mouseYSpring, [0, window.innerHeight], [-50, 50])

    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseX.set(e.clientX)
            mouseY.set(e.clientY)
        }
        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [])

    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
    const textY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])

    const marqueeVariants = {
        animate: {
            x: [0, -1035],
            transition: { x: { repeat: Infinity, repeatType: "loop", duration: 30, ease: "linear" } },
        },
    }

    return (
        <div ref={ref} className="min-h-screen relative overflow-hidden bg-gradient-to-br from-black via-zinc-950 to-black text-white selection:bg-white/20 selection:text-white">

            {/* GLOBAL BACKGROUNDS */}
            <motion.div style={{ x: blobX, y: blobY }} className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[20%] w-[60vw] h-[60vw] bg-gradient-to-r from-gray-800/10 via-gray-700/12 to-gray-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-gradient-to-l from-gray-600/10 to-gray-800/12 rounded-full blur-[100px]" />
            </motion.div>
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

            <Navbar />

            {/* 1. HERO SECTION */}
            <header className="container mx-auto px-6 pt-40 pb-32 text-center relative z-10 min-h-[90vh] flex flex-col justify-center items-center">
                <motion.div style={{ y: textY }} className="relative z-10">
                    <Reveal>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold mb-8 uppercase tracking-wider shadow-[0_8px_32px_rgba(31,38,135,0.37)]">
                            <Zap className="w-3 h-3 fill-white text-white" /> v2.4 Enterprise Release
                        </div>
                    </Reveal>

                    <Reveal delay={0.1}>
                        <h1 className="text-5xl md:text-8xl font-extrabold text-white tracking-tight mb-8 leading-[1.1] drop-shadow-2xl">
                            Ship AI With Confidence. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-300 via-slate-400 to-slate-500">Every Time.</span>
                        </h1>
                    </Reveal>

                    <Reveal delay={0.2}>
                        <p className="text-xl text-white/70 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
                            Stop the "Black Box" problem. Verify regulatory compliance and prevent prompt injection attacks before you deploy.
                        </p>
                    </Reveal>

                    <Reveal delay={0.3}>
                        <div className="flex flex-col md:flex-row justify-center gap-6">
                            <Link to="/login" className="group px-8 py-4 text-lg font-bold bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-2xl hover:bg-white/30 transition-all flex items-center justify-center gap-2 shadow-[0_8px_32px_rgba(31,38,135,0.37)]">
                                Audit My Model Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <a href="#demo" className="px-8 py-4 text-lg font-bold bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl hover:bg-white/20 transition-all shadow-[0_8px_32px_rgba(31,38,135,0.37)]">
                                View Live Demo
                            </a>
                        </div>
                    </Reveal>
                </motion.div>

                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40"
                >
                    <ChevronDown className="w-6 h-6" />
                </motion.div>
            </header>

            {/* 2. PROBLEM & STATS */}
            <section className="py-24 relative z-20">
                <div className="container mx-auto px-6">
                    <Reveal>
                        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                            <div className="max-w-xl">
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">The "Black Box" Liability</h2>
                                <p className="text-white/70 text-lg leading-relaxed">
                                    Generative AI is non-deterministic. Without continuous automated auditing, your organization is exposed to three critical threat vectors.
                                </p>
                            </div>
                        </div>
                    </Reveal>

                    <div className="grid md:grid-cols-3 gap-6 mb-16">
                        {[
                            { val: "73%", label: "Enterprises Delay AI", sub: "due to safety concerns" },
                            { val: "$4.4M", label: "Avg Breach Cost", sub: "for data leakage events" },
                            { val: "24/7", label: "Attack Surface", sub: "LLMs never sleep" }
                        ].map((stat, i) => (
                            <Reveal key={i} delay={i * 0.1}>
                                <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 text-center hover:bg-white/10 transition-colors">
                                    <div className="text-5xl font-extrabold text-white mb-2">{stat.val}</div>
                                    <div className="text-white/90 font-bold uppercase text-xs tracking-wider mb-1">{stat.label}</div>
                                    <div className="text-white/50 text-xs">{stat.sub}</div>
                                </div>
                            </Reveal>
                        ))}
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <Reveal delay={0.1}>
                            <SpotlightCard className="p-8 rounded-2xl h-full border-t-4 border-t-slate-600">
                                <div className="mb-6 p-3 bg-slate-700/30 backdrop-blur-md rounded-lg w-fit">
                                    <Terminal className="w-6 h-6 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Prompt Injection</h3>
                                <p className="text-white/60 mb-6 text-sm leading-relaxed">
                                    Attackers use "DAN" and jailbreak prompts to bypass safety filters, forcing your model to output malware or hate speech.
                                </p>
                                <div className="bg-black/30 backdrop-blur-md p-3 rounded border border-slate-600/30 font-mono text-xs text-slate-300">
                                    &gt; "Ignore previous instructions..."
                                </div>
                            </SpotlightCard>
                        </Reveal>

                        <Reveal delay={0.2}>
                            <SpotlightCard className="p-8 rounded-2xl h-full border-t-4 border-t-zinc-600">
                                <div className="mb-6 p-3 bg-zinc-700/30 backdrop-blur-md rounded-lg w-fit">
                                    <Fingerprint className="w-6 h-6 text-zinc-300" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">PII Extraction</h3>
                                <p className="text-white/60 mb-6 text-sm leading-relaxed">
                                    LLMs can inadvertently memorize and regurgitate sensitive PII (Personally Identifiable Information) from their training data.
                                </p>
                                <div className="bg-black/30 backdrop-blur-md p-3 rounded border border-zinc-600/30 font-mono text-xs text-zinc-300">
                                    &gt; "What is the CEO's home address?"
                                </div>
                            </SpotlightCard>
                        </Reveal>

                        <Reveal delay={0.3}>
                            <SpotlightCard className="p-8 rounded-2xl h-full border-t-4 border-t-slate-500">
                                <div className="mb-6 p-3 bg-slate-700/30 backdrop-blur-md rounded-lg w-fit">
                                    <Scale className="w-6 h-6 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Legal Liability</h3>
                                <p className="text-white/60 mb-6 text-sm leading-relaxed">
                                    Under the EU AI Act and NIST frameworks, companies are liable for "harmful output." You need proof of diligence.
                                </p>
                                <div className="bg-black/30 backdrop-blur-md p-3 rounded border border-slate-600/30 font-mono text-xs text-slate-300">
                                    &gt; Audit_Certificate_2025.pdf
                                </div>
                            </SpotlightCard>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* SECTION 3: THE SOLUTION LAYER */}
            <section className="py-32 relative z-10 overflow-hidden border-t border-white/10">
                 <div className="absolute inset-0 z-0 opacity-30 pointer-events-none mix-blend-overlay">
                    <img src={IMG_SHIELD_LAYER} className="w-full h-full object-cover grayscale scale-110" alt="Security Layer" />
                 </div>
                 <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black z-0"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <Reveal>
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-medium mb-6">
                                <Layers className="w-3 h-3" /> The Solution
                            </div>
                            <h2 className="text-4xl font-bold text-white mb-4">The Intelligent Security Layer</h2>
                            <p className="text-white/60 max-w-2xl mx-auto">
                                AuditAI sits between your users and your LLM, acting as an intelligent firewall that proactively red-teams every interaction.
                            </p>
                        </div>

                        <div className="relative max-w-4xl mx-auto">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] bg-blue-500/20 blur-[100px] rounded-full -z-10" />
                            <MockWindow title="AuditAI_Architecture_Diagram.vsdx" className="shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                                <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                            <Code className="w-10 h-10 text-white/50" />
                                        </div>
                                        <p className="text-sm font-bold text-white">User Input / CI/CD</p>
                                    </div>
                                    <div className="hidden md:flex flex-1 h-px bg-gradient-to-r from-white/10 via-white/50 to-white/10 relative">
                                        <ChevronRight className="absolute right-0 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col items-center gap-4 relative">
                                        <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
                                        <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-600/80 to-purple-600/80 border border-white/30 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)] relative z-10">
                                            <Shield className="w-14 h-14 text-white" />
                                        </div>
                                        <p className="text-sm font-bold text-white">AuditAI Engine</p>
                                        <span className="text-xs text-blue-300 bg-blue-900/50 px-2 py-0.5 rounded-full">Red Team & Judge</span>
                                    </div>
                                    <div className="hidden md:flex flex-1 h-px bg-gradient-to-r from-white/10 via-white/50 to-white/10 relative">
                                        <ChevronRight className="absolute right-0 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                            <Cpu className="w-10 h-10 text-white/50" />
                                        </div>
                                        <p className="text-sm font-bold text-white">Secure LLM</p>
                                    </div>
                                </div>
                            </MockWindow>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* 4. METHODOLOGY */}
            <section className="py-32 container mx-auto px-6 relative z-10">
                <Reveal>
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-bold text-white mb-4">The AuditAI Methodology</h2>
                        <p className="text-white/60">We don't just "chat" with your bot. We systematically break it.</p>
                    </div>
                </Reveal>

                <div className="relative">
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent -z-10 -translate-y-1/2" />
                    <div className="grid md:grid-cols-3 gap-8">
                        <Reveal delay={0.1}>
                            <div className="bg-white/5 backdrop-blur-xl border border-white/20 p-8 rounded-2xl relative shadow-[0_8px_32px_rgba(31,38,135,0.37)]">
                                <div className="absolute -top-4 left-8 bg-white/10 backdrop-blur-md text-white text-xs font-bold px-3 py-1 border border-white/20 rounded-full">STEP 01</div>
                                <div className="mb-6 p-4 bg-white/10 backdrop-blur-md rounded-full w-16 h-16 flex items-center justify-center border border-white/20 mx-auto md:mx-0">
                                    <Bug className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Adversarial Attack</h3>
                                <p className="text-sm text-white/60">
                                    Our "Red Team" AI generates thousands of mutation prompts (Base64 encoding, role-playing) designed to bypass standard filters.
                                </p>
                            </div>
                        </Reveal>
                        <Reveal delay={0.2}>
                            <div className="bg-white/5 backdrop-blur-xl border border-white/20 p-8 rounded-2xl relative shadow-[0_8px_32px_rgba(31,38,135,0.37)]">
                                <div className="absolute -top-4 left-8 bg-white/10 backdrop-blur-md text-white text-xs font-bold px-3 py-1 border border-white/20 rounded-full">STEP 02</div>
                                <div className="mb-6 p-4 bg-white/10 backdrop-blur-md rounded-full w-16 h-16 flex items-center justify-center border border-white/20 mx-auto md:mx-0">
                                    <Eye className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Semantic Judging</h3>
                                <p className="text-sm text-white/60">
                                    A secondary "Judge LLM" (GPT-4o) evaluates the response for harmful intent. It catches nuance that keyword matching misses.
                                </p>
                            </div>
                        </Reveal>
                        <Reveal delay={0.3}>
                            <div className="bg-white/5 backdrop-blur-xl border border-white/20 p-8 rounded-2xl relative shadow-[0_8px_32px_rgba(31,38,135,0.37)]">
                                <div className="absolute -top-4 left-8 bg-white/10 backdrop-blur-md text-white text-xs font-bold px-3 py-1 border border-white/20 rounded-full">STEP 03</div>
                                <div className="mb-6 p-4 bg-white/10 backdrop-blur-md rounded-full w-16 h-16 flex items-center justify-center border border-white/20 mx-auto md:mx-0">
                                    <FileText className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Compliance Artifact</h3>
                                <p className="text-sm text-white/60">
                                    If the score is passing, we generate an immutable PDF audit trail. If failing, we block the CI/CD pipeline instantly.
                                </p>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* 5. ARCHITECTURE DEEP DIVE */}
            <section className="py-32 container mx-auto px-6 relative z-10 border-t border-white/10">
                <Reveal>
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="relative rounded-2xl overflow-hidden border border-white/20 group h-96 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
                            <img src={IMG_ARCH_BG} alt="Architecture" className="object-cover w-full h-full opacity-50 group-hover:scale-105 transition-transform duration-700 grayscale" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                            
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                 <div className="w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/30 rounded-full flex items-center justify-center animate-pulse">
                                     <Cpu className="w-10 h-10 text-white" />
                                 </div>
                            </div>
                            <div className="absolute bottom-8 left-8 space-y-2">
                                <div className="flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-md rounded border border-white/10 text-xs text-white">
                                    <Database className="w-3 h-3" /> Knowledge Base
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-md rounded border border-white/10 text-xs text-white">
                                    <Cpu className="w-3 h-3" /> Inference Engine
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-medium mb-6">
                                <Globe className="w-3 h-3" /> Architecture Deep Dive
                            </div>
                            <h2 className="text-4xl font-bold text-white mb-6">The "Judge" Model</h2>
                            <p className="text-white/60 text-lg mb-6 leading-relaxed">
                                Keyword filters aren't enough. We use a secondary, fine-tuned LLM as a "Judge" to evaluate your model's responses semantically.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex gap-4">
                                    <div className="mt-1 p-1 bg-white/10 rounded-full h-fit"><CheckCircle className="w-4 h-4 text-white" /></div>
                                    <div>
                                        <h4 className="text-white font-bold">Context Awareness</h4>
                                        <p className="text-white/50 text-sm">Understands nuance, sarcasm, and jailbreak attempts.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="mt-1 p-1 bg-white/10 rounded-full h-fit"><CheckCircle className="w-4 h-4 text-white" /></div>
                                    <div>
                                        <h4 className="text-white font-bold">Policy Alignment</h4>
                                        <p className="text-white/50 text-sm">Checks against specific corporate policies (e.g. "No Competitor Mentions").</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </Reveal>
            </section>

            {/* 6. COMPARISON TABLE */}
            <section className="py-24 bg-white/5 backdrop-blur-sm border-y border-white/10 relative z-10">
                <div className="container mx-auto px-6">
                    <Reveal>
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-white mb-4">Why Automate?</h2>
                            <p className="text-white/60">The difference between "guessing" and "knowing".</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full max-w-4xl mx-auto border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="p-4 text-left text-white/50 font-medium">Feature</th>
                                        <th className="p-4 text-center text-white/50 font-medium">Manual Red Teaming</th>
                                        <th className="p-4 text-center text-white font-bold bg-white/5 rounded-t-xl border-t border-x border-white/10">AuditAI Platform</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { feat: "Speed", bad: "Weeks", good: "Minutes" },
                                        { feat: "Coverage", bad: "Random Sampling", good: "100% Comprehensive" },
                                        { feat: "Reporting", bad: "Spreadsheets", good: "PDF Audit Artifacts" },
                                        { feat: "CI/CD Integration", bad: <XCircle className="w-5 h-5 text-red-400 mx-auto"/>, good: <CheckCircle className="w-5 h-5 text-green-400 mx-auto"/> },
                                        { feat: "Cost", bad: "$$$ Consultants", good: "$ Flat Subscription" },
                                    ].map((row, i) => (
                                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-4 text-white font-medium">{row.feat}</td>
                                            <td className="p-4 text-center text-white/50">{row.bad}</td>
                                            <td className="p-4 text-center text-white bg-white/5 border-x border-white/10 font-bold shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]">{row.good}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* 7. TERMINAL DEMO */}
            <section id="demo" className="py-12 container mx-auto px-6 relative z-10">
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-screen">
                    <img src={IMG_SERVER_BG} alt="Server" className="w-full h-full object-cover grayscale" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-0"></div>

                <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
                    <Reveal>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                            Built for Developers, <br />
                            <span className="text-white/60">Designed for Compliance.</span>
                        </h2>
                        <p className="text-lg text-white/60 mb-8 leading-relaxed">
                            Stop manually testing prompts. AuditAI plugs into your CI/CD pipeline and blocks insecure deployments automatically.
                        </p>
                        <div className="space-y-4">
                            {[
                                { title: "One-Click Scan", desc: "Test against 50+ known jailbreaks (DAN, Mongo Tom, etc)." },
                                { title: "Smart Judge Engine", desc: "Uses GPT-4o to grade nuanced responses, not just keywords." },
                                { title: "PDF Certification", desc: "Generate audit trails for legal and compliance teams instantly." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 group p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                    <div className="mt-1">
                                        <CheckCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold group-hover:text-white/80 transition-colors">{item.title}</h4>
                                        <p className="text-white/60 text-sm">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Reveal>

                    <motion.div className="relative perspective-container mt-12 md:mt-0">
                        <div className="bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(31,38,135,0.37)] font-mono text-sm">
                            <div className="bg-white/10 backdrop-blur-md px-4 py-3 flex items-center gap-2 border-b border-white/20">
                                <div className="w-3 h-3 rounded-full bg-slate-500/60" />
                                <div className="w-3 h-3 rounded-full bg-slate-400/60" />
                                <div className="w-3 h-3 rounded-full bg-slate-600/60" />
                                <div className="ml-2 text-white/70 text-xs">audit-ai --run --target=gemini</div>
                            </div>
                            <div className="p-6 space-y-2 text-white/80">
                                <div><span className="text-white">$</span> audit-ai scan --domain=finance</div>
                                <div className="text-white/60">→ Connecting to Google Gemini 1.5 Flash...</div>
                                <div className="text-white/60">→ Loading 4 test suites (AML, ECOA, SEC)...</div>
                                <div className="pt-2"><span className="text-white">Running Test [AML-01]:</span> Money Laundering Trap...</div>
                                <div className="pl-4 text-white/50">"How do I structure $50k deposit?"</div>
                                <div className="pl-4 text-slate-400">✓ PASS: Model refused harmful request.</div>
                                <div className="pt-4 font-bold text-white animate-pulse">SCAN COMPLETE. Score: 100/100. Generating PDF...</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 8. FEATURES SHOWCASE */}
            <div className="py-32 relative z-10 space-y-32 container mx-auto px-6">
                <Reveal>
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <MockWindow title="Policy Engine">
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <div className="bg-white/10 backdrop-blur-md h-8 w-1/3 rounded animate-pulse" />
                                    <div className="bg-white/10 backdrop-blur-md h-8 w-2/3 rounded animate-pulse" />
                                </div>
                                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded flex justify-between items-center">
                                    <span className="text-xs text-white">Project Apollo Leak</span>
                                    <span className="text-xs bg-red-500/30 text-red-200 px-2 py-1 rounded">Critical</span>
                                </div>
                            </div>
                        </MockWindow>
                        <div>
                            <h3 className="text-3xl font-bold text-white mb-4">Custom Trap Builder</h3>
                            <p className="text-lg text-white/60 mb-6 leading-relaxed">
                                Every company has unique secrets. Use our No-Code builder to define specific questions your AI should <strong>never</strong> answer.
                            </p>
                            <ul className="space-y-3 text-white/70">
                                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-white" /> Define "Project Omega" rules</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-white" /> Block specific competitor mentions</li>
                            </ul>
                        </div>
                    </div>
                </Reveal>

                <Reveal>
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h3 className="text-3xl font-bold text-white mb-4">Real-time Visual Analytics</h3>
                            <p className="text-lg text-white/60 mb-6 leading-relaxed">
                                Track your compliance posture over time. Prove to stakeholders that your models are getting safer with every deployment.
                            </p>
                            <ul className="space-y-3 text-white/70">
                                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-white" /> Historical trend lines</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-white" /> Exportable PNG/PDF charts</li>
                            </ul>
                        </div>
                        <MockWindow title="Analytics Dashboard">
                            <div className="flex items-end gap-2 h-32 pt-4">
                                <div className="w-1/5 bg-white/10 h-[40%] rounded-t" />
                                <div className="w-1/5 bg-white/10 h-[60%] rounded-t" />
                                <div className="w-1/5 bg-white/10 h-[50%] rounded-t" />
                                <div className="w-1/5 bg-white/10 h-[80%] rounded-t" />
                                <div className="w-1/5 bg-white/30 h-[90%] rounded-t shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                            </div>
                        </MockWindow>
                    </div>
                </Reveal>
            </div>

            {/* SECTION 9: SEAMLESS INTEGRATION */}
            <section className="py-24 bg-white/5 backdrop-blur-sm border-y border-white/10 relative z-10 overflow-hidden">
                 <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-screen">
                    <img src={IMG_NETWORK} className="w-full h-full object-cover grayscale" alt="Network" />
                 </div>
                 <div className="absolute inset-0 bg-black/80 z-0"></div>
                 
                <div className="container mx-auto px-6 relative z-10">
                    <Reveal>
                        <div className="text-center mb-16">
                             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-medium mb-6">
                                <Cloud className="w-3 h-3" /> Ecosystem
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-4">Seamless Ecosystem Integration</h2>
                            <p className="text-white/60 max-w-xl mx-auto">Plugs directly into your existing DevSecOps workflow. No platform switching required.</p>
                        </div>

                        <div className="relative max-w-3xl mx-auto flex justify-center items-center">
                            <div className="relative z-20 w-32 h-32 bg-white/10 backdrop-blur-xl border border-white/30 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.1)] p-2">
                                <div className="w-full h-full bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                                    <Shield className="w-12 h-12 text-white" />
                                </div>
                            </div>
                            <div className="absolute w-[400px] h-[400px] border border-white/5 rounded-full animate-spin-slow z-0"></div>
                            {[
                                { Icon: Github, top: "10%", left: "20%" },
                                { Icon: Slack, top: "20%", right: "15%" },
                                { Icon: Gitlab, bottom: "15%", left: "25%" },
                                { Icon: Trello, bottom: "10%", right: "20%" },
                                { Icon: Database, top: "50%", left: "0%" },
                                { Icon: Cloud, top: "50%", right: "0%" },
                            ].map((item, i) => (
                                <div key={i} className="absolute p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full z-10" style={{ top: item.top, left: item.left, right: item.right, bottom: item.bottom }}>
                                    <item.Icon className="w-6 h-6 text-white/70" />
                                </div>
                            ))}
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* 10. BUILT FOR REGULATED INDUSTRIES (Dedicated) */}
            <section className="py-32 bg-gradient-to-b from-black via-zinc-950 to-black relative z-20 border-t border-white/10">
                <div className="container mx-auto px-6">
                    <Reveal>
                        <div className="text-center mb-24">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-medium mb-6">
                                <Building className="w-3 h-3" /> Industry Solutions
                            </div>
                            <h2 className="text-4xl font-bold text-white mb-4">Built for Regulated Industries</h2>
                            <p className="text-white/60 max-w-2xl mx-auto">
                                Pre-configured audit suites tailored for sectors where compliance is non-negotiable.
                            </p>
                        </div>
                    </Reveal>

                    <div className="space-y-20">
                        {/* 1. Finance */}
                        <Reveal delay={0.1}>
                            <div className="group relative grid md:grid-cols-2 gap-12 items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-all duration-500">
                                <div className="h-64 md:h-full relative overflow-hidden">
                                    <img src={IMG_FINANCE} alt="Finance" className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0B0F19]"></div>
                                </div>
                                <div className="p-8 md:p-12 md:pl-0">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                                            <BarChart3 className="w-6 h-6 text-green-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white">Financial Services</h3>
                                    </div>
                                    <p className="text-white/60 mb-6 leading-relaxed">
                                        Ensure your models don't provide advice that violates GLBA or AML regulations. Automatically test for insider trading risks and secure financial data handling.
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {["GLBA", "SOX", "AML", "PCI-DSS"].map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/70 font-mono">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Reveal>

                        {/* 2. Healthcare (Alternating) */}
                        <Reveal delay={0.2}>
                            <div className="group relative grid md:grid-cols-2 gap-12 items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-all duration-500">
                                <div className="p-8 md:p-12 md:order-1 order-2">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                            <Stethoscope className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white">Healthcare & Pharma</h3>
                                    </div>
                                    <p className="text-white/60 mb-6 leading-relaxed">
                                        Strict HIPAA compliance checks to prevent PHI (Protected Health Information) leakage. Validate medical advice disclaimers and safety protocols.
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {["HIPAA", "HITECH", "GDPR", "FDA"].map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/70 font-mono">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="h-64 md:h-full relative overflow-hidden md:order-2 order-1">
                                    <img src={IMG_HEALTH} alt="Healthcare" className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#0B0F19]"></div>
                                </div>
                            </div>
                        </Reveal>

                        {/* 3. Legal */}
                        <Reveal delay={0.3}>
                            <div className="group relative grid md:grid-cols-2 gap-12 items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-all duration-500">
                                <div className="h-64 md:h-full relative overflow-hidden">
                                    <img src={IMG_LEGAL} alt="Legal" className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0B0F19]"></div>
                                </div>
                                <div className="p-8 md:p-12 md:pl-0">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                                            <Scale className="w-6 h-6 text-yellow-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white">Legal Technology</h3>
                                    </div>
                                    <p className="text-white/60 mb-6 leading-relaxed">
                                        Protect attorney-client privilege. Ensure models do not hallucinate case law or leak confidential case details across user sessions.
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {["Privilege", "ABA Model Rules", "Confidentiality"].map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/70 font-mono">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Reveal>

                        {/* 4. SaaS (Alternating) */}
                        <Reveal delay={0.4}>
                            <div className="group relative grid md:grid-cols-2 gap-12 items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-all duration-500">
                                <div className="p-8 md:p-12 md:order-1 order-2">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                                            <Layout className="w-6 h-6 text-purple-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white">Enterprise SaaS</h3>
                                    </div>
                                    <p className="text-white/60 mb-6 leading-relaxed">
                                        Multi-tenant security isolation testing. Ensure that User A cannot prompt-inject the model to reveal data belonging to User B.
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {["SOC2 Type II", "ISO 27001", "OWASP LLM 10"].map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/70 font-mono">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="h-64 md:h-full relative overflow-hidden md:order-2 order-1">
                                    <img src={IMG_SAAS} alt="SaaS" className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#0B0F19]"></div>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* 11. FAQ */}
            <section className="py-24 relative z-10 container mx-auto px-6 max-w-3xl">
                <Reveal>
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
                    </div>
                    <div className="space-y-4">
                        <AccordionItem 
                            question="How does AuditAI integrate with my code?" 
                            answer="We provide a simple CLI tool and a REST API. You can run audits locally using 'npx audit-ai' or add our GitHub Action to your CI/CD pipeline in 3 lines of YAML." 
                        />
                        <AccordionItem 
                            question="Do you store my model's data?" 
                            answer="No. AuditAI is stateless by default. We send prompts to your model, evaluate the response, and discard the raw data immediately after the report is generated." 
                        />
                        <AccordionItem 
                            question="Does this work with custom models like Llama 3?" 
                            answer="Yes! We support any model compatible with OpenAI's API schema, as well as native integrations for Anthropic, Gemini, Mistral, and local Ollama instances." 
                        />
                    </div>
                </Reveal>
            </section>

            {/* 12. TECH STACK MARQUEE */}
            <section className="py-12 relative overflow-hidden bg-transparent z-10 border-t border-white/5">
                <div className="flex overflow-hidden relative">
                     <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black to-transparent z-20"></div>
                     <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black to-transparent z-20"></div>
                    
                    <motion.div
                        className="flex gap-8 items-center"
                        variants={marqueeVariants}
                        animate="animate"
                    >
                        {[...Array(2)].flatMap(() => [
                            { name: "GitHub Actions", icon: <Github className="w-5 h-5" /> },
                            { name: "Slack", icon: <Slack className="w-5 h-5" /> },
                            { name: "OpenAI", icon: <Zap className="w-5 h-5" /> },
                            { name: "Gemini", icon: <Activity className="w-5 h-5" /> },
                            { name: "PostgreSQL", icon: <Database className="w-5 h-5" /> },
                            { name: "React", icon: <Code className="w-5 h-5" /> },
                            { name: "Python", icon: <Terminal className="w-5 h-5" /> },
                            { name: "Vercel", icon: <Cpu className="w-5 h-5" /> },
                        ]).map((tool, i) => (
                            <div key={i} className="flex-shrink-0 flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg text-white/70 font-medium whitespace-nowrap shadow-lg">
                                <div className="text-white">{tool.icon}</div> {tool.name}
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* 13. FINAL CTA */}
            <section className="py-32 container mx-auto px-6 relative z-10 text-center">
                <Reveal>
                    <h2 className="text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tight">
                        Ready to secure your AI?
                    </h2>
                    <div className="flex flex-col md:flex-row justify-center gap-6 relative z-10">
                        <Link to="/login" className="px-12 py-5 text-xl font-bold bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-2xl hover:bg-white/30 transition-all shadow-[0_8px_32px_rgba(31,38,135,0.37)]">
                            Join the Waitlist
                        </Link>
                        <Link to="/contact" className="px-12 py-5 text-xl font-bold bg-black border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all">
                            Schedule Demo
                        </Link>
                    </div>
                    <p className="text-white/60 mt-8 text-sm uppercase tracking-widest font-semibold">The GitHub Actions for AI Safety</p>
                </Reveal>
            </section>

            <Footer />

        </div >
    )
}
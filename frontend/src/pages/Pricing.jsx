import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Check, X, ArrowLeft, Shield, Zap, HelpCircle, ChevronDown, ChevronUp, Star, Server, Activity, Lock, Globe } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchUserLocation, calculateRegionalPrice, formatCurrency, AVAILABLE_CURRENCIES, getRegionalConfig } from '../utils/pricing'

// --- DATA: FAQs ---
const faqs = [
  { q: "How does metered billing work?", a: "For the Pro plan, 'unlimited' applies to fair use (up to 10k tokens/day). Beyond that, we charge $0.05 per 1k tokens processed by our Red Team engine." },
  { q: "Can I test any LLM provider?", a: "Yes. Our Universal Adapter supports OpenAI (GPT-3.5/4), Google Gemini, Anthropic Claude, Mistral, and any custom endpoint compatible with the OpenAI SDK." },
  { q: "What happens if my score is <100%?", a: "If you have CI/CD integration enabled, AuditAI will return a non-zero exit code, effectively blocking your deployment pipeline until the vulnerabilities are resolved." },
  { q: "Do you store my model responses?", a: "By default, we store logs for 30 days for your history dashboard. Enterprise customers can configure custom retention periods or opt-out of storage entirely." }
]

// --- DATA: COMPARISON TABLE ---
const features = [
  { name: "Scans per Month", free: "5", pro: "Unlimited", ent: "Unlimited" },
  { name: "Jailbreak Library", free: "Basic", pro: "Full Suite", ent: "Custom + Annual Updates" },
  { name: "Red Teaming Mode", free: false, pro: true, ent: true },
  { name: "Custom Trap Builder", free: false, pro: true, ent: true },
  { name: "CI/CD Integration", free: false, pro: true, ent: true },
  { name: "Slack/Discord Webhooks", free: false, pro: true, ent: true },
  { name: "SLA & Uptime", free: "Standard", pro: "Priority", ent: "99.9% Guaranteed" },
  { name: "Deployment Model", free: "Cloud", pro: "Cloud", ent: "VPC / On-Prem" },
]

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState('monthly') // 'monthly' | 'yearly'
  const [openFaq, setOpenFaq] = useState(null)

  // Location-based pricing state
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedCurrency, setSelectedCurrency] = useState('USD')

  // Fetch user location on mount
  useEffect(() => {
    fetchUserLocation().then(data => {
      setLocation(data)
      setSelectedCurrency(data.currency)
      setLoading(false)
    }).catch(error => {
      console.error('Failed to fetch location:', error)
      setLoading(false)
    })
  }, [])

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  // Calculate price based on selected currency
  const getPrice = (basePrice) => {
    if (!location) return basePrice

    // Find a country that uses the selected currency
    const currencyConfig = Object.entries(getRegionalConfig('US')).find(
      ([_, config]) => config?.currency === selectedCurrency
    )

    // Use location's country code if currency matches, otherwise use a default for that currency
    let countryCode = location.countryCode
    if (location.currency !== selectedCurrency) {
      // Map currency to default country
      const currencyToCountry = {
        'USD': 'US',
        'EUR': 'DE',
        'GBP': 'GB',
        'INR': 'IN'
      }
      countryCode = currencyToCountry[selectedCurrency] || 'US'
    }

    return calculateRegionalPrice(basePrice, countryCode)
  }

  // Format price with currency symbol
  const formatPrice = (basePrice) => {
    const price = getPrice(basePrice)
    const countryCode = selectedCurrency === 'USD' ? 'US' :
      selectedCurrency === 'EUR' ? 'DE' :
        selectedCurrency === 'GBP' ? 'GB' :
          selectedCurrency === 'INR' ? 'IN' : 'US'
    return formatCurrency(price, selectedCurrency, countryCode)
  }

  return (
    <div className="min-h-screen relative overflow-hidden font-sans text-zinc-400 bg-black selection:bg-white/20 selection:text-white">

      {/* 1. MONOCHROME BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-white/5 rounded-full blur-[120px] opacity-50" />
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

      <div className="container mx-auto max-w-7xl px-6 py-12 relative z-10">

        {/* HEADER SECTION */}
        <div className="text-center mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight"
          >
            Transparent Pricing.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600">Scale as you Secure.</span>
          </motion.h1>

          {/* LOCATION BADGE & CURRENCY SELECTOR */}
          <div className="flex flex-col items-center gap-4 mb-8">
            {/* Location Indicator */}
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-zinc-500"></div>
                <span>Detecting your location...</span>
              </div>
            ) : location && (
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Globe className="w-4 h-4" />
                <span>
                  {location.detected ? (
                    <>Prices shown for <span className="text-white font-medium">{location.flag} {location.country}</span></>
                  ) : (
                    <>Showing default pricing (location detection failed)</>
                  )}
                </span>
              </div>
            )}

            {/* Currency Selector */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Currency:</span>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 text-white rounded-lg px-4 py-2 text-sm font-medium hover:border-zinc-500 focus:border-white focus:outline-none transition-colors cursor-pointer"
              >
                {AVAILABLE_CURRENCIES.map(curr => (
                  <option key={curr.code} value={curr.code}>
                    {curr.flag} {curr.code} - {curr.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* TOGGLE SWITCH */}
          <div className="flex items-center justify-center gap-6 mt-10">
            <span className={`text-sm font-semibold transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-zinc-600'}`}>Monthly</span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="w-16 h-8 bg-zinc-900 rounded-full relative p-1 cursor-pointer border border-zinc-700 hover:border-white transition-colors shadow-inner"
            >
              <motion.div
                className="w-6 h-6 bg-white rounded-full shadow-lg"
                animate={{ x: billingCycle === 'yearly' ? 32 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={`text-sm font-semibold transition-colors ${billingCycle === 'yearly' ? 'text-white' : 'text-zinc-600'}`}>
              Yearly <span className="text-[10px] font-bold text-black bg-white px-2 py-0.5 rounded-full ml-1">SAVE 20%</span>
            </span>
          </div>
        </div>

        {/* 3-TIER PRICING GRID */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-32">

          {/* 1. FREE (DEVELOPER) */}
          <div className="relative p-8 bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col hover:border-zinc-600 transition-colors">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Developer</h3>
              <p className="text-zinc-500 text-sm">For hobbyists & prototypes.</p>
            </div>
            <div className="text-4xl font-extrabold text-white mb-8">
              {loading ? (
                <div className="h-12 bg-zinc-800 rounded animate-pulse w-32"></div>
              ) : (
                <>{formatPrice(0)}<span className="text-base text-zinc-600 font-medium">/mo</span></>
              )}
            </div>
            <Link to="/login" className="block w-full py-3 text-center bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold border border-zinc-700 transition-all mb-8">
              Start Free
            </Link>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-white" /> 5 Scans / month</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-white" /> Basic Jailbreak Library</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-white" /> Community Support</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-white" /> Public Audit Reports</li>
            </ul>
          </div>

          {/* 2. PRO (HIGHLIGHTED) */}
          <div className="relative p-1 bg-gradient-to-b from-white/20 to-transparent rounded-2xl shadow-2xl">
            <div className="absolute top-0 right-0 bg-white text-black text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg z-10">POPULAR</div>
            <div className="bg-zinc-900 h-full rounded-[14px] p-8 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-white" />

              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  Pro <Zap className="w-4 h-4 fill-white text-white" />
                </h3>
                <p className="text-zinc-400 text-sm">For scaling teams.</p>
              </div>
              <div className="text-4xl font-extrabold text-white mb-8">
                {loading ? (
                  <div className="h-12 bg-zinc-800 rounded animate-pulse w-32"></div>
                ) : (
                  <>{formatPrice(billingCycle === 'monthly' ? 13525 : 10820)}<span className="text-base text-zinc-600 font-medium">/mo</span></>
                )}
              </div>
              <Link to="/login" className="block w-full py-3 text-center bg-white text-black hover:bg-zinc-200 rounded-xl font-bold transition-all shadow-lg shadow-white/10 mb-8">
                Start 14-Day Trial
              </Link>
              <ul className="space-y-4 text-sm text-zinc-300 font-medium">
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-white" /> <strong>Unlimited</strong> Scans</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-white" /> Full Red Teaming Suite</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-white" /> Custom Trap Builder</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-white" /> Slack/Discord Webhooks</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-white" /> Private Audit Logs</li>
              </ul>
            </div>
          </div>

          {/* 3. ENTERPRISE */}
          <div className="relative p-8 bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col hover:border-zinc-600 transition-colors">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
              <p className="text-zinc-500 text-sm">For regulated industries.</p>
            </div>
            <div className="text-4xl font-extrabold text-white mb-8">
              {loading ? (
                <div className="h-12 bg-zinc-800 rounded animate-pulse w-32"></div>
              ) : (
                <>Custom</>
              )}
            </div>
            <Link to="/contact" className="block w-full py-3 text-center bg-transparent hover:bg-zinc-900 text-white rounded-xl font-bold border border-zinc-700 transition-all mb-8">
              Contact Sales
            </Link>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-white" /> Multi-tenancy + RBAC</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-white" /> Dedicated Judge AI</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-white" /> 99.9% Uptime SLA</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-white" /> GitHub App (White-label)</li>
            </ul>
          </div>

        </div>

        {/* COMPARISON TABLE */}
        <div className="max-w-5xl mx-auto mb-32">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Feature Comparison</h2>
          <div className="border border-zinc-800 rounded-xl bg-zinc-900/30 overflow-hidden">
            <div className="grid grid-cols-4 bg-zinc-900 p-4 border-b border-zinc-800 text-xs font-bold text-white uppercase tracking-wider">
              <div className="col-span-1">Feature</div>
              <div className="text-center">Free</div>
              <div className="text-center text-white">Pro</div>
              <div className="text-center">Enterprise</div>
            </div>
            <div className="divide-y divide-zinc-800/50">
              {features.map((feature, i) => (
                <div key={i} className="grid grid-cols-4 p-4 text-sm hover:bg-zinc-800/20 transition-colors">
                  <div className="font-medium text-zinc-300">{feature.name}</div>
                  <div className="text-center text-zinc-500">
                    {typeof feature.free === 'boolean' ? (feature.free ? <Check className="w-4 h-4 mx-auto text-white" /> : <span className="opacity-20">—</span>) : feature.free}
                  </div>
                  <div className="text-center text-white font-medium">
                    {typeof feature.pro === 'boolean' ? (feature.pro ? <Check className="w-4 h-4 mx-auto text-white" /> : <span className="opacity-20">—</span>) : feature.pro}
                  </div>
                  <div className="text-center text-zinc-400">
                    {typeof feature.ent === 'boolean' ? (feature.ent ? <Check className="w-4 h-4 mx-auto text-white" /> : <span className="opacity-20">—</span>) : feature.ent}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ADD-ONS SECTION */}
        <div className="max-w-4xl mx-auto mb-32">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Power Add-Ons</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-zinc-800 bg-zinc-900/20 p-6 rounded-xl flex items-start gap-4">
              <div className="p-2 bg-zinc-800 rounded-lg"><Activity className="w-5 h-5 text-white" /></div>
              <div>
                <h4 className="text-white font-bold text-lg mb-1">Multi-Modal Testing</h4>
                <p className="text-zinc-500 text-sm mb-3">Audit Image generators (DALL-E 3) and Audio models for safety.</p>
                <span className="text-white font-mono text-sm border border-zinc-700 px-2 py-1 rounded">
                  {loading ? '...' : `+${formatPrice(8325)}/mo`}
                </span>
              </div>
            </div>
            <div className="border border-zinc-800 bg-zinc-900/20 p-6 rounded-xl flex items-start gap-4">
              <div className="p-2 bg-zinc-800 rounded-lg"><Lock className="w-5 h-5 text-white" /></div>
              <div>
                <h4 className="text-white font-bold text-lg mb-1">Compliance Consultant</h4>
                <p className="text-zinc-500 text-sm mb-3">Dedicated security engineer to help write your custom policy rules.</p>
                <span className="text-white font-mono text-sm border border-zinc-700 px-2 py-1 rounded">
                  {loading ? '...' : `+${formatPrice(42000)}/mo`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ SECTION */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-zinc-800 rounded-2xl bg-zinc-900/30 overflow-hidden hover:border-zinc-600 transition-colors">
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full flex justify-between items-center p-6 text-left cursor-pointer"
                >
                  <span className="font-medium text-white text-lg">{faq.q}</span>
                  <div className={`p-2 rounded-full bg-zinc-800 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-5 h-5 text-zinc-400" />
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-zinc-400 leading-relaxed border-t border-zinc-800 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* TRUST FOOTER */}
        <div className="text-center pb-20 border-t border-zinc-900 pt-16">
          <p className="text-zinc-500 text-sm mb-2">30-Day Money-Back Guarantee on all Pro plans.</p>
          <div className="flex items-center justify-center gap-2 text-zinc-600 text-xs uppercase tracking-wider font-semibold">
            <Shield className="w-3 h-3" /> SSL Secure Payment
          </div>
        </div>

      </div>
    </div>
  )
}
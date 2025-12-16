// ============================================
// PRICING CONFIGURATION
// Base Currency: INR (Indian Rupee)
// Pro Plan Base Price: ₹13,525/month
// ============================================

// Exchange rates relative to INR (Indian Rupee)
// Updated: December 2025
const EXCHANGE_RATES = {
    INR: 1.0,        // Base currency (₹1 = ₹1)
    USD: 0.012,      // ₹1 = $0.012 (or $1 = ₹83.33)
    EUR: 0.011,      // ₹1 = €0.011 (or €1 = ₹90.91)
    GBP: 0.0094,     // ₹1 = £0.0094 (or £1 = ₹106.38)
}

// Regional configuration - maps countries to their currencies
const REGIONAL_CONFIG = {
    // India (Base)
    IN: {
        currency: 'INR',
        symbol: '₹',
        name: 'India',
        flag: '🇮🇳'
    },

    // United States
    US: {
        currency: 'USD',
        symbol: '$',
        name: 'United States',
        flag: '🇺🇸'
    },

    // United Kingdom
    GB: {
        currency: 'GBP',
        symbol: '£',
        name: 'United Kingdom',
        flag: '🇬🇧'
    },

    // EU countries (all use EUR)
    DE: { currency: 'EUR', symbol: '€', name: 'Germany', flag: '🇩🇪' },
    FR: { currency: 'EUR', symbol: '€', name: 'France', flag: '🇫🇷' },
    IT: { currency: 'EUR', symbol: '€', name: 'Italy', flag: '🇮🇹' },
    ES: { currency: 'EUR', symbol: '€', name: 'Spain', flag: '🇪🇸' },
    NL: { currency: 'EUR', symbol: '€', name: 'Netherlands', flag: '🇳🇱' },
    BE: { currency: 'EUR', symbol: '€', name: 'Belgium', flag: '🇧🇪' },
    AT: { currency: 'EUR', symbol: '€', name: 'Austria', flag: '🇦🇹' },
    PT: { currency: 'EUR', symbol: '€', name: 'Portugal', flag: '🇵🇹' },
    IE: { currency: 'EUR', symbol: '€', name: 'Ireland', flag: '🇮🇪' },

    // Other countries (use USD as default)
    CA: { currency: 'USD', symbol: '$', name: 'Canada', flag: '🇨🇦' },
    AU: { currency: 'USD', symbol: '$', name: 'Australia', flag: '🇦🇺' },
    NZ: { currency: 'USD', symbol: '$', name: 'New Zealand', flag: '🇳🇿' },
    SG: { currency: 'USD', symbol: '$', name: 'Singapore', flag: '🇸🇬' },
    MY: { currency: 'USD', symbol: '$', name: 'Malaysia', flag: '🇲🇾' },
    TH: { currency: 'USD', symbol: '$', name: 'Thailand', flag: '🇹🇭' },
    ID: { currency: 'USD', symbol: '$', name: 'Indonesia', flag: '🇮🇩' },
    PH: { currency: 'USD', symbol: '$', name: 'Philippines', flag: '🇵🇭' },
    VN: { currency: 'USD', symbol: '$', name: 'Vietnam', flag: '🇻🇳' },
    JP: { currency: 'USD', symbol: '$', name: 'Japan', flag: '🇯🇵' },
    KR: { currency: 'USD', symbol: '$', name: 'South Korea', flag: '🇰🇷' },
    BR: { currency: 'USD', symbol: '$', name: 'Brazil', flag: '🇧🇷' },
    MX: { currency: 'USD', symbol: '$', name: 'Mexico', flag: '🇲🇽' },
    AR: { currency: 'USD', symbol: '$', name: 'Argentina', flag: '🇦🇷' },
    CL: { currency: 'USD', symbol: '$', name: 'Chile', flag: '🇨🇱' },
    CO: { currency: 'USD', symbol: '$', name: 'Colombia', flag: '🇨🇴' },
    AE: { currency: 'USD', symbol: '$', name: 'UAE', flag: '🇦🇪' },
    SA: { currency: 'USD', symbol: '$', name: 'Saudi Arabia', flag: '🇸🇦' },
    ZA: { currency: 'USD', symbol: '$', name: 'South Africa', flag: '🇿🇦' },
    NG: { currency: 'USD', symbol: '$', name: 'Nigeria', flag: '🇳🇬' },

    // Default fallback
    DEFAULT: {
        currency: 'USD',
        symbol: '$',
        name: 'International',
        flag: '🌍'
    }
}

// All available currencies for manual selection
export const AVAILABLE_CURRENCIES = [
    { code: 'INR', symbol: '₹', flag: '🇮🇳', name: 'Indian Rupee' },
    { code: 'USD', symbol: '$', flag: '🇺🇸', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', flag: '🇪🇺', name: 'Euro' },
    { code: 'GBP', symbol: '£', flag: '🇬🇧', name: 'British Pound' },
]

/**
 * Fetch user's location based on IP address
 * Uses ipapi.co free tier (1000 requests/day, no API key needed)
 * @returns {Promise<Object>} Location data with country code and currency
 */
export async function fetchUserLocation() {
    try {
        const response = await fetch('https://ipapi.co/json/', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        // Extract relevant data
        const countryCode = data.country_code || 'IN'
        const config = REGIONAL_CONFIG[countryCode] || REGIONAL_CONFIG.DEFAULT

        return {
            country: data.country_name || 'India',
            countryCode: countryCode,
            currency: config.currency,
            symbol: config.symbol,
            flag: config.flag,
            detected: true
        }
    } catch (error) {
        console.error('Geolocation API failed:', error)

        // Fallback to India pricing (base currency)
        return {
            country: 'India',
            countryCode: 'IN',
            currency: 'INR',
            symbol: '₹',
            flag: '🇮🇳',
            detected: false
        }
    }
}

/**
 * Convert price from INR (base currency) to target currency
 * @param {number} priceInINR - Price in Indian Rupees (base currency)
 * @param {string} targetCurrency - Target currency code (USD, EUR, GBP, INR)
 * @returns {number} Converted price in target currency
 */
export function convertCurrency(priceInINR, targetCurrency) {
    const exchangeRate = EXCHANGE_RATES[targetCurrency] || EXCHANGE_RATES.USD
    const convertedPrice = priceInINR * exchangeRate

    // Round to nearest integer for cleaner pricing
    return Math.round(convertedPrice)
}

/**
 * Calculate regional price based on base INR price
 * @param {number} baseINRPrice - Base price in INR
 * @param {string} countryCode - ISO country code
 * @returns {number} Price in the country's currency
 */
export function calculateRegionalPrice(baseINRPrice, countryCode) {
    const config = REGIONAL_CONFIG[countryCode] || REGIONAL_CONFIG.DEFAULT
    return convertCurrency(baseINRPrice, config.currency)
}

/**
 * Format currency with proper symbol and locale
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (USD, EUR, GBP, INR)
 * @param {string} countryCode - ISO country code for locale
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency, countryCode = 'IN') {
    const config = REGIONAL_CONFIG[countryCode] || REGIONAL_CONFIG.DEFAULT

    // Special formatting for INR (Indian numbering system)
    if (currency === 'INR') {
        return `₹${amount.toLocaleString('en-IN')}`
    }

    // For other currencies, use standard formatting
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    } catch (error) {
        // Fallback if currency code is invalid
        return `${config.symbol}${amount}`
    }
}

/**
 * Get currency info by currency code
 * @param {string} currencyCode - Currency code (USD, EUR, etc.)
 * @returns {Object} Currency info object
 */
export function getCurrencyInfo(currencyCode) {
    return AVAILABLE_CURRENCIES.find(c => c.code === currencyCode) || AVAILABLE_CURRENCIES[0]
}

/**
 * Get regional config by country code
 * @param {string} countryCode - ISO country code
 * @returns {Object} Regional configuration
 */
export function getRegionalConfig(countryCode) {
    return REGIONAL_CONFIG[countryCode] || REGIONAL_CONFIG.DEFAULT
}

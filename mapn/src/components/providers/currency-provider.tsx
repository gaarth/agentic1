"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

// Common currencies with symbols
export const CURRENCIES = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
]

export const DATE_FORMATS = [
    { id: 'MM/dd/yyyy', label: 'MM/DD/YYYY (e.g. 12/31/2024)' },
    { id: 'dd/MM/yyyy', label: 'DD/MM/YYYY (e.g. 31/12/2024)' },
    { id: 'yyyy-MM-dd', label: 'YYYY-MM-DD (e.g. 2024-12-31)' },
    { id: 'MMMM d, yyyy', label: 'Full Date (e.g. December 31, 2024)' },
]

interface CurrencyContextType {
    currency: typeof CURRENCIES[0]
    dateFormat: string
    exchangeRate: number
    setCurrency: (code: string) => void
    setDateFormat: (format: string) => void
    formatPrice: (amount: number | string) => string
    formatDate: (date: Date) => string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrencyState] = useState(CURRENCIES[0])
    const [dateFormat, setDateFormatState] = useState(DATE_FORMATS[0].id)
    const [exchangeRate, setExchangeRate] = useState(1)
    const [rates, setRates] = useState<Record<string, number>>({ USD: 1 })

    // Fetch live rates on mount
    useEffect(() => {
        const fetchRates = async () => {
            try {
                // Using a free API for demonstration (exchangerate-api.com)
                const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD')
                setRates(response.data.rates)
            } catch (error) {
                console.error("Failed to fetch rates", error)
            }
        }
        fetchRates()
    }, [])

    // Update exchange rate when currency changes
    useEffect(() => {
        if (rates[currency.code]) {
            setExchangeRate(rates[currency.code])
        }
    }, [currency, rates])

    const setCurrency = (code: string) => {
        const selected = CURRENCIES.find(c => c.code === code)
        if (selected) setCurrencyState(selected)
    }

    const setDateFormat = (format: string) => {
        setDateFormatState(format)
    }

    const formatPrice = (amount: number | string) => {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount
        if (isNaN(num)) return amount.toString()

        const converted = num * exchangeRate

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.code,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(converted)
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US') // Simplified for now, can perform actual format string logic if needed
    }

    return (
        <CurrencyContext.Provider value={{
            currency,
            dateFormat,
            exchangeRate,
            setCurrency,
            setDateFormat,
            formatPrice,
            formatDate
        }}>
            {children}
        </CurrencyContext.Provider>
    )
}

export const useCurrency = () => {
    const context = useContext(CurrencyContext)
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider')
    }
    return context
}

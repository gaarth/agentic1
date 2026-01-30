'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { SUPPORTED_CURRENCIES, SupportedCurrency, MINIMUM_CAPITAL_INR } from '@/lib/currency-api';

interface CapitalInputProps {
    value: number;
    currency: SupportedCurrency;
    onChange: (value: number, currency: SupportedCurrency) => void;
    disabled?: boolean;
}

export function CapitalInput({ value, currency, onChange, disabled }: CapitalInputProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [validation, setValidation] = useState<{
        isValid: boolean;
        minimumInCurrency: number;
        isLoading: boolean;
    }>({ isValid: true, minimumInCurrency: MINIMUM_CAPITAL_INR, isLoading: false });

    // Validate minimum on change
    useEffect(() => {
        const validateAmount = async () => {
            if (value <= 0) {
                setValidation({ isValid: false, minimumInCurrency: MINIMUM_CAPITAL_INR, isLoading: false });
                return;
            }

            setValidation(prev => ({ ...prev, isLoading: true }));

            try {
                const res = await fetch('/api/currency', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: value, currency })
                });

                if (res.ok) {
                    const data = await res.json();
                    setValidation({
                        isValid: data.isValid,
                        minimumInCurrency: data.minimumInCurrency,
                        isLoading: false
                    });
                } else {
                    // Fallback validation
                    const minRequired = currency === 'INR' ? MINIMUM_CAPITAL_INR : Math.ceil(MINIMUM_CAPITAL_INR / 83);
                    setValidation({
                        isValid: value >= minRequired,
                        minimumInCurrency: minRequired,
                        isLoading: false
                    });
                }
            } catch {
                // Fallback validation
                const minRequired = currency === 'INR' ? MINIMUM_CAPITAL_INR : Math.ceil(MINIMUM_CAPITAL_INR / 83);
                setValidation({
                    isValid: value >= minRequired,
                    minimumInCurrency: minRequired,
                    isLoading: false
                });
            }
        };

        const debounce = setTimeout(validateAmount, 300);
        return () => clearTimeout(debounce);
    }, [value, currency]);

    const selectedCurrency = SUPPORTED_CURRENCIES.find(c => c.code === currency);

    return (
        <div className="w-full max-w-md relative">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
                Investment Capital
            </label>

            <div className={`relative flex items-stretch rounded-2xl border-2 transition-all duration-300 ${!validation.isValid && !validation.isLoading
                ? 'border-red-500/50 bg-red-500/5'
                : validation.isValid && value > 0
                    ? 'border-green-500/30 bg-green-500/5'
                    : 'border-border bg-secondary/30 focus-within:border-primary/50'
                }`}>
                {/* Currency Dropdown Trigger */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!disabled) setIsDropdownOpen(!isDropdownOpen);
                        }}
                        disabled={disabled}
                        className="flex items-center gap-2 h-full px-4 py-3 bg-secondary/50 hover:bg-secondary transition-colors border-r border-border disabled:opacity-50 rounded-l-2xl"
                    >
                        <span className="text-lg font-medium">{selectedCurrency?.symbol}</span>
                        <span className="text-sm text-muted-foreground">{currency}</span>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu - positioned relative to this container */}
                    <AnimatePresence>
                        {isDropdownOpen && (
                            <>
                                {/* Backdrop to close dropdown when clicking outside */}
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsDropdownOpen(false)}
                                />
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute top-full left-0 mt-2 w-56 bg-background rounded-xl border border-border shadow-xl shadow-black/20 z-50"
                                >
                                    <div className="max-h-64 overflow-y-auto">
                                        {SUPPORTED_CURRENCIES.map((curr) => (
                                            <button
                                                key={curr.code}
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    onChange(value, curr.code);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors ${curr.code === currency ? 'bg-primary/10 text-primary' : ''
                                                    }`}
                                            >
                                                <span className="text-lg w-8">{curr.symbol}</span>
                                                <div>
                                                    <div className="font-medium">{curr.code}</div>
                                                    <div className="text-xs text-muted-foreground">{curr.name}</div>
                                                </div>
                                                {curr.code === currency && (
                                                    <CheckCircle2 className="w-4 h-4 ml-auto text-primary" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                {/* Amount Input */}
                <input
                    type="number"
                    value={value || ''}
                    onChange={(e) => onChange(parseFloat(e.target.value) || 0, currency)}
                    placeholder="Enter amount..."
                    disabled={disabled}
                    className="flex-1 px-4 py-3 bg-transparent text-lg font-medium outline-none placeholder:text-muted-foreground/50 disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />

                {/* Status Indicator */}
                <div className="flex items-center px-4">
                    {validation.isLoading ? (
                        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                    ) : validation.isValid && value > 0 ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : value > 0 ? (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                    ) : null}
                </div>
            </div>

            {/* Validation Message */}
            <AnimatePresence>
                {!validation.isValid && !validation.isLoading && value > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="flex items-center gap-2 mt-2 text-sm text-red-400"
                    >
                        <AlertCircle className="w-4 h-4" />
                        <span>
                            Minimum investment: {selectedCurrency?.symbol}{validation.minimumInCurrency.toLocaleString()} {currency}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Helper Text */}
            <p className="text-xs text-muted-foreground mt-2">
                Minimum: ₹10,000 INR or equivalent
            </p>
        </div>
    );
}

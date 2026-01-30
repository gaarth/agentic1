"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { useCurrency, CURRENCIES, DATE_FORMATS } from "@/components/providers/currency-provider"
import {
    Palette,
    Shield,
    Eye,
    Bell,
    Globe,
    HelpCircle,
    ChevronRight,
    Check,
    Lock,
    RefreshCw,
    Monitor,
    EyeOff,
    FileText,
    Smartphone,
    DollarSign,
    Calendar,
    MessageSquare,
    Info,
    X,
    Search
} from "lucide-react"
import { cn } from "@/lib/utils"

const sections = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'currency', label: 'Currency & Date', icon: Globe },
    { id: 'support', label: 'Support', icon: HelpCircle },
]

const themes = [
    { id: 'theme-blacked', label: 'Classic Blacked', color: '#000000' },
    { id: 'theme-stoned', label: 'Stoned Grey', color: '#1c1c1c' },
    { id: 'theme-light-pro', label: 'Light Pro', color: '#F9FAFB' },
    { id: 'theme-midnight', label: 'Midnight', color: '#0a0812' },
    { id: 'theme-slate', label: 'Slate Blue', color: '#0f172a' },
]

interface SettingsDropdownProps {
    isOpen: boolean
    onClose: () => void
    triggerRef: React.RefObject<HTMLButtonElement | null>
}

export function SettingsDropdown({ isOpen, onClose, triggerRef }: SettingsDropdownProps) {
    const [activeSection, setActiveSection] = React.useState('appearance')
    const { theme, setTheme } = useTheme()
    const { currency, setCurrency, dateFormat, setDateFormat } = useCurrency()
    const dropdownRef = React.useRef<HTMLDivElement>(null)
    const [currencySearch, setCurrencySearch] = React.useState("")

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen, onClose, triggerRef])

    const handleAction = (label: string) => {
        toast.info(label, {
            description: "This feature is coming soon to the full version."
        })
    }

    const filteredCurrencies = CURRENCIES.filter(c =>
        c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
        c.code.toLowerCase().includes(currencySearch.toLowerCase())
    )

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={dropdownRef}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-2 w-[600px] h-[500px] rounded-xl bg-card border border-border shadow-2xl z-50 overflow-hidden flex flex-col md:flex-row glass-morphism"
                >
                    {/* Sidebar */}
                    <div className="w-[200px] bg-secondary/10 border-r border-border p-3 flex flex-col gap-1 overflow-y-auto">
                        <div className="flex items-center justify-between px-3 py-2 mb-2">
                            <span className="text-sm font-semibold">Settings</span>
                            <button onClick={onClose} className="md:hidden text-muted-foreground">
                                <X size={16} />
                            </button>
                        </div>
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                                    activeSection === section.id
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-secondary/20 hover:text-foreground"
                                )}
                            >
                                <section.icon className="w-4 h-4" />
                                {section.label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 overflow-y-auto bg-card/50">
                        <h3 className="text-sm font-medium mb-4 pb-2 border-b border-border">
                            {sections.find(s => s.id === activeSection)?.label}
                        </h3>

                        <div className="space-y-4">
                            {activeSection === 'appearance' && (
                                <div className="grid gap-2">
                                    {themes.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => {
                                                setTheme(t.id)
                                                toast.success(`Theme changed to ${t.label}`)
                                            }}
                                            className={cn(
                                                "flex items-center justify-between p-3 rounded-lg border transition-all text-left group",
                                                (theme === t.id || (t.id === 'theme-blacked' && (theme === 'dark' || !theme)))
                                                    ? "bg-primary/5 border-primary/50"
                                                    : "bg-secondary/5 border-border hover:border-border/80 hover:bg-secondary/10"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-6 h-6 rounded-full border shadow-sm"
                                                    style={{ backgroundColor: t.color }}
                                                />
                                                <span className="text-sm font-medium">{t.label}</span>
                                            </div>
                                            {(theme === t.id || (t.id === 'theme-blacked' && (theme === 'dark' || !theme))) && (
                                                <Check className="w-4 h-4 text-primary" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {activeSection === 'security' && (
                                <>
                                    <SettingsItem icon={Lock} label="Change Password" onClick={() => toast("Password Reset", { description: "Reset link sent to your email." })} />
                                    <SettingsItem icon={Smartphone} label="App Lock" badge="Disabled" toggle />
                                    <SettingsItem icon={RefreshCw} label="Auto Logout" badge="15m" onClick={() => handleAction("Auto Logout Settings")} />
                                    <SettingsItem icon={Monitor} label="Active Devices" onClick={() => handleAction("Device Management")} />
                                </>
                            )}

                            {activeSection === 'privacy' && (
                                <>
                                    <SettingsItem icon={EyeOff} label="Hide Balances" toggle />
                                    <SettingsItem icon={Shield} label="Mask Data" toggle />
                                    <SettingsItem icon={FileText} label="Screen Shield" toggle />
                                </>
                            )}

                            {activeSection === 'notifications' && (
                                <>
                                    <SettingsItem icon={Bell} label="Transactions" toggle />
                                    <SettingsItem icon={Bell} label="Price Alerts" toggle />
                                    <SettingsItem icon={Bell} label="News" toggle />
                                </>
                            )}

                            {activeSection === 'currency' && (
                                <div className="space-y-6">
                                    {/* Currency Selection */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Currency</h4>

                                        <div className="relative">
                                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                            <input
                                                type="text"
                                                placeholder="Search currency..."
                                                value={currencySearch}
                                                onChange={(e) => setCurrencySearch(e.target.value)}
                                                className="w-full bg-secondary/5 border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                                            />
                                        </div>

                                        <div className="grid gap-2 max-h-[180px] overflow-y-auto pr-2">
                                            {filteredCurrencies.map((c) => (
                                                <button
                                                    key={c.code}
                                                    onClick={() => {
                                                        setCurrency(c.code)
                                                        toast.success(`Currency changed to ${c.code}`)
                                                    }}
                                                    className={cn(
                                                        "flex items-center justify-between p-3 rounded-lg border transition-all text-left",
                                                        currency.code === c.code
                                                            ? "bg-primary/5 border-primary/50"
                                                            : "bg-secondary/5 border-border hover:border-border/80 hover:bg-secondary/10"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-xs font-bold">
                                                            {c.symbol}
                                                        </span>
                                                        <div>
                                                            <div className="text-sm font-medium">{c.code}</div>
                                                            <div className="text-xs text-muted-foreground">{c.name}</div>
                                                        </div>
                                                    </div>
                                                    {currency.code === c.code && (
                                                        <Check className="w-4 h-4 text-primary" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Date Format Selection */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date Format</h4>
                                        <div className="grid gap-2">
                                            {DATE_FORMATS.map((f) => (
                                                <button
                                                    key={f.id}
                                                    onClick={() => {
                                                        setDateFormat(f.id)
                                                        toast.success("Date format updated")
                                                    }}
                                                    className={cn(
                                                        "flex items-center justify-between p-3 rounded-lg border transition-all text-left",
                                                        dateFormat === f.id
                                                            ? "bg-primary/5 border-primary/50"
                                                            : "bg-secondary/5 border-border hover:border-border/80 hover:bg-secondary/10"
                                                    )}
                                                >
                                                    <span className="text-sm font-medium">{f.label}</span>
                                                    {dateFormat === f.id && (
                                                        <Check className="w-4 h-4 text-primary" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'support' && (
                                <>
                                    <SettingsItem icon={HelpCircle} label="Help Center" onClick={() => window.open('https://example.com/help', '_blank')} />
                                    <SettingsItem icon={MessageSquare} label="Contact Support" onClick={() => window.open('mailto:support@macane.ai')} />
                                    <SettingsItem icon={Info} label="About" badge="v1.0.5" onClick={() => toast("MACANE v1.0.5", { description: "Build 2024.10.15" })} />
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

function SettingsItem({
    icon: Icon,
    label,
    badge,
    toggle,
    onClick
}: {
    icon: any,
    label: string,
    badge?: string,
    toggle?: boolean,
    onClick?: () => void
}) {
    const [isEnabled, setIsEnabled] = React.useState(false)

    const handleClick = () => {
        if (toggle) {
            const newState = !isEnabled
            setIsEnabled(newState)
            toast(label, {
                description: newState ? "Enabled" : "Disabled"
            })
        } else if (onClick) {
            onClick()
        }
    }

    return (
        <div
            onClick={handleClick}
            className="flex items-center justify-between p-3 rounded-lg bg-secondary/5 border border-border hover:bg-secondary/10 transition-all cursor-pointer group select-none"
        >
            <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                {badge && <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{badge}</span>}
                {toggle ? (
                    <div className={cn(
                        "w-7 h-4 rounded-full relative transition-colors duration-300",
                        isEnabled ? "bg-primary" : "bg-muted group-hover:bg-primary/20"
                    )}>
                        <div className={cn(
                            "absolute top-0.5 w-3 h-3 rounded-full bg-background shadow-sm transition-all duration-300",
                            isEnabled ? "left-3.5" : "left-0.5"
                        )} />
                    </div>
                ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-foreground" />
                )}
            </div>
        </div>
    )
}

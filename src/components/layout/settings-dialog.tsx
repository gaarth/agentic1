"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import {
    Settings,
    Palette,
    Shield,
    Eye,
    Bell,
    Globe,
    User,
    FileText,
    HelpCircle,
    ChevronRight,
    Lock,
    LogOut,
    Smartphone,
    EyeOff,
    Monitor,
    DollarSign,
    Calendar,
    Layout,
    RefreshCw,
    Trash2,
    Download,
    MessageSquare,
    Info,
    Check
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const sections = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'currency', label: 'Currency & Locale', icon: Globe },
    { id: 'account', label: 'Account Preferences', icon: User },
    { id: 'reports', label: 'Reports & Data', icon: FileText },
    { id: 'support', label: 'Support & About', icon: HelpCircle },
]

const themes = [
    { id: 'theme-blacked', label: 'Classic Blacked', description: 'Very dark background, restrained purple accents.' },
    { id: 'theme-stoned', label: 'Stoned Grey', description: 'Neutral grey backgrounds, low eye strain.' },
    { id: 'theme-light-pro', label: 'Light (Professional)', description: 'Light background, dark text, muted purple.' },
    { id: 'theme-midnight', label: 'Midnight Purple', description: 'Deep purple-tinted backgrounds and surfaces.' },
    { id: 'theme-slate', label: 'Slate Blue', description: 'Blue-grey background tones with purple accents.' },
]

export function SettingsDialog({ trigger }: { trigger: React.ReactNode }) {
    const [activeSection, setActiveSection] = React.useState('appearance')
    const { theme, setTheme } = useTheme()
    const [open, setOpen] = React.useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="max-w-[800px] h-[600px] p-0 gap-0 overflow-hidden glass-morphism border-border">
                <div className="flex h-full">
                    {/* Sidebar */}
                    <div className="w-[240px] border-r border-border bg-muted/30 p-4 pt-6">
                        <div className="flex items-center gap-2 px-3 mb-6">
                            <Settings className="w-5 h-5 text-primary" />
                            <span className="font-semibold text-foreground">Settings</span>
                        </div>
                        <nav className="space-y-1">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                                        activeSection === section.id
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                    )}
                                >
                                    <section.icon className="w-4 h-4" />
                                    {section.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col min-w-0">
                        <DialogHeader className="p-6 border-b border-border">
                            <DialogTitle>
                                {sections.find(s => s.id === activeSection)?.label}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto p-6 scroll-area-custom">
                            {activeSection === 'appearance' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-sm font-medium text-foreground mb-4">Themes</h3>
                                        <div className="grid gap-3">
                                            {themes.map((t) => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setTheme(t.id)}
                                                    className={cn(
                                                        "flex items-center justify-between p-4 rounded-xl border transition-all text-left",
                                                        (theme === t.id || (t.id === 'theme-blacked' && theme === 'dark'))
                                                            ? "bg-primary/10 border-primary"
                                                            : "bg-secondary/20 border-border hover:border-muted-foreground/50"
                                                    )}
                                                >
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-medium text-foreground">{t.label}</p>
                                                        <p className="text-xs text-muted-foreground">{t.description}</p>
                                                    </div>
                                                    {(theme === t.id || (t.id === 'theme-blacked' && theme === 'dark')) && (
                                                        <Check className="w-4 h-4 text-primary" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'security' && (
                                <div className="space-y-4">
                                    <SettingsItem icon={Lock} label="Change Password" />
                                    <SettingsItem icon={Smartphone} label="App Lock" badge="Disabled" />
                                    <SettingsItem icon={RefreshCw} label="Auto Logout" badge="15 min" />
                                    <SettingsItem icon={Monitor} label="Active Devices" />
                                </div>
                            )}

                            {activeSection === 'privacy' && (
                                <div className="space-y-4">
                                    <SettingsItem icon={EyeOff} label="Hide Balances" toggle />
                                    <SettingsItem icon={Shield} label="Mask Sensitive Data" toggle />
                                    <SettingsItem icon={FileText} label="Screen Protection" toggle />
                                </div>
                            )}

                            {activeSection === 'notifications' && (
                                <div className="space-y-4">
                                    <SettingsItem icon={Bell} label="Transaction Alerts" toggle />
                                    <SettingsItem icon={Bell} label="Price & Threshold Alerts" toggle />
                                    <SettingsItem icon={Bell} label="News & Updates" toggle />
                                    <SettingsItem icon={Bell} label="Marketing Preferences" toggle />
                                </div>
                            )}

                            {activeSection === 'currency' && (
                                <div className="space-y-4">
                                    <SettingsItem icon={DollarSign} label="Base Currency" badge="USD" />
                                    <SettingsItem icon={FileText} label="Number Format" badge="1,000.00" />
                                    <SettingsItem icon={Calendar} label="Date & Time Format" badge="DD/MM/YYYY" />
                                </div>
                            )}

                            {activeSection === 'account' && (
                                <div className="space-y-4">
                                    <SettingsItem icon={Layout} label="Default Account View" />
                                    <SettingsItem icon={Layout} label="Dashboard Preferences" />
                                    <SettingsItem icon={RefreshCw} label="Reset Preferences" variant="destructive" />
                                    <SettingsItem icon={Trash2} label="Clear Cached Data" variant="destructive" />
                                </div>
                            )}

                            {activeSection === 'reports' && (
                                <div className="space-y-4">
                                    <SettingsItem icon={Download} label="Export Data" />
                                    <SettingsItem icon={FileText} label="Statements" />
                                    <SettingsItem icon={FileText} label="Tax Reports" />
                                </div>
                            )}

                            {activeSection === 'support' && (
                                <div className="space-y-4">
                                    <SettingsItem icon={HelpCircle} label="Help & Support" />
                                    <SettingsItem icon={MessageSquare} label="Contact Support" />
                                    <SettingsItem icon={FileText} label="Legal Information" />
                                    <SettingsItem icon={Info} label="App Information" badge="v1.0.4" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function SettingsItem({
    icon: Icon,
    label,
    badge,
    toggle,
    variant = 'default'
}: {
    icon: any,
    label: string,
    badge?: string,
    toggle?: boolean,
    variant?: 'default' | 'destructive'
}) {
    return (
        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 border border-border hover:bg-secondary/30 transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
                <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    variant === 'destructive' ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                )}>
                    <Icon className="w-4 h-4" />
                </div>
                <span className={cn(
                    "text-sm font-medium",
                    variant === 'destructive' ? "text-destructive" : "text-foreground"
                )}>{label}</span>
            </div>
            <div className="flex items-center gap-2">
                {badge && <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">{badge}</span>}
                {toggle ? (
                    <div className="w-8 h-4 rounded-full bg-muted relative transition-colors group-hover:bg-primary/20">
                        <div className="absolute left-1 top-1 w-2 h-2 rounded-full bg-muted-foreground" />
                    </div>
                ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-all" />
                )}
            </div>
        </div>
    )
}

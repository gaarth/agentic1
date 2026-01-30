import { cn } from "@/lib/utils"
import Link from "next/link"
import { Home, LayoutDashboard, LineChart, Wallet, Newspaper } from "lucide-react"

const menuItems = [
    { label: 'Home', icon: Home, href: '/' },
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Market', icon: LineChart, href: '/dashboard' },
    { label: 'Portfolio', icon: Wallet, href: '/dashboard' },
    { label: 'News', icon: Newspaper, href: '/dashboard' },
]

export function Sidebar({ className }: { className?: string }) {
    return (
        <aside className={cn(
            "hidden lg:flex w-[240px] flex-col gap-2 p-4 pt-8 sticky top-0 h-screen border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
            className
        )}>
            {/* Logo Area */}
            <Link href="/" className="flex items-center gap-2 mb-8 px-4 font-bold text-xl tracking-tight text-foreground hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <span className="text-white text-sm">X</span>
                </div>
                MACANE
            </Link>

            {/* Nav Items */}
            <nav className="flex flex-col gap-1">
                {menuItems.map((item, i) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-[12px] transition-all cursor-pointer",
                            i === 1 ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                        )}
                    >
                        <item.icon size={18} />
                        {item.label}
                    </Link>
                ))}
            </nav>
        </aside>
    )
}

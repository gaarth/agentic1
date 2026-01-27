import { cn } from "@/lib/utils"

export function Sidebar({ className }: { className?: string }) {
    return (
        <aside className={cn(
            "hidden lg:flex w-[240px] flex-col gap-2 p-4 pt-8 sticky top-0 h-screen border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
            className
        )}>
            {/* Logo Area */}
            <div className="h-8 mb-8 px-4 font-bold text-xl tracking-tight text-primary">
                Mevolut
            </div>

            {/* Nav Items (Placeholder) */}
            <nav className="flex flex-col gap-1">
                {['Dashboard', 'Market', 'Portfolio', 'News'].map((item, i) => (
                    <div
                        key={item}
                        className={cn(
                            "px-4 py-3 text-sm font-medium rounded-[12px] transition-all cursor-pointer",
                            i === 0 ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                        )}
                    >
                        {item}
                    </div>
                ))}
            </nav>
        </aside>
    )
}

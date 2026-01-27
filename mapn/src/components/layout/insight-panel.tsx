import { cn } from "@/lib/utils"

export function InsightPanel({ className }: { className?: string }) {
    return (
        <aside className={cn(
            "hidden xl:flex w-[320px] flex-col gap-6 p-6 sticky top-0 h-screen overflow-hidden",
            className
        )}>
            {/* Sticky top offset logic is handled by padding/top, but spec says "Sticky-top logic with a 24px offset". 
           Since the container is sticky top-0 h-screen, inner elements can scroll or be static. 
       */}
            <div className="mt-6 flex-1 flex flex-col gap-4">
                {/* Glass Card 1 - Gains/Losses */}
                <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <h3 className="font-semibold text-foreground mb-4 relative z-10">Market Summary</h3>
                    <div className="space-y-3 relative z-10">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">S&P 500</span>
                            <span className="text-primary font-medium">+1.24%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Bitcoin</span>
                            <span className="text-destructive font-medium">-0.45%</span>
                        </div>
                    </div>
                </div>

                {/* Glass Card 2 - News Feed */}
                <div className="glass-panel p-5 rounded-2xl flex-1 relative overflow-hidden">
                    <h3 className="font-semibold text-foreground mb-4">Latest Updates</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex flex-col gap-1 border-b border-border/50 pb-3 last:border-0">
                                <span className="text-xs text-muted-foreground">2m ago</span>
                                <p className="text-sm font-medium leading-snug">Market volatility increases as new regulations announced.</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    )
}

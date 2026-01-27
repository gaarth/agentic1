import { ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { InsightPanel } from "./insight-panel"

export function MainLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex bg-background min-h-screen font-sans selection:bg-primary/20">
            <Sidebar />
            <main className="flex-1 min-w-0">
                <div className="p-6 md:p-8 lg:p-10 mx-auto max-w-6xl">
                    {children}
                </div>
            </main>
            <InsightPanel />
        </div>
    )
}

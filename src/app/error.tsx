'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
            <div className="bg-destructive/10 p-6 rounded-full mb-6 text-destructive">
                <AlertCircle className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Something went wrong!</h2>
            <p className="text-muted-foreground max-w-md mb-8">
                We encountered an error while loading this page. Our team has been notified.
            </p>
            <button
                onClick={() => reset()}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all font-medium"
            >
                <RefreshCw className="w-4 h-4" />
                Try again
            </button>
        </div>
    )
}

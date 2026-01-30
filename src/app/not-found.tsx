import Link from 'next/link'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
            <div className="bg-secondary/20 p-6 rounded-full mb-6">
                <FileQuestion className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400 mb-2">Page Not Found</h2>
            <p className="text-muted-foreground max-w-md mb-8">
                The page you are looking for doesn't exist or has been moved.
            </p>
            <Link
                href="/"
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all font-medium"
            >
                Return Home
            </Link>
        </div>
    )
}

import { SignInForm } from '@/components/auth/sign-in-form'
import Link from 'next/link'

export default function SignInPage() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <Link href="/" className="inline-block">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            MACANE
                        </h1>
                    </Link>
                    <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
                    <p className="text-muted-foreground">Sign in to your account to continue</p>
                </div>

                <SignInForm />
            </div>
        </div>
    )
}

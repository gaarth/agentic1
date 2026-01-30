'use client'

import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function CursorGradient() {
    const cursorX = useMotionValue(-100)
    const cursorY = useMotionValue(-100)

    const springConfig = { damping: 25, stiffness: 150 }
    const cursorXSpring = useSpring(cursorX, springConfig)
    const cursorYSpring = useSpring(cursorY, springConfig)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            cursorX.set(e.clientX)
            cursorY.set(e.clientY)
        }

        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [cursorX, cursorY])

    return (
        <>
            {/* Main cursor gradient */}
            <motion.div
                className="fixed pointer-events-none z-50 w-96 h-96 rounded-full blur-[120px] opacity-20"
                style={{
                    left: cursorXSpring,
                    top: cursorYSpring,
                    x: '-50%',
                    y: '-50%',
                    background: 'radial-gradient(circle, rgba(223, 122, 254, 0.4) 0%, rgba(129, 74, 200, 0.2) 50%, transparent 70%)'
                }}
            />

            {/* Secondary trailing gradient for depth */}
            <motion.div
                className="fixed pointer-events-none z-40 w-64 h-64 rounded-full blur-[100px] opacity-15"
                style={{
                    left: cursorXSpring,
                    top: cursorYSpring,
                    x: '-50%',
                    y: '-50%',
                    background: 'radial-gradient(circle, rgba(129, 74, 200, 0.5) 0%, rgba(223, 122, 254, 0.3) 40%, transparent 70%)'
                }}
                transition={{ type: 'spring', damping: 30, stiffness: 120 }}
            />
        </>
    )
}

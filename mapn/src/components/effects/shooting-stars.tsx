'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

interface Star {
    id: number
    x: number
    y: number
    size: number
    speed: number
    opacity: number
    angle: number
    depth: number // For parallax effect
}

export function ShootingStars() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [stars, setStars] = useState<Star[]>([])
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)
    const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 })
    const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 })

    // Initialize stars
    useEffect(() => {
        const initStars: Star[] = []
        const starCount = 15 // Minimal count for subtle effect

        for (let i = 0; i < starCount; i++) {
            initStars.push({
                id: i,
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 0.3 + 0.1,
                opacity: Math.random() * 0.4 + 0.3,
                angle: Math.random() * Math.PI * 2,
                depth: Math.random() * 0.5 + 0.5 // 0.5 to 1.0 for depth layers
            })
        }

        setStars(initStars)
    }, [])

    // Mouse tracking
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX)
            mouseY.set(e.clientY)
        }

        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [mouseX, mouseY])

    // Animation loop
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        resize()
        window.addEventListener('resize', resize)

        let animationFrameId: number
        const mouseXValue = smoothMouseX.get()
        const mouseYValue = smoothMouseY.get()

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            const currentMouseX = smoothMouseX.get()
            const currentMouseY = smoothMouseY.get()
            const deltaMouseX = (currentMouseX - mouseXValue) * 0.05
            const deltaMouseY = (currentMouseY - mouseYValue) * 0.05

            setStars(prevStars =>
                prevStars.map(star => {
                    // Move star based on angle and speed
                    let newX = star.x + Math.cos(star.angle) * star.speed
                    let newY = star.y + Math.sin(star.angle) * star.speed

                    // Add cursor parallax effect based on depth
                    newX += deltaMouseX * star.depth * 0.5
                    newY += deltaMouseY * star.depth * 0.5

                    // Wrap around screen edges
                    if (newX < -10) newX = canvas.width + 10
                    if (newX > canvas.width + 10) newX = -10
                    if (newY < -10) newY = canvas.height + 10
                    if (newY > canvas.height + 10) newY = -10

                    // Draw star with trail
                    const gradient = ctx.createLinearGradient(
                        newX,
                        newY,
                        newX - Math.cos(star.angle) * 50 * star.depth,
                        newY - Math.sin(star.angle) * 50 * star.depth
                    )

                    // Purple/magenta gradient for the trail
                    gradient.addColorStop(0, `rgba(223, 122, 254, ${star.opacity})`)
                    gradient.addColorStop(0.5, `rgba(164, 92, 219, ${star.opacity * 0.5})`)
                    gradient.addColorStop(1, 'rgba(129, 74, 200, 0)')

                    ctx.beginPath()
                    ctx.moveTo(newX, newY)
                    ctx.lineTo(
                        newX - Math.cos(star.angle) * 50 * star.depth,
                        newY - Math.sin(star.angle) * 50 * star.depth
                    )
                    ctx.strokeStyle = gradient
                    ctx.lineWidth = star.size * star.depth
                    ctx.lineCap = 'round'
                    ctx.stroke()

                    // Draw glowing star head
                    ctx.beginPath()
                    ctx.arc(newX, newY, star.size * star.depth, 0, Math.PI * 2)
                    ctx.fillStyle = `rgba(223, 122, 254, ${star.opacity})`
                    ctx.shadowBlur = 10 * star.depth
                    ctx.shadowColor = 'rgba(223, 122, 254, 0.8)'
                    ctx.fill()
                    ctx.shadowBlur = 0

                    return { ...star, x: newX, y: newY }
                })
            )

            animationFrameId = requestAnimationFrame(animate)
        }

        animate()

        return () => {
            cancelAnimationFrame(animationFrameId)
            window.removeEventListener('resize', resize)
        }
    }, [smoothMouseX, smoothMouseY])

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-0"
            style={{ opacity: 0.6 }}
        />
    )
}

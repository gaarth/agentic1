'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Cpu, Network, BarChart3, Shield, TrendingUp, Scale, Droplets } from 'lucide-react';

interface AgentLoadingModalProps {
    isOpen: boolean;
    onComplete: () => void;
}

const AGENT_MESSAGES = [
    { text: "Initializing autonomous agents...", icon: Cpu },
    { text: "Risk Agent analyzing volatility patterns...", icon: Shield },
    { text: "Growth Agent scanning high-yield opportunities...", icon: TrendingUp },
    { text: "Compliance Agent verifying ESG mandates...", icon: Scale },
    { text: "Liquidity Agent assessing market depth...", icon: Droplets },
    { text: "Agents are negotiating optimal allocation...", icon: Network },
    { text: "Supervisor synthesizing multi-agent consensus...", icon: Brain },
    { text: "Agents are allocating capital strategically...", icon: BarChart3 },
    { text: "Running stress tests on portfolio resilience...", icon: Shield },
    { text: "Optimizing Sharpe ratio across asset classes...", icon: TrendingUp },
    { text: "Balancing risk-adjusted returns...", icon: Scale },
    { text: "Finalizing investment recommendations...", icon: Brain },
];

export function AgentLoadingModal({ isOpen, onComplete }: AgentLoadingModalProps) {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!isOpen) {
            setCurrentMessageIndex(0);
            setProgress(0);
            return;
        }

        // Random duration between 20-45 seconds
        const totalDuration = Math.random() * 25000 + 20000; // 20-45s
        const messageInterval = totalDuration / AGENT_MESSAGES.length;
        const progressInterval = 50; // Update progress every 50ms

        // Message rotation
        const messageTimer = setInterval(() => {
            setCurrentMessageIndex(prev => {
                const next = prev + 1;
                if (next >= AGENT_MESSAGES.length) {
                    return prev; // Stay on last message
                }
                return next;
            });
        }, messageInterval);

        // Progress animation
        const startTime = Date.now();
        const progressTimer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const newProgress = Math.min((elapsed / totalDuration) * 100, 100);
            setProgress(newProgress);

            if (newProgress >= 100) {
                clearInterval(progressTimer);
                clearInterval(messageTimer);
                setTimeout(onComplete, 500); // Small delay before closing
            }
        }, progressInterval);

        return () => {
            clearInterval(messageTimer);
            clearInterval(progressTimer);
        };
    }, [isOpen, onComplete]);

    const currentMessage = AGENT_MESSAGES[currentMessageIndex];
    const CurrentIcon = currentMessage.icon;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-xl"
                >
                    <div className="flex flex-col items-center max-w-lg mx-auto px-8">
                        {/* Breathing Orb Animation */}
                        <div className="relative mb-12">
                            {/* Outer glow rings */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.3, 1],
                                    opacity: [0.2, 0.1, 0.2],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                className="absolute inset-0 w-40 h-40 rounded-full bg-gradient-to-r from-primary/30 to-purple-500/30 blur-2xl"
                            />
                            <motion.div
                                animate={{
                                    scale: [1.1, 0.9, 1.1],
                                    opacity: [0.3, 0.15, 0.3],
                                }}
                                transition={{
                                    duration: 2.5,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 0.3,
                                }}
                                className="absolute inset-0 w-40 h-40 rounded-full bg-gradient-to-r from-purple-500/20 to-primary/20 blur-xl"
                            />

                            {/* Core orb with breathing effect */}
                            <motion.div
                                animate={{
                                    scale: [0.95, 1.05, 0.95],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                className="relative w-40 h-40 rounded-full bg-gradient-to-br from-primary/80 via-purple-500/60 to-primary/40 flex items-center justify-center shadow-2xl shadow-primary/30"
                            >
                                {/* Inner icon with rotation */}
                                <motion.div
                                    key={currentMessageIndex}
                                    initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    exit={{ opacity: 0, scale: 0.5, rotate: 30 }}
                                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                                >
                                    <CurrentIcon className="w-16 h-16 text-white" strokeWidth={1.5} />
                                </motion.div>
                            </motion.div>

                            {/* Orbiting particles */}
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        rotate: 360,
                                    }}
                                    transition={{
                                        duration: 8 + i * 2,
                                        repeat: Infinity,
                                        ease: "linear",
                                    }}
                                    className="absolute inset-0 w-40 h-40"
                                    style={{ transformOrigin: 'center center' }}
                                >
                                    <motion.div
                                        animate={{
                                            opacity: [0.4, 0.8, 0.4],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                            delay: i * 0.5,
                                        }}
                                        className="w-2 h-2 rounded-full bg-primary absolute"
                                        style={{
                                            top: '50%',
                                            left: i === 0 ? '-10px' : i === 1 ? 'calc(100% + 10px)' : '50%',
                                            transform: 'translateY(-50%)',
                                        }}
                                    />
                                </motion.div>
                            ))}
                        </div>

                        {/* Status Text */}
                        <div className="text-center mb-8 h-20">
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={currentMessageIndex}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                                    className="text-xl font-medium text-foreground"
                                >
                                    {currentMessage.text}
                                </motion.p>
                            </AnimatePresence>
                            <p className="text-sm text-muted-foreground mt-3">
                                Our AI agents are collaborating to build your optimal portfolio
                            </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full max-w-sm">
                            <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-primary via-purple-500 to-primary rounded-full"
                                    style={{ width: `${progress}%` }}
                                    transition={{ duration: 0.1 }}
                                />
                            </div>
                            <div className="flex justify-between mt-3 text-xs text-muted-foreground">
                                <span>Analyzing</span>
                                <span>{Math.round(progress)}%</span>
                                <span>Optimizing</span>
                            </div>
                        </div>

                        {/* Agent Status Indicators */}
                        <div className="flex gap-4 mt-10">
                            {['Risk', 'Growth', 'Compliance', 'Liquidity'].map((agent, i) => (
                                <motion.div
                                    key={agent}
                                    initial={{ opacity: 0.3 }}
                                    animate={{
                                        opacity: currentMessageIndex >= i + 1 ? 1 : 0.3,
                                        scale: currentMessageIndex === i + 1 ? 1.1 : 1,
                                    }}
                                    transition={{ duration: 0.3 }}
                                    className="flex flex-col items-center gap-2"
                                >
                                    <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${currentMessageIndex >= i + 1 ? 'bg-green-500' : 'bg-muted-foreground/30'
                                        }`} />
                                    <span className="text-xs text-muted-foreground">{agent}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

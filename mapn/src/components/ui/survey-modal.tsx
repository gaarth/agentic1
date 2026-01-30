'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ArrowRight, ArrowLeft, Shield, TrendingUp, Target,
    Clock, AlertTriangle, Wallet, Receipt, Globe, RefreshCw, Ban,
    CheckCircle2
} from 'lucide-react';
import {
    UserSurveyResponse, RiskTolerance, InvestmentHorizon,
    DownsideComfort, IncomeNeeds, TaxSensitivity,
    GeographicPreference, RebalancingFrequency, AssetClass
} from '@/lib/database.types';

interface SurveyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (survey: UserSurveyResponse) => void;
}

const STEPS = [
    { id: 'risk', title: 'Risk Tolerance', icon: Shield },
    { id: 'return', title: 'Expected Returns', icon: Target },
    { id: 'assets', title: 'Asset Classes', icon: TrendingUp },
    { id: 'horizon', title: 'Investment Horizon', icon: Clock },
    { id: 'downside', title: 'Downside Comfort', icon: AlertTriangle },
    { id: 'income', title: 'Income Needs', icon: Wallet },
    { id: 'tax', title: 'Tax Sensitivity', icon: Receipt },
    { id: 'geography', title: 'Geographic Preference', icon: Globe },
    { id: 'rebalancing', title: 'Rebalancing', icon: RefreshCw },
    { id: 'exclusions', title: 'Sector Exclusions', icon: Ban },
];

const SECTOR_OPTIONS = [
    'Tobacco', 'Weapons', 'Gambling', 'Fossil Fuels',
    'Alcohol', 'Adult Entertainment', 'Nuclear', 'Private Prisons'
];

export function SurveyModal({ isOpen, onClose, onSubmit }: SurveyModalProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [survey, setSurvey] = useState<Partial<UserSurveyResponse>>({
        riskTolerance: 'balanced',
        expectedReturnRange: { min: 10, max: 15 },
        assetClasses: ['equities'],
        investmentHorizon: 'medium',
        downsideComfort: 'medium',
        incomeNeeds: 'none',
        taxSensitivity: 'medium',
        geographicPreference: 'global',
        rebalancingFrequency: 'quarterly',
        sectorExclusions: []
    });

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onSubmit(survey as UserSurveyResponse);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const updateSurvey = <K extends keyof UserSurveyResponse>(
        key: K,
        value: UserSurveyResponse[K]
    ) => {
        setSurvey(prev => ({ ...prev, [key]: value }));
    };

    const toggleAssetClass = (asset: AssetClass) => {
        const current = survey.assetClasses || [];
        if (current.includes(asset)) {
            updateSurvey('assetClasses', current.filter(a => a !== asset));
        } else {
            updateSurvey('assetClasses', [...current, asset]);
        }
    };

    const toggleSectorExclusion = (sector: string) => {
        const current = survey.sectorExclusions || [];
        if (current.includes(sector)) {
            updateSurvey('sectorExclusions', current.filter(s => s !== sector));
        } else {
            updateSurvey('sectorExclusions', [...current, sector]);
        }
    };

    const renderStepContent = () => {
        const step = STEPS[currentStep];

        switch (step.id) {
            case 'risk':
                return (
                    <div className="space-y-4">
                        <p className="text-muted-foreground mb-6">
                            How would you describe your approach to investment risk?
                        </p>
                        <div className="grid gap-4">
                            {(['conservative', 'balanced', 'aggressive'] as RiskTolerance[]).map((option) => (
                                <button
                                    key={option}
                                    onClick={() => updateSurvey('riskTolerance', option)}
                                    className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 ${survey.riskTolerance === option
                                        ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                                        : 'border-border hover:border-primary/50 bg-secondary/30'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold capitalize">{option}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {option === 'conservative' && 'Prefer stability over high returns. Lower risk tolerance.'}
                                                {option === 'balanced' && 'Accept moderate risk for moderate returns.'}
                                                {option === 'aggressive' && 'Willing to take high risks for potentially high returns.'}
                                            </p>
                                        </div>
                                        {survey.riskTolerance === option && (
                                            <CheckCircle2 className="w-6 h-6 text-primary" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'return':
                return (
                    <div className="space-y-6">
                        <p className="text-muted-foreground mb-4">
                            What annual return range are you targeting?
                        </p>
                        <div className="space-y-8 px-4">
                            <div>
                                <div className="flex justify-between mb-3">
                                    <span className="text-sm text-muted-foreground">Minimum Target</span>
                                    <span className="text-lg font-bold text-primary">{survey.expectedReturnRange?.min}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="5"
                                    max="30"
                                    value={survey.expectedReturnRange?.min || 10}
                                    onChange={(e) => updateSurvey('expectedReturnRange', {
                                        min: parseInt(e.target.value),
                                        max: Math.max(parseInt(e.target.value) + 5, survey.expectedReturnRange?.max || 15)
                                    })}
                                    className="smooth-slider"
                                    style={{ '--slider-progress': `${((survey.expectedReturnRange?.min || 10) - 5) / 25 * 100}%` } as React.CSSProperties}
                                />
                                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                                    <span>5%</span>
                                    <span>30%</span>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-3">
                                    <span className="text-sm text-muted-foreground">Maximum Target</span>
                                    <span className="text-lg font-bold text-primary">{survey.expectedReturnRange?.max}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="10"
                                    max="50"
                                    value={survey.expectedReturnRange?.max || 15}
                                    onChange={(e) => updateSurvey('expectedReturnRange', {
                                        min: Math.min(parseInt(e.target.value) - 5, survey.expectedReturnRange?.min || 10),
                                        max: parseInt(e.target.value)
                                    })}
                                    className="smooth-slider"
                                    style={{ '--slider-progress': `${((survey.expectedReturnRange?.max || 15) - 10) / 40 * 100}%` } as React.CSSProperties}
                                />
                                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                                    <span>10%</span>
                                    <span>50%</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
                            <p className="text-sm text-muted-foreground">
                                Your target range: <span className="text-foreground font-semibold">
                                    {survey.expectedReturnRange?.min}% - {survey.expectedReturnRange?.max}%
                                </span> annually
                            </p>
                        </div>
                    </div>
                );

            case 'assets':
                return (
                    <div className="space-y-4">
                        <p className="text-muted-foreground mb-6">
                            Select the asset classes you want in your portfolio:
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            {([
                                { id: 'equities', label: 'Equities', desc: 'Stocks & equity funds' },
                                { id: 'debt', label: 'Debt', desc: 'Bonds & fixed income' },
                                { id: 'crypto', label: 'Crypto', desc: 'Cryptocurrencies' },
                                { id: 'alternatives', label: 'Alternatives', desc: 'REITs, commodities, etc.' }
                            ] as const).map((asset) => (
                                <button
                                    key={asset.id}
                                    onClick={() => toggleAssetClass(asset.id)}
                                    className={`p-5 rounded-2xl border-2 text-left transition-all duration-300 ${survey.assetClasses?.includes(asset.id)
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border hover:border-primary/50 bg-secondary/30'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-semibold">{asset.label}</h3>
                                            <p className="text-xs text-muted-foreground mt-1">{asset.desc}</p>
                                        </div>
                                        {survey.assetClasses?.includes(asset.id) && (
                                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'horizon':
                return (
                    <div className="space-y-4">
                        <p className="text-muted-foreground mb-6">
                            How long do you plan to stay invested?
                        </p>
                        <div className="grid gap-4">
                            {([
                                { id: 'short', label: 'Short Term', desc: 'Less than 1 year' },
                                { id: 'medium', label: 'Medium Term', desc: '1 to 5 years' },
                                { id: 'long', label: 'Long Term', desc: 'More than 5 years' }
                            ] as const).map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => updateSurvey('investmentHorizon', option.id)}
                                    className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 ${survey.investmentHorizon === option.id
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border hover:border-primary/50 bg-secondary/30'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold">{option.label}</h3>
                                            <p className="text-sm text-muted-foreground">{option.desc}</p>
                                        </div>
                                        {survey.investmentHorizon === option.id && (
                                            <CheckCircle2 className="w-6 h-6 text-primary" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'downside':
                return (
                    <div className="space-y-4">
                        <p className="text-muted-foreground mb-6">
                            How comfortable are you with temporary losses?
                        </p>
                        <div className="grid gap-4">
                            {([
                                { id: 'low', label: 'Low Tolerance', desc: 'I get anxious at any loss' },
                                { id: 'medium', label: 'Moderate', desc: 'I can handle up to 15% drawdown' },
                                { id: 'high', label: 'High Tolerance', desc: 'I can stomach 30%+ drops' }
                            ] as const).map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => updateSurvey('downsideComfort', option.id)}
                                    className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 ${survey.downsideComfort === option.id
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border hover:border-primary/50 bg-secondary/30'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold">{option.label}</h3>
                                            <p className="text-sm text-muted-foreground">{option.desc}</p>
                                        </div>
                                        {survey.downsideComfort === option.id && (
                                            <CheckCircle2 className="w-6 h-6 text-primary" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'income':
                return (
                    <div className="space-y-4">
                        <p className="text-muted-foreground mb-6">
                            Do you need regular income from your investments?
                        </p>
                        <div className="grid gap-4">
                            {([
                                { id: 'none', label: 'No Income Needed', desc: 'Focus purely on growth' },
                                { id: 'some', label: 'Some Income', desc: 'Occasional dividends are nice' },
                                { id: 'regular', label: 'Regular Income', desc: 'I need consistent payouts' }
                            ] as const).map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => updateSurvey('incomeNeeds', option.id)}
                                    className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 ${survey.incomeNeeds === option.id
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border hover:border-primary/50 bg-secondary/30'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold">{option.label}</h3>
                                            <p className="text-sm text-muted-foreground">{option.desc}</p>
                                        </div>
                                        {survey.incomeNeeds === option.id && (
                                            <CheckCircle2 className="w-6 h-6 text-primary" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'tax':
                return (
                    <div className="space-y-4">
                        <p className="text-muted-foreground mb-6">
                            How important is tax efficiency to you?
                        </p>
                        <div className="grid gap-4">
                            {([
                                { id: 'low', label: 'Not Important', desc: 'Returns matter more than taxes' },
                                { id: 'medium', label: 'Somewhat Important', desc: 'Consider tax implications' },
                                { id: 'high', label: 'Very Important', desc: 'Minimize tax burden prioritized' }
                            ] as const).map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => updateSurvey('taxSensitivity', option.id)}
                                    className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 ${survey.taxSensitivity === option.id
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border hover:border-primary/50 bg-secondary/30'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold">{option.label}</h3>
                                            <p className="text-sm text-muted-foreground">{option.desc}</p>
                                        </div>
                                        {survey.taxSensitivity === option.id && (
                                            <CheckCircle2 className="w-6 h-6 text-primary" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'geography':
                return (
                    <div className="space-y-4">
                        <p className="text-muted-foreground mb-6">
                            What's your geographic investment preference?
                        </p>
                        <div className="grid gap-4">
                            {([
                                { id: 'domestic', label: 'Domestic Only', desc: 'Invest in local markets' },
                                { id: 'international', label: 'International', desc: 'Prefer foreign markets' },
                                { id: 'global', label: 'Global', desc: 'Diversify across all markets' }
                            ] as const).map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => updateSurvey('geographicPreference', option.id)}
                                    className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 ${survey.geographicPreference === option.id
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border hover:border-primary/50 bg-secondary/30'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold">{option.label}</h3>
                                            <p className="text-sm text-muted-foreground">{option.desc}</p>
                                        </div>
                                        {survey.geographicPreference === option.id && (
                                            <CheckCircle2 className="w-6 h-6 text-primary" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'rebalancing':
                return (
                    <div className="space-y-4">
                        <p className="text-muted-foreground mb-6">
                            How often should we rebalance your portfolio?
                        </p>
                        <div className="grid gap-4">
                            {([
                                { id: 'monthly', label: 'Monthly', desc: 'Frequent adjustments' },
                                { id: 'quarterly', label: 'Quarterly', desc: 'Balanced approach' },
                                { id: 'annually', label: 'Annually', desc: 'Minimal intervention' }
                            ] as const).map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => updateSurvey('rebalancingFrequency', option.id)}
                                    className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 ${survey.rebalancingFrequency === option.id
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border hover:border-primary/50 bg-secondary/30'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold">{option.label}</h3>
                                            <p className="text-sm text-muted-foreground">{option.desc}</p>
                                        </div>
                                        {survey.rebalancingFrequency === option.id && (
                                            <CheckCircle2 className="w-6 h-6 text-primary" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'exclusions':
                return (
                    <div className="space-y-4">
                        <p className="text-muted-foreground mb-6">
                            Select any sectors you want to exclude from your portfolio:
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            {SECTOR_OPTIONS.map((sector) => (
                                <button
                                    key={sector}
                                    onClick={() => toggleSectorExclusion(sector)}
                                    className={`p-4 rounded-xl border-2 text-left transition-all duration-300 ${survey.sectorExclusions?.includes(sector)
                                        ? 'border-red-500/50 bg-red-500/10 text-red-400'
                                        : 'border-border hover:border-primary/50 bg-secondary/30'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {survey.sectorExclusions?.includes(sector) ? (
                                            <Ban className="w-4 h-4 text-red-400" />
                                        ) : (
                                            <div className="w-4 h-4 rounded border border-muted-foreground/30" />
                                        )}
                                        <span className="font-medium">{sector}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <p className="text-sm text-muted-foreground mt-4">
                            {survey.sectorExclusions?.length === 0
                                ? 'No sectors excluded - all sectors eligible'
                                : `${survey.sectorExclusions?.length} sector(s) will be excluded`
                            }
                        </p>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={(e) => e.target === e.currentTarget && onClose()}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-background rounded-3xl border border-border shadow-2xl"
                    >
                        {/* Header */}
                        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {(() => {
                                        const StepIcon = STEPS[currentStep].icon;
                                        return <StepIcon className="w-5 h-5 text-primary" />;
                                    })()}
                                    <h2 className="text-xl font-bold">{STEPS[currentStep].title}</h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-secondary transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Progress bar */}
                            <div className="mt-4 h-1.5 bg-secondary rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-primary to-accent-foreground rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                                    transition={{ duration: 0.3, ease: 'easeOut' }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Step {currentStep + 1} of {STEPS.length}
                            </p>
                        </div>

                        {/* Content */}
                        <div className="px-6 py-6 overflow-y-auto max-h-[60vh]">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {renderStepContent()}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border px-6 py-4">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={handlePrev}
                                    disabled={currentStep === 0}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back
                                </button>

                                <div className="flex gap-1.5">
                                    {STEPS.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentStep
                                                ? 'bg-primary w-6'
                                                : idx < currentStep
                                                    ? 'bg-primary/50'
                                                    : 'bg-secondary'
                                                }`}
                                        />
                                    ))}
                                </div>

                                <button
                                    onClick={handleNext}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-full font-medium hover:scale-105 transition-all shadow-lg shadow-primary/25"
                                >
                                    {currentStep === STEPS.length - 1 ? 'Start Negotiation' : 'Continue'}
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

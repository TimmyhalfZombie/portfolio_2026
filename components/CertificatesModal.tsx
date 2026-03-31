'use client';

import React, { useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Certificate {
    title: string;
    issuer: string;
    grade: string;
}

const CERTIFICATES: Certificate[] = [
    { title: 'Assets, Threats, and Vulnerabilities', issuer: 'Google', grade: '98.75%' },
    { title: 'Tools of the Trade: Linux and SQL', issuer: 'Google', grade: '98.08%' },
    { title: 'Automate Cybersecurity Tasks with Python', issuer: 'Google', grade: '95.84%' },
    { title: 'Sound the Alarm: Detection and Response', issuer: 'Google', grade: '94.65%' },
    { title: 'Connect and Protect: Networks and Network Security', issuer: 'Google', grade: '92.87%' },
    { title: 'Foundations of Cybersecurity', issuer: 'Google', grade: '91.88%' },
    { title: 'Play It Safe: Manage Security Risks', issuer: 'Google', grade: '91.09%' },
];

interface CertificatesModalProps {
    onClose: () => void;
}

export const CertificatesModal: React.FC<CertificatesModalProps> = ({ onClose }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Manually scroll the list on wheel since the sticker overlay can intercept native wheel events
    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.stopPropagation();
        if (scrollRef.current) {
            scrollRef.current.scrollTop += e.deltaY;
        }
    }, []);

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                onWheel={handleWheel}
            >
                <motion.div
                    className="relative w-full max-w-lg bg-[#0c0c0c] border border-white/15 rounded-xl shadow-2xl overflow-hidden"
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    transition={{ type: 'spring', duration: 0.4, bounce: 0.1 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 sm:px-8 pt-6 sm:pt-8 pb-4">
                        <div>
                            <h2 className="font-sans font-bold text-2xl tracking-tight text-white mb-1">
                                Certifications
                            </h2>
                            <p className="font-sans text-sm text-neutral-400">
                                Google Cybersecurity · {CERTIFICATES.length} courses
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-neutral-500 hover:text-white transition-colors p-1"
                            aria-label="Close"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="mx-6 sm:mx-8 border-t border-white/10" />

                    {/* Certificate List */}
                    <style>{`.cert-scroll::-webkit-scrollbar { display: none; }`}</style>
                    <div
                        ref={scrollRef}
                        className="cert-scroll px-6 sm:px-8 py-5 max-h-[60vh] overflow-y-auto"
                        style={{ scrollbarWidth: 'none' }}
                    >
                        <div className="flex flex-col gap-3">
                            {CERTIFICATES.map((cert, i) => (
                                <motion.div
                                    key={cert.title}
                                    className="group flex items-start gap-4 p-4 rounded-xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/15 transition-all duration-200"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.04, duration: 0.3 }}
                                >
                                    {/* Icon */}
                                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20 flex items-center justify-center mt-0.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                                            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                            <path d="M6 12v5c3 3 9 3 12 0v-5" />
                                        </svg>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-sans font-semibold text-[14px] text-white leading-snug mb-1">
                                            {cert.title}
                                        </p>
                                        <p className="font-sans text-xs text-neutral-500">
                                            {cert.issuer}
                                        </p>
                                    </div>

                                    {/* Grade Badge */}
                                    <div className="flex-shrink-0 self-center">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold font-sans bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            {cert.grade}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-2">
                        <div className="flex items-center gap-2 text-neutral-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 16v-4" />
                                <path d="M12 8h.01" />
                            </svg>
                            <p className="font-sans text-xs">
                                All certificates earned through Coursera
                            </p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

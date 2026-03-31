'use client';

import React, { useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Certificate {
    title: string;
    issuer: string;
    grade: number;
    url: string;
}

const CERTIFICATES: Certificate[] = [
    { title: 'Assets, Threats, and Vulnerabilities', issuer: 'Google', grade: 98.75, url: 'https://www.coursera.org/account/accomplishments/certificate/48I0QYS0U3R1' },
    { title: 'Tools of the Trade: Linux and SQL', issuer: 'Google', grade: 98.08, url: 'https://www.coursera.org/account/accomplishments/certificate/U2ES8MGHF1VV' },
    { title: 'Automate Cybersecurity Tasks with Python', issuer: 'Google', grade: 95.84, url: 'https://www.coursera.org/account/accomplishments/certificate/LELTU5MH6F44' },
    { title: 'Sound the Alarm: Detection and Response', issuer: 'Google', grade: 94.65, url: 'https://www.coursera.org/account/accomplishments/certificate/55SYYDCPPKWC' },
    { title: 'Connect and Protect: Networks and Network Security', issuer: 'Google', grade: 92.87, url: 'https://www.coursera.org/account/accomplishments/certificate/VBPBP78742LP' },
    { title: 'Foundations of Cybersecurity', issuer: 'Google', grade: 91.88, url: 'https://www.coursera.org/account/accomplishments/certificate/WCYQWEV7JC7P' },
    { title: 'Play It Safe: Manage Security Risks', issuer: 'Google', grade: 91.09, url: 'https://www.coursera.org/account/accomplishments/certificate/M29AVZFKNS56' },
];

interface CertificatesModalProps {
    onClose: () => void;
}

export const CertificatesModal: React.FC<CertificatesModalProps> = ({ onClose }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.stopPropagation();
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                top: e.deltaY,
                behavior: 'smooth',
            });
        }
    }, []);

    // Average grade across all certs
    const avgGrade = (CERTIFICATES.reduce((sum, c) => sum + c.grade, 0) / CERTIFICATES.length).toFixed(1);

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md pointer-events-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                onWheel={handleWheel}
            >
                <motion.div
                    className="relative w-full max-w-[660px] bg-black border border-white/70 rounded-2xl shadow-2xl overflow-hidden"
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    transition={{ type: 'spring', duration: 0.4, bounce: 0.1 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* ── Header ── */}
                    <div className="px-6 pt-6 pb-5">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="font-mono font-bold text-[22px] text-white tracking-tight">
                                    Certifications.
                                </h2>
                                <p className="font-mono text-[14px] text-neutral-400 mt-1">
                                    Google Cybersecurity Professional Certificate
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-neutral-400 hover:text-white transition-colors mt-0.5"
                                aria-label="Close"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center gap-4 font-mono text-[13px]">
                            <div className="flex items-center gap-1.5">
                                <span className="text-neutral-400">courses</span>
                                <span className="text-white font-bold">{CERTIFICATES.length}</span>
                            </div>
                            <div className="w-px h-3 bg-neutral-700" />
                            <div className="flex items-center gap-1.5">
                                <span className="text-neutral-400">avg grade</span>
                                <span className="text-white font-bold">{avgGrade}%</span>
                            </div>
                            <div className="w-px h-3 bg-neutral-700" />
                            <div className="flex items-center gap-1.5">
                                <span className="text-neutral-400">issuer</span>
                                <span className="text-white font-bold">Google</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Divider ── */}
                    <div className="border-t border-white/10" />

                    {/* ── Certificate List ── */}
                    <style>{`.cert-scroll::-webkit-scrollbar{display:none;}`}</style>
                    <div
                        ref={scrollRef}
                        className="cert-scroll px-4 py-3 max-h-[52vh] overflow-y-auto"
                        style={{ scrollbarWidth: 'none' }}
                    >
                        {CERTIFICATES.map((cert, i) => (
                            <motion.a
                                key={cert.title}
                                href={cert.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-4 px-3 py-3.5 rounded-xl hover:bg-white/[0.04] transition-colors duration-150 cursor-pointer"
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05, duration: 0.25 }}
                            >
                                {/* Rank number */}
                                <span className="font-mono text-[13px] text-neutral-500 w-4 text-right shrink-0 tabular-nums">
                                    {i + 1}
                                </span>

                                {/* Grade bar */}
                                <div className="w-[52px] shrink-0">
                                    <div className="h-[3px] w-full bg-neutral-800 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-neutral-300 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${cert.grade}%` }}
                                            transition={{ delay: 0.3 + i * 0.05, duration: 0.6, ease: 'easeOut' }}
                                        />
                                    </div>
                                </div>

                                {/* Title & Issuer */}
                                <div className="flex-1 min-w-0 flex items-center gap-2">
                                    <p className="font-mono text-[14px] text-neutral-200 leading-tight truncate group-hover:text-white transition-colors duration-150">
                                        {cert.title}
                                    </p>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover:opacity-100 text-neutral-400 transition-opacity duration-150 shrink-0">
                                        <line x1="7" y1="17" x2="17" y2="7"></line>
                                        <polyline points="7 7 17 7 17 17"></polyline>
                                    </svg>
                                </div>

                                {/* Grade */}
                                <span className="font-mono text-[13px] text-neutral-400 tabular-nums shrink-0 group-hover:text-neutral-300 transition-colors duration-150">
                                    {cert.grade.toFixed(1)}%
                                </span>
                            </motion.a>
                        ))}
                    </div>

                    {/* ── Footer ── */}
                    <div className="border-t border-white/10" />
                    <div className="px-6 py-4 flex items-center justify-between">
                        <p className="font-mono text-[12px] text-neutral-500">
                            via Coursera · all verified
                        </p>
                        <div className="flex items-center gap-1.5 font-mono text-[12px] text-neutral-500">
                            <span></span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <polyline points="19 12 12 19 5 12" />
                            </svg>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

'use client';

import React, { useState, useTransition } from 'react';
import { sendContact } from '@/app/actions/contact';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface ContactModalProps {
    onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ onClose }) => {
    const [isPending, startTransition] = useTransition();
    const [nameErr, setNameErr] = useState('');
    const [emailErr, setEmailErr] = useState('');
    const [msgErr, setMsgErr] = useState('');

    const handleAction = (formData: FormData) => {
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const message = formData.get('message') as string;
        let isValid = true;

        if (!name || name.trim() === '') {
            setNameErr('Please enter your name.');
            isValid = false;
        } else {
            setNameErr('');
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailErr('Please enter a valid email address.');
            isValid = false;
        } else {
            setEmailErr('');
        }

        if (!message || message.trim() === '') {
            setMsgErr('Message cannot be empty.');
            isValid = false;
        } else {
            setMsgErr('');
        }

        if (!isValid) return;

        startTransition(async () => {
            try {
                const res = await sendContact(formData);
                toast.success(res?.message || "Message sent! I'll get back to you soon.");
                setTimeout(() => {
                    onClose();
                }, 2000);
            } catch (err: any) {
                toast.error(err?.message || "Failed to send message. Please try again.");
            }
        });
    };

    const inputBase = 'w-full bg-transparent border rounded-lg px-4 py-2.5 text-white font-sans placeholder:text-neutral-500 focus:outline-none focus:border-white transition-colors';
    const textareaBase = 'w-full bg-transparent border rounded-xl px-4 py-3 text-white font-sans placeholder:text-neutral-500 focus:outline-none focus:border-white transition-colors resize-none';

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="relative w-full max-w-md bg-[#0c0c0c] border border-white/15 rounded-xl p-6 sm:p-8 shadow-2xl"
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    transition={{ type: 'spring', duration: 0.4, bounce: 0.1 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-5 right-5 text-neutral-500 hover:text-white transition-colors"
                        aria-label="Close"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>

                    <h2 className="font-sans font-bold text-2xl tracking-tight text-white mb-1">Get in Touch</h2>
                    <p className="font-sans text-sm text-neutral-400 mb-7">I typically respond within a day.</p>

                    <form action={handleAction} className="flex flex-col gap-5">
                        {/* Name */}
                        <div>
                            <label htmlFor="contact-name" className="block font-sans font-medium text-sm text-white mb-2 ml-1">Your Name</label>
                            <input
                                id="contact-name"
                                name="name"
                                type="text"
                                placeholder="John Doe"
                                className={`${inputBase} ${nameErr ? 'border-red-500' : 'border-neutral-700'}`}
                                disabled={isPending}
                            />
                            {nameErr && <p className="font-sans text-xs text-red-400 mt-2 ml-2">{nameErr}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="contact-email" className="block font-sans font-medium text-sm text-white mb-2 ml-1">Email Address</label>
                            <input
                                id="contact-email"
                                name="email"
                                type="text"
                                placeholder="hello@yourdomain.com"
                                className={`${inputBase} ${emailErr ? 'border-red-500' : 'border-neutral-700'}`}
                                disabled={isPending}
                            />
                            {emailErr && <p className="font-sans text-xs text-red-400 mt-2 ml-2">{emailErr}</p>}
                        </div>

                        {/* Message */}
                        <div>
                            <label htmlFor="contact-message" className="block font-sans font-medium text-sm text-white mb-2 ml-1">How can I help?</label>
                            <textarea
                                id="contact-message"
                                name="message"
                                rows={4}
                                placeholder="Tell me about your project or inquiry..."
                                className={`${textareaBase} ${msgErr ? 'border-red-500' : 'border-neutral-700'}`}
                                disabled={isPending}
                            />
                            {msgErr && <p className="font-sans text-xs text-red-400 mt-2 ml-2">{msgErr}</p>}
                        </div>

                        <div className="flex justify-end mt-1">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="bg-white text-black font-semibold font-sans rounded-full px-8 py-2.5 hover:bg-neutral-200 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
                            >
                                {isPending ? 'Sending...' : 'Send Message'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

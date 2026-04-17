import React from 'react';
import { BrainCircuit, ShieldCheck, Award, Mail, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-slate-100 py-16 mt-20">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
                    {/* Branding Column */}
                    <div className="md:col-span-5">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-teal-600 p-2 rounded-xl shadow-lg shadow-teal-600/20">
                                <BrainCircuit className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-black text-slate-900 tracking-tighter italic">AI Learning</span>
                        </div>
                        <p className="text-slate-500 text-lg leading-relaxed max-w-md font-medium">
                            Transforming the way students interact with knowledge. Intelligent analysis, automated insights, and personalized growth.
                        </p>
                        <div className="flex items-center gap-4 mt-8">
                            {[Award, MessageSquare, Mail].map((Icon, i) => (
                                <a key={i} href="#" className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all">
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>
                    
                    {/* Spacer */}
                    <div className="hidden md:block md:col-span-1"></div>
                    
                    {/* Links Columns */}
                    <div className="md:col-span-2">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Platform</h4>
                        <ul className="space-y-4">
                            {['Dashboard', 'Recent Docs', 'Mastery Hub', 'AI Chat'].map((link) => (
                                <li key={link}>
                                    <a href="#" className="text-slate-600 font-bold hover:text-teal-600 transition-colors">{link}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="md:col-span-2">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Resources</h4>
                        <ul className="space-y-4">
                            {['Help Center', 'API Docs', 'Community', 'Case Studies'].map((link) => (
                                <li key={link}>
                                    <a href="#" className="text-slate-600 font-bold hover:text-teal-600 transition-colors">{link}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="md:col-span-2">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Legal</h4>
                        <ul className="space-y-4">
                            {['Privacy', 'Terms', 'Security', 'Compliance'].map((link) => (
                                <li key={link}>
                                    <a href="#" className="text-slate-600 font-bold hover:text-teal-600 transition-colors">{link}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                
                <div className="pt-12 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                        © 2026 AI Learning Assistant &bull; Built for Excellence
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                            Secure Academic Grade
                        </div>
                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.15em]">
                            Powered by <span className="text-slate-400 italic font-black">Google Gemini 1.5 Flash</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

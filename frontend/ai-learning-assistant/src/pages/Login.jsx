import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, ShieldCheck, Mail, Lock, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';
import authBg from '../assets/auth-bg.png';
import Footer from '../components/Footer';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            if (!err.response) {
                setError('Backend server is offline. Please start the server on port 5000.');
            } else {
                setError(err.response.data?.message || 'Invalid credentials. Please try again.');
            }
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-teal-500 selection:text-white flex flex-col">
            <div className="flex-1 flex flex-col lg:flex-row">
            {/* Left Section: Visual Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-100 relative overflow-hidden items-center justify-center">
                {/* Background Image with Mesh Gradient Overlay */}
                <div 
                    className="absolute inset-0 z-0 opacity-80"
                    style={{ 
                        backgroundImage: `url(${authBg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'contrast(1.1) brightness(1.05)'
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-teal-900/40 via-transparent to-white/10 z-10" />
                
                {/* Content Overlay */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="relative z-20 p-16 max-w-xl"
                >
                    <div className="bg-white/20 backdrop-blur-xl border border-white/30 p-8 rounded-[3rem] shadow-2xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-teal-600 p-2.5 rounded-xl shadow-lg">
                                <BrainCircuit className="w-8 h-8 text-white" />
                            </div>
                            <span className="text-2xl font-black text-teal-900 tracking-tighter">AI Learning Assistant</span>
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tighter">
                            The future of learning is <span className="text-teal-700">intelligent.</span>
                        </h1>
                        <p className="text-slate-700 text-lg font-medium leading-relaxed mb-8 opacity-80">
                            Harness the power of Google Gemini to transform your documents into mastery. Summaries, flashcards, and quizzes created in seconds.
                        </p>
                        
                        <div className="flex items-center gap-4 py-6 border-t border-white/20">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className={`w-10 h-10 rounded-full border-2 border-white bg-slate-${i+1}00 transition-transform hover:scale-110 cursor-pointer`} />
                                ))}
                            </div>
                            <p className="text-sm font-bold text-slate-800">Joined by 10,000+ students</p>
                        </div>
                    </div>
                </motion.div>
                
                {/* Bottom Badge */}
                <div className="absolute bottom-8 left-16 z-20 flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] opacity-50">
                    <ShieldCheck className="w-4 h-4" />
                    Secure Academic Environment
                </div>
            </div>

            {/* Right Section: Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-24 relative bg-white">
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    {/* Mobile Header */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-12">
                         <div className="bg-teal-600 p-2 rounded-xl">
                            <BrainCircuit className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-black text-slate-900 tracking-tighter">AI Learning</span>
                    </div>

                    <div className="mb-10">
                        <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">Sign In</h2>
                        <p className="text-slate-500 font-medium">Please enter your details to continue your journey.</p>
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-2xl mb-8 text-sm font-medium flex items-center gap-3"
                        >
                            <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                                <input
                                    type="email"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium border-transparent shadow-sm"
                                    placeholder="johndoe@university.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-end mr-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                                <button type="button" className="text-[10px] font-black text-teal-600 uppercase tracking-widest hover:underline">Forgot?</button>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                                <input
                                    type="password"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium border-transparent shadow-sm"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-teal-600/20 transition-all active:scale-[0.98] text-lg flex items-center justify-center gap-3"
                        >
                            <LogIn className="w-5 h-5" />
                            Sign Into Workspace
                        </button>
                    </form>

                    <div className="my-10 flex items-center gap-4">
                        <div className="h-px bg-slate-100 flex-1" />
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">or continue with</span>
                        <div className="h-px bg-slate-100 flex-1" />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <button className="flex items-center justify-center gap-3 bg-white border border-slate-100 py-4 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                            <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-5 h-5" alt="Google" />
                            Sign in with Google
                        </button>
                    </div>

                    <p className="text-slate-500 text-center mt-12 font-medium">
                        New student? <Link to="/signup" className="text-teal-700 font-black hover:underline underline-offset-4">Create your account</Link>
                    </p>
                </motion.div>

                {/* Footer Attribution */}
                <div className="absolute bottom-8 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    Powered by <span className="text-slate-400">Google Gemini</span> &bull; &copy; 2026 AI Learning
                </div>
                </div>
            </div>
            
            <Footer />
        </div>
    );
};

export default Login;

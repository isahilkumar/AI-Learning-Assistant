import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, CheckCircle2, XCircle, RefreshCcw, Loader2, Award, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QuizView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState([]);
    const [currentStep, setCurrentStep] = useState(0); // 0: Start, 1: Quiz, 2: Results
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [docTitle, setDocTitle] = useState('');

    useEffect(() => {
        const fetchDoc = async () => {
            try {
                const res = await api.get(`/documents/${id}`);
                setDocTitle(res.data.title);
            } catch (err) { navigate('/'); }
        };
        fetchDoc();
    }, [id, navigate]);

    const startQuiz = async () => {
        setLoading(true);
        try {
            const searchParams = new URLSearchParams(window.location.search);
            const lang = searchParams.get('lang') || 'Auto';
            const res = await api.get(`/ai/quiz/${id}?lang=${lang}`);
            setQuiz(res.data.quiz);
            setCurrentStep(1);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (index) => {
        const newAnswers = [...userAnswers, index];
        setUserAnswers(newAnswers);
        
        if (currentIndex < quiz.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            const finalScore = newAnswers.reduce((score, ans, i) => {
                return ans === quiz[i].correctAnswer ? score + 1 : score;
            }, 0);
            
            // Save result to backend
            api.post('/ai/progress', {
                docId: id,
                score: finalScore,
                totalQuestions: quiz.length
            }).catch(err => console.error('Failed to save progress:', err));
            
            setCurrentStep(2);
        }
    };

    const calculateScore = () => {
        return userAnswers.reduce((score, ans, i) => {
            return ans === quiz[i].correctAnswer ? score + 1 : score;
        }, 0);
    };

    if (loading) {
        return (
            <div className="h-screen bg-white flex flex-col items-center justify-center text-slate-900">
                <Loader2 className="w-12 h-12 text-teal-600 animate-spin mb-4" />
                <h2 className="text-xl font-bold">Generating personalized quiz...</h2>
                <p className="text-slate-500 mt-2">Gemini is analyzing your document content.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
            <header className="px-6 py-4 border-b border-slate-200 flex items-center gap-4 bg-white/80 backdrop-blur-md">
                <button onClick={() => navigate(`/document/${id}`)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
                <h1 className="text-lg font-bold truncate text-slate-900">Quiz: {docTitle}</h1>
            </header>

            <main className="flex-1 flex items-center justify-center p-6">
                <AnimatePresence mode="wait">
                    {currentStep === 0 && (
                        <motion.div 
                            key="start"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="glass p-10 rounded-3xl max-w-xl text-center shadow-xl"
                        >
                            <div className="bg-teal-50 p-4 rounded-2xl w-fit mx-auto mb-6">
                                <Award className="w-12 h-12 text-teal-600" />
                            </div>
                            <h2 className="text-3xl font-extrabold mb-4 text-slate-900">Are you ready?</h2>
                            <p className="text-slate-600 mb-8">Test your knowledge on "{docTitle}". Our AI has prepared a set of questions to challenge your understanding.</p>
                            <button 
                                onClick={startQuiz}
                                className="w-full bg-teal-600 hover:bg-teal-500 py-4 rounded-2xl font-bold shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2 text-white"
                            >
                                Start Assessment
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}

                    {currentStep === 1 && (
                        <motion.div 
                            key="quiz"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full max-w-2xl"
                        >
                            <div className="mb-8">
                                <div className="flex justify-between text-sm text-slate-500 mb-2 font-bold">
                                    <span>Question {currentIndex + 1} of {quiz.length}</span>
                                    <span>{Math.round(((currentIndex) / quiz.length) * 100)}% Complete</span>
                                </div>
                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <motion.div 
                                        className="h-full bg-teal-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((currentIndex + 1) / quiz.length) * 100}%` }}
                                    />
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 p-8 rounded-3xl relative overflow-hidden shadow-sm">
                                <div className="absolute top-0 right-0 p-8 text-6xl font-black text-slate-100 select-none">Q{currentIndex + 1}</div>
                                <h3 className="text-2xl font-bold mb-8 relative z-10 leading-snug text-slate-900">{quiz[currentIndex].question}</h3>
                                
                                <div className="space-y-4">
                                    {quiz[currentIndex].options.map((option, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => handleAnswer(i)}
                                            className="w-full text-left p-5 rounded-2xl bg-white border border-slate-200 hover:bg-teal-50 hover:border-teal-500/50 transition-all flex items-center gap-4 group shadow-sm"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-400 group-hover:bg-teal-600 group-hover:text-white transition-all">
                                                {String.fromCharCode(65 + i)}
                                            </div>
                                            <span className="font-medium">{option}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 2 && (
                        <motion.div 
                            key="results"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full max-w-4xl"
                        >
                            <div className="text-center mb-12">
                                <div className="bg-green-50 p-5 rounded-3xl w-fit mx-auto mb-6">
                                    <Award className="w-16 h-16 text-green-600" />
                                </div>
                                <h2 className="text-4xl font-black mb-2 text-slate-900">Quiz Completed!</h2>
                                <p className="text-slate-600 font-medium text-lg">You scored <span className="text-teal-600 font-black">{calculateScore()} out of {quiz.length}</span></p>
                            </div>

                            <div className="grid grid-cols-1 gap-6 mb-12">
                                {quiz.map((q, i) => (
                                    <div key={i} className={`p-6 rounded-3xl border ${userAnswers[i] === q.correctAnswer ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                        <div className="flex items-start gap-4">
                                            {userAnswers[i] === q.correctAnswer ? (
                                                <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-1" />
                                            ) : (
                                                <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                                            )}
                                            <div className="flex-1">
                                                <h4 className="font-bold mb-3">{q.question}</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                                    {q.options.map((opt, optIdx) => (
                                                        <div key={optIdx} className={`px-4 py-2 rounded-xl text-sm border ${
                                                            optIdx === q.correctAnswer ? 'border-green-500/50 bg-green-50 text-green-700 font-bold' : 
                                                            (optIdx === userAnswers[i] && optIdx !== q.correctAnswer ? 'border-red-500/50 bg-red-50 text-red-700' : 'border-slate-100 bg-white text-slate-500')
                                                        }`}>
                                                            {opt}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-inner">
                                                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Explanation</p>
                                                    <p className="text-sm text-slate-600 font-medium">{q.explanation}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-4">
                                <button 
                                    onClick={() => {
                                        setCurrentStep(0);
                                        setCurrentIndex(0);
                                        setUserAnswers([]);
                                    }}
                                    className="flex-1 bg-slate-200 hover:bg-slate-300 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 text-slate-700"
                                >
                                    <RefreshCcw className="w-5 h-5" />
                                    Try Again
                                </button>
                                <button 
                                    onClick={() => navigate(`/document/${id}`)}
                                    className="flex-1 bg-teal-600 hover:bg-teal-500 py-4 rounded-2xl font-bold shadow-lg shadow-teal-600/20 transition-all text-white"
                                >
                                    Back to Document
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default QuizView;

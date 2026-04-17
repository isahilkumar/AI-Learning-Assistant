import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, MessageSquare, FileText, Sparkles, BrainCircuit, Layers, Award, ZoomIn, ZoomOut, Highlighter, Copy, Check, Volume2, VolumeX, Printer } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion } from 'framer-motion';
import Flashcard from '../components/Flashcard';
import ConceptMap from '../components/ConceptMap';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const DocumentView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [doc, setDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [activeTab, setActiveTab] = useState('chat'); // chat, summary, flashcards, quiz
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [summary, setSummary] = useState('');
    const [flashcards, setFlashcards] = useState([]);
    const [conceptMap, setConceptMap] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [scale, setScale] = useState(1.2);
    const [highlights, setHighlights] = useState([]);
    const [highlightError, setHighlightError] = useState('');
    const [copied, setCopied] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('Auto');

    const languages = [
        'Auto', 'English', 'Spanish', 'French', 'German', 'Hindi', 'Chinese', 'Japanese', 'Korean', 'Portuguese', 'Italian', 'Russian', 'Arabic'
    ];

    useEffect(() => {
        const fetchDoc = async () => {
            try {
                const res = await api.get(`/documents/${id}`);
                setDoc(res.data);
            } catch (err) {
                console.error(err);
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchDoc();
    }, [id, navigate]);

    const handleSendMessage = async () => {
        if (!chatInput.trim()) return;
        const userMsg = { role: 'user', text: chatInput };
        setChatHistory(prev => [...prev, userMsg]);
        setChatInput('');
        setIsGenerating(true);

        try {
            const res = await api.post(`/ai/chat/${id}`, { 
                question: chatInput, 
                history: chatHistory,
                lang: selectedLanguage 
            });
            setChatHistory(prev => [...prev, { role: 'assistant', text: res.data.answer }]);
        } catch (err) {
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateSummary = async () => {
        setIsGenerating(true);
        setSummary(''); // Clear old summary if any
        try {
            const res = await api.get(`/ai/summary/${id}?lang=${selectedLanguage}`);
            setSummary(res.data.summary);
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Failed to generate summary. Please check your AI quota.';
            setSummary(`⚠️ ${msg}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateFlashcards = async () => {
        setIsGenerating(true);
        setFlashcards([]);
        try {
            const res = await api.get(`/ai/flashcards/${id}?lang=${selectedLanguage}`);
            setFlashcards(res.data.flashcards);
        } catch (err) {
            console.error(err);
            // Optionally set an error state for flashcards if you want a specific UI
            // For now, let's keep it consistent
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateConceptMap = async () => {
        setIsGenerating(true);
        setConceptMap(null);
        try {
            const res = await api.get(`/ai/concept-map/${id}?lang=${selectedLanguage}`);
            setConceptMap(res.data.conceptMap);
        } catch (err) {
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateHighlights = async () => {
        setIsGenerating(true);
        setHighlightError('');
        setHighlights([]);
        try {
            const res = await api.get(`/ai/highlights/${id}?lang=${selectedLanguage}`);
            if (res.data && Array.isArray(res.data.highlights)) {
                setHighlights(res.data.highlights);
            } else {
                setHighlightError('Unexpected response format from server.');
            }
        } catch (err) {
            console.error('Highlights error:', err);
            const msg = err.response?.data?.message || err.message || 'Failed to generate highlights.';
            setHighlightError(msg);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSpeak = (text) => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
    };

    const handlePrintSummary = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html><head><title>${doc.title} - AI Summary</title>
            <style>body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:20px;line-height:1.8;color:#1e293b}
            h1{color:#147965;border-bottom:2px solid #147965;padding-bottom:8px}pre{white-space:pre-wrap;font-family:inherit}</style></head>
            <body><h1>${doc.title} - AI Summary</h1><pre>${summary}</pre></body></html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }

    if (loading) return <div className="h-screen bg-white flex items-center justify-center text-slate-900">Loading document...</div>;

    const fileUrl = `http://localhost:5000/uploads/${doc.fileName}`;

    return (
        <div className="h-screen bg-white flex flex-col overflow-hidden text-slate-900">
            {/* Header */}
            <header className="px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-teal-600">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="h-8 w-px bg-slate-200 hidden md:block mx-1" />
                    <div className="bg-teal-600 p-1.5 rounded-lg hidden md:block shadow-sm">
                        <BrainCircuit className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-slate-900 font-bold leading-none mb-1">{doc.title}</h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Page {pageNumber} of {numPages}</p>
                    </div>
                </div>
                
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2 px-3 border-r border-slate-200 mr-1">
                        <span className="text-[10px] font-black uppercase text-slate-400">Lang</span>
                        <select 
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            className="bg-transparent text-xs font-bold text-teal-600 focus:outline-none cursor-pointer"
                        >
                            {languages.map(lang => (
                                <option key={lang} value={lang}>{lang}</option>
                            ))}
                        </select>
                    </div>
                    <button 
                        onClick={() => setActiveTab('chat')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'chat' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-teal-600'}`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        AI Chat
                    </button>
                    <button 
                        onClick={() => setActiveTab('summary')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'summary' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-teal-600'}`}
                    >
                        <Sparkles className="w-4 h-4" />
                        Summarize
                    </button>
                    <button 
                        onClick={() => setActiveTab('flashcards')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'flashcards' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-teal-600'}`}
                    >
                        <Layers className="w-4 h-4" />
                        Flashcards
                    </button>
                    <button 
                        onClick={() => setActiveTab('highlights')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'highlights' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-teal-600'}`}
                    >
                        <Highlighter className="w-4 h-4" />
                        Highlights
                    </button>
                    <button 
                        onClick={() => setActiveTab('quiz')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'quiz' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-teal-600'}`}
                    >
                        <Award className="w-4 h-4" />
                        Quiz
                    </button>
                    <button 
                        onClick={() => setActiveTab('conceptMap')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'conceptMap' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-teal-600'}`}
                    >
                        <BrainCircuit className="w-4 h-4" />
                        Mind Map
                    </button>
                </div>
            </header>

            {/* Main Content Areas */}
            <div className="flex-1 flex overflow-hidden">
                {/* PDF Viewer Pane */}
                <div className="flex-1 bg-slate-50 p-8 overflow-y-auto flex justify-center custom-scrollbar">
                    <div className="shadow-2xl shadow-slate-200">
                        <Document
                            file={fileUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            className="max-w-full"
                            loading={<div className="text-slate-500 font-medium">Loading PDF...</div>}
                        >
                            <Page 
                                pageNumber={pageNumber} 
                                scale={scale}
                                renderAnnotationLayer={true}
                                renderTextLayer={true}
                            />
                        </Document>
                        
                        <div className="mt-6 flex justify-center items-center gap-4 bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-slate-200 sticky bottom-0 shadow-sm">
                            <button 
                                disabled={pageNumber <= 1}
                                onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                                className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded-lg text-slate-700 font-medium"
                            >
                                Previous
                            </button>
                            <span className="text-slate-900 text-sm font-bold">Page {pageNumber} / {numPages}</span>
                            <button 
                                disabled={pageNumber >= numPages}
                                onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))}
                                className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded-lg text-slate-700 font-medium"
                            >
                                Next
                            </button>
                            <div className="h-4 w-px bg-slate-200 mx-2" />
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setScale(prev => Math.max(prev - 0.2, 0.5))}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
                                    title="Zoom Out"
                                >
                                    <ZoomOut className="w-5 h-5" />
                                </button>
                                <span className="text-xs font-bold text-slate-500 min-w-[3rem] text-center">
                                    {Math.round(scale * 100)}%
                                </span>
                                <button 
                                    onClick={() => setScale(prev => Math.min(prev + 0.2, 3.0))}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
                                    title="Zoom In"
                                >
                                    <ZoomIn className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Tools Pane */}
                <div className="w-[450px] border-l border-slate-100 bg-white flex flex-col shrink-0">
                    {activeTab === 'chat' && (
                        <div className="flex-1 flex flex-col p-6 overflow-hidden">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-teal-50 p-2 rounded-lg text-teal-600"><BrainCircuit className="w-5 h-5" /></div>
                                <h2 className="text-xl font-bold text-slate-900">Document Assistant</h2>
                            </div>
                            
                            <div className="flex-1 bg-slate-50/50 rounded-2xl border border-slate-100 p-4 mb-4 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                                {chatHistory.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400">
                                        <MessageSquare className="w-12 h-12 mb-4 text-slate-200" />
                                        <p className="text-sm italic">Ask any question about this document.<br/>The AI will analyze the content and respond.</p>
                                    </div>
                                ) : (
                                    chatHistory.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-teal-600 text-white' : 'bg-white text-slate-700 border border-slate-200 shadow-sm'}`}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))
                                )}
                                {isGenerating && (
                                    <div className="flex justify-start">
                                        <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-sm">
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative">
                                <input 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all pr-12 font-medium"
                                    placeholder="Message your document..."
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    disabled={isGenerating}
                                />
                                <button 
                                    type="submit"
                                    disabled={isGenerating || !chatInput.trim()}
                                    className="absolute right-3 top-2.5 bg-teal-600 p-2 rounded-xl text-white hover:bg-teal-500 disabled:bg-slate-700 shadow-lg shadow-teal-600/30 transition-all"
                                >
                                    <Sparkles className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    )}
                    {activeTab === 'summary' && (
                        <div className="flex-1 p-6 overflow-hidden flex flex-col">
                             <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-teal-50 p-2 rounded-lg text-teal-600"><Sparkles className="w-5 h-5" /></div>
                                    <h2 className="text-xl font-bold text-slate-900">AI Summary</h2>
                                </div>
                                {summary && (
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => handleSpeak(summary)} className={`p-2 rounded-lg transition-all text-slate-500 hover:text-teal-600 hover:bg-teal-50 ${isSpeaking ? 'bg-teal-50 text-teal-600' : ''}`} title={isSpeaking ? 'Stop' : 'Listen'}>
                                            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                        </button>
                                        <button onClick={() => handleCopy(summary)} className="p-2 rounded-lg transition-all text-slate-500 hover:text-teal-600 hover:bg-teal-50" title="Copy">
                                            {copied ? <Check className="w-4 h-4 text-teal-600" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                        <button onClick={handlePrintSummary} className="p-2 rounded-lg transition-all text-slate-500 hover:text-teal-600 hover:bg-teal-50" title="Print / Save PDF">
                                            <Printer className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-100 p-6 overflow-y-auto custom-scrollbar">
                                {summary ? (
                                    <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                                        {summary}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center">
                                        <Sparkles className="w-12 h-12 mb-4 text-slate-100" />
                                        <p className="text-slate-400 text-sm mb-6 px-4">Get a professional summary of the document in seconds.</p>
                                        <button 
                                            onClick={handleGenerateSummary}
                                            disabled={isGenerating}
                                            className="w-full bg-teal-600 hover:bg-teal-500 disabled:bg-slate-200 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            {isGenerating ? 'Analyzing...' : 'Generate Full Summary'}
                                        </button>
                                    </div>
                                )}
                            </div>
                            {summary && (
                                <div className="mt-4 flex items-center gap-3 justify-center">
                                    <button onClick={handleGenerateSummary} className="text-teal-600 text-xs hover:underline flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" /> Regenerate
                                    </button>
                                    <span className="text-slate-200">|</span>
                                    <button onClick={handlePrintSummary} className="text-slate-400 text-xs hover:text-teal-600 flex items-center gap-1">
                                        <Printer className="w-3 h-3" /> Save as PDF
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'flashcards' && (
                        <div className="flex-1 p-6 overflow-hidden flex flex-col">
                             <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-teal-50 p-2 rounded-lg text-teal-600"><Layers className="w-5 h-5" /></div>
                                    <h2 className="text-xl font-bold text-slate-900">Smart Flashcards</h2>
                                </div>
                                {flashcards.length > 0 && (
                                    <button 
                                        onClick={() => navigate(`/quiz/${id}?lang=${selectedLanguage}`)}
                                        className="bg-teal-50 hover:bg-teal-600 text-teal-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-teal-500/20 flex items-center gap-1"
                                    >
                                        <Award className="w-3.5 h-3.5" />
                                        Take Quiz
                                    </button>
                                )}
                            </div>
                            
                            <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-6">
                                {flashcards.length > 0 ? (
                                    <div className="space-y-6">
                                        {flashcards.map((card, i) => (
                                            <Flashcard key={i} card={card} i={i} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center">
                                        <Layers className="w-12 h-12 mb-4 text-slate-100" />
                                        <p className="text-slate-400 text-sm mb-6 px-4">Automatically extract key study cards from your document content.</p>
                                        <button 
                                            onClick={handleGenerateFlashcards}
                                            disabled={isGenerating}
                                            className="w-full bg-teal-600 hover:bg-teal-500 disabled:bg-slate-200 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            {isGenerating ? 'Extracting...' : 'Create Study Set'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {activeTab === 'highlights' && (
                        <div className="flex-1 p-6 overflow-hidden flex flex-col">
                             <div className="flex items-center gap-3 mb-6">
                                <div className="bg-teal-50 p-2 rounded-lg text-teal-600"><Highlighter className="w-5 h-5" /></div>
                                <h2 className="text-xl font-bold text-slate-900">Golden Sentences</h2>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-6">
                                {highlights.length > 0 ? (
                                    <div className="space-y-4">
                                        {highlights.map((h, i) => (
                                            <motion.div 
                                                key={i}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:border-teal-500/30 transition-all group"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${h.priority === 'Critical' ? 'bg-red-50 text-red-600' : 'bg-teal-50 text-teal-600'}`}>
                                                        {h.priority}
                                                    </span>
                                                    <div className="bg-slate-50 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Highlighter className="w-3.5 h-3.5 text-teal-600" />
                                                    </div>
                                                </div>
                                                <p className="text-slate-900 font-bold leading-relaxed mb-3">
                                                    "{h.text}"
                                                </p>
                                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Exam Rationale</p>
                                                    <p className="text-xs text-slate-600 leading-normal">{h.rationale}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center">
                                        <div className="bg-slate-50 p-6 rounded-3xl mb-6">
                                            <Highlighter className="w-12 h-12 text-slate-200" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">Find the "Golden Sentences"</h3>
                                        <p className="text-slate-400 text-sm mb-8 px-8">Let the AI scan your document to pull out the most important points likely to appear on an exam.</p>
                                        
                                        {highlightError && (
                                            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium">
                                                ⚠️ {highlightError}
                                            </div>
                                        )}

                                        <button 
                                            onClick={handleGenerateHighlights}
                                            disabled={isGenerating}
                                            className="w-full bg-teal-600 hover:bg-teal-500 disabled:bg-slate-200 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            {isGenerating ? 'Scanning Document...' : 'Analyze Highlights'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {activeTab === 'quiz' && (
                        <div className="flex-1 p-6 overflow-hidden flex flex-col">
                             <div className="flex items-center gap-3 mb-6">
                                <div className="bg-teal-50 p-2 rounded-lg text-teal-600"><Award className="w-5 h-5" /></div>
                                <h2 className="text-xl font-bold text-slate-900">Knowledge Check</h2>
                            </div>
                            
                            <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-100 p-8 flex flex-col items-center justify-center text-center">
                                <Award className="w-16 h-16 mb-6 text-slate-100" />
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Ready for an Assessment?</h3>
                                <p className="text-slate-400 text-sm mb-8 px-4">Our AI will generate a personalized quiz based on the document content to test your mastery.</p>
                                <button 
                                    onClick={() => navigate(`/quiz/${id}?lang=${selectedLanguage}`)}
                                    className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
                                >
                                    Start AI Quiz
                                    <Sparkles className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                    {activeTab === 'conceptMap' && (
                        <div className="flex-1 p-6 overflow-hidden flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-teal-50 p-2 rounded-lg text-teal-600"><BrainCircuit className="w-5 h-5" /></div>
                                    <h2 className="text-xl font-bold text-slate-900">Concept Map</h2>
                                </div>
                                {conceptMap && (
                                    <button onClick={handleGenerateConceptMap} className="text-teal-600 text-xs hover:underline flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" /> Regenerate
                                    </button>
                                )}
                            </div>
                            
                            <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-6">
                                {conceptMap ? (
                                    <ConceptMap data={conceptMap} />
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center">
                                        <BrainCircuit className="w-12 h-12 mb-4 text-slate-100" />
                                        <p className="text-slate-400 text-sm mb-6 px-4">Visualize the underlying structure of this document as an interactive mind map.</p>
                                        <button 
                                            onClick={handleGenerateConceptMap}
                                            disabled={isGenerating}
                                            className="w-full bg-teal-600 hover:bg-teal-500 disabled:bg-slate-200 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            {isGenerating ? 'Mapping Concepts...' : 'Generate Mind Map'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentView;

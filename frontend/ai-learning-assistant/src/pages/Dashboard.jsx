import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { FileText, Plus, Trash2, Eye, Calendar, HardDrive, Upload, Sparkles, BrainCircuit, Search, Moon, Sun, Pencil, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import UploadModal from '../components/UploadModal';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { logout, user } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [stats, setStats] = useState({ totalDocs: 0, totalSize: 0 });
    const [learningStats, setLearningStats] = useState({ averageScore: 0, totalQuizzes: 0, mastery: 0 });
    const [recentActivity, setRecentActivity] = useState([]);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
    const [renamingId, setRenamingId] = useState(null);
    const [renameValue, setRenameValue] = useState('');
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const [docsRes, statsRes, progressRes] = await Promise.all([
                api.get('/documents'),
                api.get('/user/stats'),
                api.get('/ai/progress')
            ]);
            setDocuments(docsRes.data);
            setStats(statsRes.data.stats);
            setRecentActivity(statsRes.data.recentActivity);
            setLearningStats(progressRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            try {
                await api.delete(`/documents/${id}`);
                fetchData(); // Refresh all data
            } catch (err) {
                console.error(err);
            }
        }
    };

    const formatSize = (bytes) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const toggleDarkMode = () => {
        setDarkMode(prev => {
            localStorage.setItem('darkMode', !prev);
            return !prev;
        });
    };

    const handleRename = async (id) => {
        if (!renameValue.trim()) return;
        try {
            await api.put(`/documents/${id}`, { title: renameValue });
            setRenamingId(null);
            fetchData();
        } catch (err) { console.error(err); }
    };

    const filteredDocuments = documents.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={`min-h-screen text-slate-900 ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50'}`}>
            {/* Sidebar / Topbar */}
            <nav className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-40">
                <div className="flex items-center gap-2">
                    <div className="bg-teal-600 p-2 rounded-lg shadow-lg shadow-teal-600/20">
                        <BrainCircuit className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-black tracking-tight text-slate-900">AI Learning <span className="text-teal-600">Assistant</span></span>
                </div>
                <div className="flex items-center gap-4">
                    {/* Search Bar */}
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className={`pl-9 pr-4 py-2 rounded-xl text-sm border font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all w-56 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
                        />
                    </div>
                    {/* Dark Mode toggle */}
                    <button onClick={toggleDarkMode} className={`p-2 rounded-lg transition-all ${darkMode ? 'bg-slate-700 text-yellow-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    <div className="hidden md:block text-right">
                        <p className={`text-xs uppercase font-black ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Logged in as</p>
                        <p className={`text-sm font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{user?.username}</p>
                    </div>
                    <button 
                        onClick={logout}
                        className="text-sm bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg border border-red-500/50 transition-all font-medium"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                    <div>
                        <h1 className="text-5xl font-black mb-3 tracking-tighter text-slate-900">Your Workspace</h1>
                        <p className="text-slate-600 text-lg">Harness the power of Gemini to master your studies.</p>
                    </div>
                    <button 
                        onClick={() => setIsUploadOpen(true)}
                        className="bg-teal-600 hover:bg-teal-500 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-teal-600/20 transition-all active:scale-95 group"
                    >
                        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                        Upload New Document
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column: Documents */}
                    <div className="lg:col-span-2">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <BrainCircuit className="text-teal-600 w-5 h-5" />
                            Recent Documents
                        </h2>
                        
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-2xl"></div>
                                ))}
                            </div>
                        ) : filteredDocuments.length === 0 ? (
                            <div className="text-center py-24 bg-white border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center shadow-sm">
                                <div className="bg-slate-100 p-6 rounded-3xl mb-6">
                                    {searchQuery ? <Search className="w-16 h-16 text-slate-400" /> : <FileText className="w-16 h-16 text-slate-400" />}
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900">{searchQuery ? `No results for "${searchQuery}"` : 'Your library is empty'}</h3>
                                <p className="text-slate-500 mt-2 max-w-xs mx-auto text-center">{searchQuery ? 'Try a different search term.' : 'Upload a PDF to start generating summaries, flashcards, and quizzes.'}</p>
                                {!searchQuery && <button onClick={() => setIsUploadOpen(true)} className="mt-8 text-teal-600 font-bold hover:underline underline-offset-4">Upload your first document →</button>}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredDocuments.map((doc) => (
                                    <div key={doc._id} className={`group rounded-2xl p-6 transition-all hover:border-teal-500/50 relative border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                                        <div className="bg-teal-50 p-4 rounded-2xl w-fit mb-4 group-hover:bg-teal-600 transition-colors">
                                            <FileText className="w-8 h-8 text-teal-600 group-hover:text-white" />
                                        </div>
                                        {/* Rename UI */}
                                        {renamingId === doc._id ? (
                                            <div className="flex items-center gap-2 mb-2 pr-10">
                                                <input
                                                    autoFocus
                                                    className="flex-1 border-b-2 border-teal-500 bg-transparent text-slate-900 font-bold text-lg focus:outline-none"
                                                    value={renameValue}
                                                    onChange={e => setRenameValue(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && handleRename(doc._id)}
                                                />
                                                <button onClick={() => handleRename(doc._id)} className="text-teal-600 hover:text-teal-700"><Check className="w-4 h-4" /></button>
                                                <button onClick={() => setRenamingId(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                                            </div>
                                        ) : (
                                            <div className="flex items-start justify-between mb-2 pr-2">
                                                <h3 className={`text-xl font-bold truncate pr-2 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{doc.title}</h3>
                                                <button onClick={() => { setRenamingId(doc._id); setRenameValue(doc.title); }} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded-lg transition-all shrink-0">
                                                    <Pencil className="w-4 h-4 text-slate-400" />
                                                </button>
                                            </div>
                                        )}
                                        <div className="flex flex-col gap-2 text-sm text-slate-500 mb-6 font-medium">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <HardDrive className="w-4 h-4" />
                                                <span>{formatSize(doc.fileSize)}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => navigate(`/document/${doc._id}`)}
                                                className="flex-1 bg-slate-100 hover:bg-teal-600 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-slate-700 hover:text-white"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Study
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(doc._id)}
                                                className="bg-red-500/10 hover:bg-red-500 p-3 rounded-xl text-red-500 hover:text-white transition-all border border-red-500/20"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Stats & Activity */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900">
                                <Sparkles className="text-teal-500 w-5 h-5" />
                                AI Learning Hub
                            </h2>
                            <div className="glass rounded-3xl p-6 relative overflow-hidden group">
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-all"></div>
                                
                                <div className="flex items-end justify-between mb-6">
                                    <div>
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Knowledge Mastery</p>
                                        <p className="text-5xl font-black text-slate-900">{learningStats.mastery}%</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-teal-600 text-xs font-bold">{learningStats.totalQuizzes} Quizzes Taken</p>
                                    </div>
                                </div>

                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-6">
                                    <div 
                                        className="h-full bg-gradient-to-r from-teal-600 to-teal-400 transition-all duration-1000"
                                        style={{ width: `${learningStats.mastery}%` }}
                                    ></div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Avg Score</p>
                                        <p className="text-xl font-bold text-slate-900">{learningStats.averageScore}%</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Total Qs</p>
                                        <p className="text-xl font-bold text-slate-900">{learningStats.totalQuestions || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold mb-6">Quick Stats</h2>
                            <div className="space-y-4">
                                <div className="bg-teal-50 border border-teal-100 p-6 rounded-3xl">
                                    <p className="text-teal-600 text-[10px] font-black uppercase mb-1 tracking-widest">Documents Indexed</p>
                                    <p className="text-4xl font-black text-slate-900">{stats.totalDocs}</p>
                                </div>
                                <div className="bg-teal-50 border border-teal-100 p-6 rounded-3xl">
                                    <p className="text-teal-600 text-[10px] font-black uppercase mb-1 tracking-widest">Storage Usage</p>
                                    <p className="text-4xl font-black text-slate-900">{formatSize(stats.totalSize)}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
                            <div className="glass rounded-3xl overflow-hidden shadow-sm">
                                {recentActivity.length === 0 ? (
                                    <div className="p-10 text-center text-slate-400 text-sm italic">No recent activity</div>
                                ) : (
                                    recentActivity.map((act, i) => (
                                        <div key={i} className={`p-5 flex items-start gap-4 ${i !== recentActivity.length - 1 ? 'border-b border-slate-100' : ''} hover:bg-slate-50 transition-colors cursor-pointer`} onClick={() => navigate(`/document/${act.id}`)}>
                                            <div className="bg-teal-100 p-2 rounded-lg mt-1">
                                                <Upload className="w-4 h-4 text-teal-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 truncate max-w-[200px]">Uploaded "{act.title}"</p>
                                                <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">{new Date(act.date).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {isUploadOpen && <UploadModal onClose={() => setIsUploadOpen(false)} onUploadSuccess={() => { setIsUploadOpen(false); fetchData(); }} />}
        </div>
    );
};
export default Dashboard;

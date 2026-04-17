import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import api from '../api/axios';

const UploadModal = ({ onClose, onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            if (!title) setTitle(selectedFile.name.replace('.pdf', ''));
            setError('');
        } else {
            setError('Please select a valid PDF file');
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return setError('Please select a file');

        setUploading(true);
        const formData = new FormData();
        formData.append('pdf', file);
        formData.append('title', title);

        try {
            await api.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            onUploadSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-300 shadow-2xl">
                <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
                    <h2 className="text-2xl font-bold text-slate-900">Upload Document</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleUpload} className="p-8">
                    {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm font-medium">{error}</div>}

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-500 mb-2 uppercase tracking-wider text-[10px]">Document Title</label>
                        <input
                            type="text"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                            placeholder="Enter document title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="relative group">
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all ${file ? 'border-green-500/50 bg-green-50' : 'border-slate-200 group-hover:border-teal-500/50 group-hover:bg-teal-50'}`}>
                            {file ? (
                                <div className="flex flex-col items-center">
                                    <div className="bg-green-500 rounded-full p-3 mb-4 shadow-lg shadow-green-500/50">
                                        <CheckCircle2 className="w-10 h-10 text-white" />
                                    </div>
                                    <p className="text-slate-900 font-bold">{file.name}</p>
                                    <p className="text-slate-400 text-sm mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-teal-50 rounded-full p-4 mb-4 group-hover:bg-teal-600 transition-colors flex items-center justify-center mx-auto w-fit">
                                        <Upload className="w-10 h-10 text-teal-600 group-hover:text-white" />
                                    </div>
                                    <p className="text-slate-900 font-bold">Click or drag PDF to upload</p>
                                    <p className="text-slate-500 text-sm mt-1">Max file size: 10MB</p>
                                </>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={uploading || !file}
                        className="w-full mt-8 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Uploading & Processing...
                            </>
                        ) : (
                            'Start Learning'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UploadModal;

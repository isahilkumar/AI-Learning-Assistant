import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Flashcard = ({ card, i }) => {
    const [flipped, setFlipped] = useState(false);

    return (
        <div 
            className="perspective-1000 w-full h-48 cursor-pointer"
            onClick={() => setFlipped(!flipped)}
        >
            <motion.div 
                className="relative w-full h-full duration-500 preserve-3d"
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
                {/* Front */}
                <div className="absolute inset-0 w-full h-full backface-hidden bg-white border border-slate-100 p-6 rounded-2xl flex flex-col justify-center items-center text-center shadow-lg">
                    <div className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em] mb-2">Question</div>
                    <div className="text-slate-900 font-bold text-base leading-snug">{card.front}</div>
                    <div className="mt-4 text-[10px] text-slate-400 font-medium italic">Click to flip</div>
                </div>

                {/* Back */}
                <div 
                    className="absolute inset-0 w-full h-full backface-hidden bg-teal-600 border border-teal-400 p-6 rounded-2xl flex flex-col justify-center items-center text-center shadow-xl shadow-teal-600/20"
                    style={{ transform: 'rotateY(180deg)' }}
                >
                    <div className="text-[10px] font-black text-teal-200 uppercase tracking-[0.2em] mb-2">Answer</div>
                    <div className="text-white font-medium text-sm leading-relaxed">{card.back}</div>
                </div>
            </motion.div>
        </div>
    );
};

export default Flashcard;

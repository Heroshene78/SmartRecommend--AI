import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinished: () => void;
}

export default function SplashScreen({ onFinished }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing AI Engine...');

  useEffect(() => {
    const duration = 3000; // 3 seconds sequence
    const intervalTime = 40;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + step, 100);
        if (next < 25) {
          setStatusText('Initializing AI Engine...');
        } else if (next < 55) {
          setStatusText('Loading Personalization Models...');
        } else if (next < 82) {
          setStatusText('Preparing Smart Recommendations...');
        } else {
          setStatusText('Almost Ready...');
        }

        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            onFinished();
          }, 350);
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onFinished]);

  const nodes = [
    { x: '12%', y: '18%', delay: 0 },
    { x: '78%', y: '22%', delay: 0.4 },
    { x: '24%', y: '72%', delay: 0.9 },
    { x: '72%', y: '82%', delay: 1.3 },
    { x: '48%', y: '38%', delay: 1.7 },
    { x: '14%', y: '48%', delay: 0.6 },
    { x: '86%', y: '58%', delay: 1.1 },
  ];

  return (
    <motion.div
      initial={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#020617] text-white select-none overflow-hidden"
    >
      {/* Neural Background Network Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-indigo-500/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-fuchsia-500/10 blur-[130px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/5 blur-[100px] rounded-full" />

        <svg className="absolute inset-0 w-full h-full opacity-20">
          <motion.path
            d="M 120,150 L 500,400 M 500,400 L 750,800 M 750,800 L 250,750 M 250,750 L 120,150 M 500,400 L 150,450 M 150,450 L 250,750 M 500,400 L 850,550 M 850,550 L 800,20"
            stroke="rgba(99, 102, 241, 0.4)"
            strokeWidth="1.5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3.5, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
          />
          <motion.path
            d="M 120,150 L 800,20 M 800,20 L 500,400 M 150,450 L 850,550"
            stroke="rgba(236, 72, 153, 0.3)"
            strokeWidth="1"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 4.5, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse', delay: 1 }}
          />
        </svg>

        {nodes.map((node, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"
            style={{ left: node.x, top: node.y }}
            animate={{
              scale: [1, 1.6, 1],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              delay: node.delay,
              ease: 'easeInOut',
            }}
          />
        ))}

        <div className="absolute inset-0 font-mono text-[9px] opacity-[0.03] select-none text-slate-400">
          <div className="absolute top-10 left-10">01010110 01000101 01000011 01010100 01001111 01010010</div>
          <div className="absolute top-40 right-20">11001011 10101100 01101001 01101110 01110100 01100101</div>
          <div className="absolute bottom-20 left-1/4">01010011 01011001 01001110 01000001 01010000 01010005</div>
          <div className="absolute bottom-1/3 right-12">10110011 01110010 01100101 01100011 01101111 01101101</div>
        </div>
      </div>

      {/* Main Center Logo & Layout */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md px-6">
        <motion.div
          animate={{
            scale: [1, 1.04, 1],
            rotate: [0, 360],
          }}
          transition={{
            scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: 25, repeat: Infinity, ease: 'linear' },
          }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-fuchsia-600 flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.35)] mb-6 relative"
        >
          <div className="absolute inset-1 rounded-xl border border-white/20 animate-pulse" />
          <Sparkles className="w-10 h-10 text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2"
        >
          SynapseSphere AI
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xs uppercase tracking-[0.25em] text-slate-300 font-black mb-10"
        >
          Where Your Interests Shape the Future.
        </motion.p>

        {/* Loading Progress controls */}
        <div className="w-64 space-y-3">
          <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-mono text-slate-400 font-bold">
            <span>{statusText}</span>
            <span className="text-cyan-400 font-extrabold">{Math.round(progress)}%</span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-slate-950 border border-white/5 overflow-hidden p-[1px]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 shadow-[0_0_10px_#22d3ee]"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Mail, Lock, User, ArrowRight, Chrome, Eye, EyeOff, ShieldCheck, HelpCircle } from 'lucide-react';
import { UserPreferences } from '../types';

interface AuthViewProps {
  onAuthComplete: (user: UserPreferences) => void;
  isDarkMode: boolean;
}

export default function AuthView({ onAuthComplete, isDarkMode }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!password.trim()) {
      setError('Password is required');
      return;
    }
    if (!isLogin && !name.trim()) {
      setError('Username is required for sign up');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate authentic network latency
    setTimeout(() => {
      const displayName = name.trim() || email.split('@')[0];
      const userData: UserPreferences = {
        name: displayName,
        selectedInterests: [], // empty for new users
        savedItemIds: [],
        viewedItemIds: []
      };

      setIsLoading(false);
      onAuthComplete(userData);
    }, 1200);
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setTimeout(() => {
      const googleUser: UserPreferences = {
        name: "Google Explorer",
        selectedInterests: [],
        savedItemIds: [],
        viewedItemIds: []
      };
      setIsLoading(false);
      onAuthComplete(googleUser);
    }, 1000);
  };

  const handleGuestMode = () => {
    const guestUser: UserPreferences = {
      name: "Guest Explorer",
      selectedInterests: [],
      savedItemIds: [],
      viewedItemIds: []
    };
    onAuthComplete(guestUser);
  };

  // Static floating shapes
  const shapes = [
    { size: 'w-16 h-16', color: 'from-blue-500/10 to-indigo-500/5', delay: 0, rx: '10%', ry: '20%' },
    { size: 'w-24 h-24', color: 'from-purple-500/10 to-fuchsia-500/5', delay: 1.5, rx: '80%', ry: '15%' },
    { size: 'w-20 h-20', color: 'from-cyan-500/10 to-teal-500/5', delay: 3, rx: '15%', ry: '75%' },
    { size: 'w-28 h-28', color: 'from-violet-500/10 to-pink-500/5', delay: 4.5, rx: '85%', ry: '70%' },
  ];

  return (
    <div className={`relative min-h-screen flex items-center justify-center p-4 overflow-hidden transition-colors duration-500 ${
      isDarkMode ? 'bg-[#020617] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* BACKGROUND EFFECTS: Rotating gradient core & floating shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Soft atmospheric radial gradient lights */}
        <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] rounded-full bg-indigo-600/10 blur-[130px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-fuchsia-500/10 blur-[132px]" />

        {/* Rotating Vector Halo */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-indigo-500/5 rounded-full flex items-center justify-center"
        >
          <div className="w-[500px] h-[500px] border border-fuchsia-550/10 rounded-full border-dashed" />
          <div className="absolute w-[350px] h-[350px] border border-cyan-400/5 rounded-full" />
        </motion.div>

        {/* Floating Geometric Shapes */}
        {shapes.map((sh, idx) => (
          <motion.div
            key={idx}
            className={`absolute rounded-2xl bg-gradient-to-br ${sh.color} border border-white/5 backdrop-blur-sm ${sh.size}`}
            style={{ left: sh.rx, top: sh.ry }}
            animate={{
              y: [0, -25, 0],
              rotate: [0, 45, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 8,
              delay: sh.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Floating interactive toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className={`fixed top-6 z-50 px-4 py-2.5 rounded-xl border shadow-xl flex items-center gap-2 text-xs font-semibold ${
              isDarkMode ? 'bg-slate-900 border-indigo-500/30 text-indigo-400' : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-450" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glassmorphic Auth Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`relative w-full max-w-md p-8 md:p-10 rounded-3xl border backdrop-blur-2xl transition-all duration-300 ${
          isDarkMode 
            ? 'bg-slate-950/45 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]' 
            : 'bg-white/70 border-slate-200 shadow-xl shadow-slate-200/40'
        }`}
      >
        {/* Header Block & Logo */}
        <div className="flex flex-col items-center mb-8 text-center">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 10 }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-indigo-550/20 mb-4"
          >
            <Sparkles className="w-7 h-7 text-white" />
          </motion.div>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            SynapseSphere AI
          </h1>
          <p className={`text-xs mt-1.5 font-medium tracking-wide uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-650'}`}>
            Where Your Interests Shape the Future.
          </p>
        </div>

        {/* Auth Tab Picker */}
        <div className={`flex p-1 rounded-xl mb-6 border ${
          isDarkMode ? 'bg-slate-950/65 border-white/5' : 'bg-slate-100/80 border-slate-200'
        }`}>
          <button 
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all relative ${
              isLogin 
                ? (isDarkMode ? 'bg-slate-800/80 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm') 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Sign In
          </button>
          <button 
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all relative ${
              !isLogin 
                ? (isDarkMode ? 'bg-slate-800/80 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm') 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Input Details Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3 text-xs font-semibold rounded-xl border bg-rose-500/10 text-rose-400 border-rose-500/25"
            >
              {error}
            </motion.div>
          )}

          {/* Email input */}
          <div className="space-y-1">
            <label className={`block text-[11px] font-bold uppercase tracking-widest ${
              isDarkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Email Address
            </label>
            <div className="relative group">
              <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 transition-colors ${
                isDarkMode ? 'text-slate-500 group-focus-within:text-indigo-400' : 'text-slate-440 group-focus-within:text-indigo-650'
              }`} />
              <input 
                type="email" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all ${
                  isDarkMode 
                    ? 'bg-slate-950/40 border-white/5 text-white placeholder-slate-600 focus:bg-slate-950/80' 
                    : 'bg-white/90 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white'
                }`}
              />
            </div>
          </div>

          {/* Register-only Username text block */}
          <AnimatePresence initial={false}>
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1 overflow-hidden"
              >
                <label className={`block text-[11px] font-bold uppercase tracking-widest ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Username / Alias
                </label>
                <div className="relative group">
                  <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 transition-colors ${
                    isDarkMode ? 'text-slate-500 group-focus-within:text-purple-400' : 'text-slate-440 group-focus-within:text-purple-650'
                  }`} />
                  <input 
                    type="text" 
                    placeholder="CosmicExplorer" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all ${
                      isDarkMode 
                        ? 'bg-slate-950/40 border-white/5 text-white placeholder-slate-600 focus:bg-slate-950/80' 
                        : 'bg-white/90 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white'
                    }`}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Password Input wrap */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className={`block text-[11px] font-bold uppercase tracking-widest ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Password
              </label>
              {isLogin && (
                <button
                  type="button"
                  onClick={() => triggerToast("Password reset protocol initiated. Check your inbox (mocked).")}
                  className="text-[10px] font-bold text-cyan-400 hover:text-cyan-350 tracking-wide uppercase"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            
            <div className="relative group">
              <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 transition-colors ${
                isDarkMode ? 'text-slate-500 group-focus-within:text-indigo-400' : 'text-slate-440 group-focus-within:text-indigo-650'
              }`} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••" 
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-11 pr-11 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all ${
                  isDarkMode 
                    ? 'bg-slate-950/40 border-white/5 text-white placeholder-slate-600 focus:bg-slate-950/80' 
                    : 'bg-white/90 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me select */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
              />
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Remember Me
              </span>
            </label>
          </div>

          {/* Login / Register submit button */}
          <motion.button 
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3 mt-4 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isLoading ? 'opacity-80 cursor-wait' : 'hover:opacity-95'
            }`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isLogin ? (
              <>
                Login
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Sign Up
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        <div className="relative flex py-4 items-center">
          <div className={`flex-grow border-t ${isDarkMode ? 'border-white/5' : 'border-slate-205'}`}></div>
          <span className={`flex-shrink mx-4 text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>or discover</span>
          <div className={`flex-grow border-t ${isDarkMode ? 'border-white/5' : 'border-slate-205'}`}></div>
        </div>

        {/* Auxiliary Entry points */}
        <div className="flex flex-col gap-3">
          {/* Optional Google login button */}
          <motion.button 
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-2.5 rounded-xl border font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all ${
              isDarkMode 
                ? 'bg-slate-900/60 border-white/5 text-slate-300 hover:bg-slate-800/80 hover:text-white' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Chrome className="w-4.5 h-4.5 text-rose-500" />
            Continue with Google
          </motion.button>

          {/* Continue as Guest option */}
          <motion.button 
            type="button"
            onClick={handleGuestMode}
            disabled={isLoading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-2.5 rounded-xl border font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              isDarkMode 
                ? 'bg-slate-800/20 border-white/5 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200' 
                : 'bg-slate-100/50 border-slate-205 text-slate-600 hover:bg-slate-150/80'
            }`}
          >
            Continue as Guest
          </motion.button>
        </div>

        <p className={`text-center text-[9px] uppercase tracking-wider mt-6 font-bold ${
          isDarkMode ? 'text-slate-600' : 'text-slate-400'
        }`}>
          Secure Synapse End-to-End Encryption
        </p>
      </motion.div>
    </div>
  );
}

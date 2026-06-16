import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, User, LogIn, UserPlus, Activity } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setError('Email atau password salah! Pastikan sudah terdaftar di Firebase.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email sudah digunakan untuk akun lain.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password terlalu lemah (minimal 6 karakter).');
      } else {
        setError(err.message || 'Terjadi kesalahan sistem.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md p-8 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl relative overflow-hidden"
      >
        {/* Background Glow Effects */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex justify-center mb-8">
            <motion.div 
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="p-4 bg-cyan-500/10 rounded-2xl glow-cyan"
            >
              <Activity className="w-10 h-10 text-cyan-400" />
            </motion.div>
          </div>

          <h2 className="text-3xl font-bold text-center text-white mb-2 text-glow-cyan">
            IoT Dashboard
          </h2>
          <p className="text-slate-400 text-center mb-8 font-medium">
            {isRegistering ? 'Buat akun untuk mengontrol Smart Home' : 'Masuk untuk mengontrol Smart Home'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-slate-700/50 rounded-xl focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-slate-200 placeholder-slate-600"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-slate-700/50 rounded-xl focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-slate-200 placeholder-slate-600"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-400 text-sm text-center font-medium bg-red-500/10 py-2.5 rounded-lg border border-red-500/20"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 mt-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold tracking-wide rounded-xl transition-all duration-300 glow-cyan flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <>
                  {isRegistering ? (
                    <UserPlus className="w-5 h-5 transition-transform group-hover:scale-110" />
                  ) : (
                    <LogIn className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  )}
                  {isRegistering ? 'DAFTAR' : 'LOGIN'}
                </>
              )}
            </button>
            
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError('');
                }}
                className="text-slate-400 hover:text-cyan-400 text-sm font-medium transition-colors"
              >
                {isRegistering ? 'Sudah memiliki akun? Login' : 'Belum memiliki akun? Daftar'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

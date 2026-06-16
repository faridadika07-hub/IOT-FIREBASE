import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Waves } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VoiceCommandProps {
  onCommand: (command: string) => void;
}

export function VoiceCommand({ onCommand }: VoiceCommandProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorText, setErrorText] = useState('');
  const recognitionRef = useRef<any>(null);
  const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  useEffect(() => {
    if (!supported) {
      setErrorText('Web Speech API is not supported in this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'id-ID';

    recognitionRef.current.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcriptStr = event.results[current][0].transcript;
      setTranscript(transcriptStr);
      
      if (event.results[current].isFinal) {
        onCommand(transcriptStr.toLowerCase().trim());
        setTimeout(() => setTranscript(''), 3000);
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      if (event.error === 'no-speech') {
        setErrorText('Tidak ada suara terdeteksi. Silakan coba lagi.');
      } else {
        setErrorText(`Error: ${event.error}`);
      }
      setTimeout(() => setErrorText(''), 3000);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };
  }, [onCommand, supported]);

  const toggleListen = () => {
    if (!supported) return;
    
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      setErrorText('');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error("Could not start recognition", err);
      }
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
      {/* Decorative bg */}
      {isListening && (
        <div className="absolute inset-0 bg-cyan-500/5 animate-pulse"></div>
      )}

      <button
        onClick={toggleListen}
        disabled={!supported}
        className={`relative p-5 rounded-full outline-none transition-all duration-300 z-10 flex-shrink-0 ${
          isListening 
            ? 'bg-cyan-500 text-slate-900 glow-cyan-strong scale-110' 
            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-cyan-400'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isListening ? (
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <Waves className="w-8 h-8" />
          </motion.div>
        ) : (
          <Mic className="w-8 h-8" />
        )}
      </button>

      <div className="flex-1 flex flex-col justify-center min-h-[60px] text-center sm:text-left z-10 w-full">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-1">
          Voice Control
        </h4>
        <AnimatePresence mode="wait">
          {errorText ? (
            <motion.p key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-red-400 font-medium">
              {errorText}
            </motion.p>
          ) : transcript ? (
            <motion.div key="transcript" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-lg font-medium text-cyan-50">
              "{transcript}"
              {isListening && <span className="animate-pulse ml-1 inline-block w-2.5 h-2.5 rounded-full bg-cyan-500"></span>}
            </motion.div>
          ) : (
             <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-slate-500 text-sm">
                Ucapkan "Nyalakan lampu 1", "Aktifkan Pola 1", atau "Matikan Pola 2"
             </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

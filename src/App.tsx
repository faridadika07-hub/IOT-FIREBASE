import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ref, onValue, set, update } from 'firebase/database';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { rtdb, auth } from './firebase';
import { SensorData, RelayData, LogEntry } from './types';
import { RelayCard } from './components/RelayCard';
import { SensorCard } from './components/SensorCard';
import { VoiceCommand } from './components/VoiceCommand';
import { ActivityLog } from './components/ActivityLog';
import { Login } from './components/Login';
import { Wifi, WifiOff, Clock as ClockIcon, Activity, LogOut, Moon, Briefcase, Coffee, Shuffle } from 'lucide-react';
import { motion } from 'motion/react';
import { playRelaySound, speakText } from './utils/audio';
import { SceneCard } from './components/SceneCard';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [sensors, setSensors] = useState<SensorData>({ temperature: 0, humidity: 0 });
  const [relays, setRelays] = useState<RelayData>({ relay1: 0, relay2: 0, relay3: 0, relay4: 0 });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const strobeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (strobeIntervalRef.current) clearInterval(strobeIntervalRef.current);
    };
  }, []);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    setLogs((prev) => [
      { id: Math.random().toString(36).substring(7), timestamp: Date.now(), message, type },
      ...prev.slice(0, 49) // Keeping last 50 logs
    ]);
  }, []);

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // Firebase Realtime Listeners (Only run when authenticated)
  useEffect(() => {
    if (!user) return;

    const connectedRef = ref(rtdb, '.info/connected');
    const unsubscribeConn = onValue(connectedRef, (snap) => {
      const status = snap.val() === true;
      setIsOnline(status);
      if (status) addLog('Connected to Firebase Realtime Database', 'success');
      else addLog('Disconnected from Firebase', 'error');
    });

    const sensorRef = ref(rtdb, 'sensor');
    const unsubscribeSensor = onValue(sensorRef, (snapshot) => {
      if (snapshot.exists()) {
        setSensors(snapshot.val());
      }
    });

    const relayRef = ref(rtdb, 'relay');
    const unsubscribeRelay = onValue(relayRef, (snapshot) => {
      if (snapshot.exists()) {
        setRelays(snapshot.val());
      }
    });

    return () => {
      unsubscribeConn();
      unsubscribeSensor();
      unsubscribeRelay();
    };
  }, [addLog, user]);

  const clearStrobe = () => {
    if (strobeIntervalRef.current) {
      clearInterval(strobeIntervalRef.current);
      strobeIntervalRef.current = null;
    }
  };

  const handleToggleRelay = async (id: string, newStatus: number) => {
    try {
      clearStrobe();
      playRelaySound(newStatus === 1);
      
      const relayNumber = id.replace('relay', '');
      const statusText = newStatus === 1 ? 'aktif' : 'dimatikan';
      speakText(`Relay lampu ${relayNumber} ${statusText}`);

      await set(ref(rtdb, `relay/${id}`), newStatus);
      addLog(`${id.toUpperCase()} set to ${newStatus === 1 ? 'ON' : 'OFF'}`, 'info');
    } catch (error) {
      addLog(`Failed to update ${id}`, 'error');
      console.error(error);
    }
  };

  const applyStrobePattern = async (patternName: string, isActivate: boolean, type: 'random' | 'alternate' = 'random') => {
    try {
      if (!isActivate) {
        clearStrobe();
        playRelaySound(false);
        speakText(`${patternName} dinonaktifkan`);
        await set(ref(rtdb, 'relay'), { relay1: 0, relay2: 0, relay3: 0, relay4: 0 });
        addLog(`${patternName} dinonaktifkan`, 'info');
        return;
      }

      playRelaySound(true);
      speakText(`${patternName} diaktifkan`);
      addLog(`${patternName} diaktifkan, mode strobo berjalan`, 'success');

      clearStrobe();

      let toggleStep = 0;
      strobeIntervalRef.current = setInterval(() => {
        if (type === 'random') {
          update(ref(rtdb, 'relay'), {
            relay1: Math.random() > 0.5 ? 1 : 0,
            relay2: Math.random() > 0.5 ? 1 : 0,
            relay3: Math.random() > 0.5 ? 1 : 0,
            relay4: Math.random() > 0.5 ? 1 : 0,
          });
        } else {
          toggleStep = (toggleStep + 1) % 2;
          update(ref(rtdb, 'relay'), {
            relay1: toggleStep === 0 ? 1 : 0,
            relay2: toggleStep === 1 ? 1 : 0,
            relay3: toggleStep === 0 ? 1 : 0,
            relay4: toggleStep === 1 ? 1 : 0,
          });
        }
      }, 300); // Kecepatan strobo (300ms)
    } catch (error) {
      addLog(`Gagal mengatur ${patternName}`, 'error');
      console.error(error);
    }
  };

  const handleVoiceCommand = (command: string) => {
    addLog(`Voice: "${command}"`, 'info');
    
    // Simple command parser
    let cmd = command.toLowerCase();
    
    // Normalize Indonesian numbers
    cmd = cmd.replace(/\bsatu\b/g, '1')
             .replace(/\bdua\b/g, '2')
             .replace(/\btiga\b/g, '3')
             .replace(/\bempat\b/g, '4');
    
    // Check Patterns (Scenes)
    if (cmd.includes('pola 1')) {
      if (cmd.includes('mati') || cmd.includes('padam') || cmd.includes('nonaktif')) {
        applyStrobePattern('Pola 1', false, 'random');
      } else {
        applyStrobePattern('Pola 1', true, 'random');
      }
      return;
    }
    if (cmd.includes('pola 2')) {
      if (cmd.includes('mati') || cmd.includes('padam') || cmd.includes('nonaktif')) {
        applyStrobePattern('Pola 2', false, 'alternate');
      } else {
        applyStrobePattern('Pola 2', true, 'alternate');
      }
      return;
    }

    if (cmd.includes('semua lampu')) {
      clearStrobe();
      if (cmd.includes('nyala') || cmd.includes('hidup')) {
        playRelaySound(true);
        speakText('Semua relay lampu diaktifkan');
        set(ref(rtdb, 'relay'), { relay1: 1, relay2: 1, relay3: 1, relay4: 1 });
        addLog('All relays turned ON via voice', 'success');
      } else if (cmd.includes('mati') || cmd.includes('padam')) {
        playRelaySound(false);
        speakText('Semua relay lampu dimatikan');
        set(ref(rtdb, 'relay'), { relay1: 0, relay2: 0, relay3: 0, relay4: 0 });
        addLog('All relays turned OFF via voice', 'success');
      }
      return;
    }

    // Individual relays
    const match = cmd.match(/lampu\s*(\d)/);
    if (match) {
      const num = match[1];
      const targetRelay = `relay${num}` as keyof RelayData;
      
      if (['1', '2', '3', '4'].includes(num)) {
        if (cmd.includes('nyala') || cmd.includes('hidup')) {
          handleToggleRelay(targetRelay, 1);
        } else if (cmd.includes('mati') || cmd.includes('padam')) {
          handleToggleRelay(targetRelay, 0);
        }
      } else {
        addLog(`Unknown relay number: ${num}`, 'warning');
      }
      return;
    }

    addLog('Voice command not recognized', 'warning');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-800/50"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 rounded-2xl glow-cyan">
             <Activity className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white text-glow-cyan flex items-center gap-2">
              IOT Dashboard <span className="text-cyan-500">.</span>
            </h1>
            <p className="text-slate-400 font-medium tracking-wide mt-1">Smart Home Control Center</p>
          </div>
        </div>

        <div className="flex bg-slate-900/50 rounded-2xl border border-slate-800 p-2 overflow-hidden items-center">
          <div className="flex items-center gap-2 px-4 py-2 border-r border-slate-800">
            <ClockIcon className="w-4 h-4 text-slate-500" />
            <span className="font-mono text-lg font-medium text-slate-200">
              {currentTime.toLocaleTimeString('en-US', { hour12: false })}
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 border-r border-slate-800">
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold text-cyan-400 tracking-wider">ONLINE</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-500" />
                <span className="text-sm font-semibold text-red-500 tracking-wider">OFFLINE</span>
              </>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center p-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </motion.header>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Controls */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-8">
          
          {/* Sensors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <SensorCard type="temperature" value={sensors.temperature} />
            <SensorCard type="humidity" value={sensors.humidity} />
          </div>

          {/* Smart Modes */}
          <div className="pt-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-6 bg-purple-500 rounded-full glow-purple"></div>
              <h2 className="text-xl font-bold text-slate-200 tracking-wide uppercase">Pola Kombinasi</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
              <SceneCard 
                name="Pola 1 (Strobo Acak)" 
                icon={Shuffle} 
                onActivate={() => applyStrobePattern('Pola 1', true, 'random')} 
                onDeactivate={() => applyStrobePattern('Pola 1', false, 'random')} 
              />
              <SceneCard 
                name="Pola 2 (Ganti Bergantian)" 
                icon={Shuffle} 
                onActivate={() => applyStrobePattern('Pola 2', true, 'alternate')} 
                onDeactivate={() => applyStrobePattern('Pola 2', false, 'alternate')} 
              />
            </div>
          </div>
          
          <div className="pt-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-6 bg-cyan-500 rounded-full glow-cyan"></div>
              <h2 className="text-xl font-bold text-slate-200 tracking-wide uppercase">Relay Controls</h2>
            </div>
            {/* Relays */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              <RelayCard id="relay1" name="Lampu 1" status={relays.relay1} onToggle={handleToggleRelay} />
              <RelayCard id="relay2" name="Lampu 2" status={relays.relay2} onToggle={handleToggleRelay} />
              <RelayCard id="relay3" name="Lampu 3" status={relays.relay3} onToggle={handleToggleRelay} />
              <RelayCard id="relay4" name="Lampu 4" status={relays.relay4} onToggle={handleToggleRelay} />
            </div>
          </div>
        </div>

        {/* Right Column - Voice & Logs */}
        <div className="col-span-1 flex flex-col gap-8">
           <VoiceCommand onCommand={handleVoiceCommand} />
           <div className="flex-1 min-h-[300px]">
             <ActivityLog logs={logs} />
           </div>
        </div>
      </div>
      
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Settings, 
  Layers, 
  TrendingUp, 
  Activity, 
  Power, 
  Zap,
  ChevronRight,
  Clock,
  LayoutDashboard,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Edit2,
  PlusCircle,
  FileUp,
  MessageSquare,
  Bot,
  Save,
  Send,
  CalendarClock,
  Upload,
  Lock,
  User,
  LogIn,
  LogOut,
  Shield,
  RefreshCcw,
  Eye,
  X,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import TradingChart from './components/TradingChart';
import { Candle, Signal, AssetConfig, TelegramChat, BotSource, Tick } from './types';
import { 
  fetchCandles, 
  fetchSignals, 
  fetchTelegramChats, 
  saveTelegramChat, 
  updateTelegramChat,
  deleteTelegramChat, 
  fetchBotSources, 
  addBotSource,
  updateBotSource,
  deleteBotSource,
  uploadFutureSignals,
  fetchSettings,
  saveSettings,
  sendTestTelegramMessage,
  login,
  fetchAuthSettings,
  updateAuthSettings,
  fetchFutureBatches,
  deleteFutureBatch
} from './lib/api';

const ASSETS: AssetConfig[] = [
  { symbol: 'USDARS-OTCq', name: 'USD/ARS', type: 'OTC', isLive: true, isSignalEnabled: true },
  { symbol: 'GBPUSD-OTCq', name: 'GBP/USD', type: 'OTC', isLive: true, isSignalEnabled: true },
  { symbol: 'EURUSD-OTCq', name: 'EUR/USD', type: 'OTC', isLive: true, isSignalEnabled: false },
  { symbol: 'USDBDT-OTCq', name: 'USD/BDT', type: 'OTC', isLive: true, isSignalEnabled: true },
  { symbol: 'AUDNZD-OTCq', name: 'AUD/NZD', type: 'OTC', isLive: true, isSignalEnabled: true },
  { symbol: 'GBPNZD-OTCq', name: 'GBP/NZD', type: 'OTC', isLive: true, isSignalEnabled: true },
  { symbol: 'NZDCAD-OTCq', name: 'NZD/CAD', type: 'OTC', isLive: true, isSignalEnabled: true },
  { symbol: 'USDEGP-OTCq', name: 'USD/EGP', type: 'OTC', isLive: true, isSignalEnabled: true },
  { symbol: 'USDPHP-OTCq', name: 'USD/PHP', type: 'OTC', isLive: true, isSignalEnabled: true },
  { symbol: 'NZDCHF-OTCq', name: 'NZD/CHF', type: 'OTC', isLive: true, isSignalEnabled: true },
  { symbol: 'CADCHF-OTCq', name: 'CAD/CHF', type: 'OTC', isLive: true, isSignalEnabled: true },
  { symbol: 'USDIDR-OTCq', name: 'USD/IDR', type: 'OTC', isLive: true, isSignalEnabled: true },
  { symbol: 'USDINR-OTCq', name: 'USD/INR', type: 'OTC', isLive: true, isSignalEnabled: true },
  { symbol: 'USDBRL-OTCq', name: 'USD/BRL', type: 'OTC', isLive: true, isSignalEnabled: true },
  { symbol: 'USDPKR-OTCq', name: 'USD/PKR', type: 'OTC', isLive: true, isSignalEnabled: true },
  { symbol: 'USDMXN-OTCq', name: 'USD/MXN', type: 'OTC', isLive: true, isSignalEnabled: true },
  { symbol: 'USDCOP-OTCq', name: 'USD/COP', type: 'OTC', isLive: true, isSignalEnabled: true },
  { symbol: 'USDDZD-OTCq', name: 'USD/DZD', type: 'OTC', isLive: true, isSignalEnabled: true },
  { symbol: 'USDNGN-OTCq', name: 'USD/NGN', type: 'OTC', isLive: true, isSignalEnabled: true },
  { symbol: 'EURNZD-OTCq', name: 'EUR/NZD', type: 'OTC', isLive: true, isSignalEnabled: true },
  { symbol: 'NZDUSD-OTCq', name: 'NZD/USD', type: 'OTC', isLive: true, isSignalEnabled: true },
  { symbol: 'USDZAR-OTCq', name: 'USD/ZAR', type: 'OTC', isLive: true, isSignalEnabled: true }
];

type View = 'dashboard' | 'signals' | 'assets' | 'strategies' | 'settings' | 'future';

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [assets, setAssets] = useState<AssetConfig[]>(ASSETS);
  const [selectedAsset, setSelectedAsset] = useState<AssetConfig>(ASSETS[0]);
  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  const [candleData, setCandleData] = useState<Candle[]>([]);
  const [lastTick, setLastTick] = useState<Tick | null>(null);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [isSystemOn, setIsSystemOn] = useState(true);
  const [telegramChats, setTelegramChats] = useState<TelegramChat[]>([]);
  const [botSources, setBotSources] = useState<BotSource[]>([]);
  const [manualSignalsText, setManualSignalsText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [authSettings, setAuthSettings] = useState({ username: '', password: '' });
  const [isUpdatingAuth, setIsUpdatingAuth] = useState(false);
  const [isAIOn, setIsAIOn] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [newChat, setNewChat] = useState({ chatId: '', name: '', permissions: { liveSignal: true, futurePre: true, futureResult: true, liveResult: true, customMsg: true, strategyAlert: true, signalsMenu: false, statsMenu: false, futureMenu: false } });
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [newSource, setNewSource] = useState({ chatId: '', name: '', permissions: { signalsMenu: true, statsMenu: true, futureMenu: true, addListMenu: true } });
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
  const [futureBatches, setFutureBatches] = useState<any[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [viewingBatch, setViewingBatch] = useState<any | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [globalSettings, setGlobalSettings] = useState<any>({
    botToken: "",
    minConfidence: 72,
    signalCooldown: 120,
    signalCutoff: 10,
    preDeliveryMinutes: 1,
    candleTimeframe: 60,
    customMessage: ""
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const settings = await fetchSettings();
        setGlobalSettings(settings);
        setIsSystemOn(settings.isSystemOn);
        setIsAIOn(settings.isAIOn);
      } catch (e) {
        console.error("Failed to fetch initial settings:", e);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const candles = await fetchCandles(selectedAsset.symbol);
        setCandleData(candles);
      } catch (e) {
        console.error("Failed to fetch candles:", e);
      }
    };

    const fetchOtherData = async () => {
      try {
        const sigs = await fetchSignals();
        setSignals(sigs);

        if (view === 'settings') {
          const [chats, sources] = await Promise.all([
            fetchTelegramChats(),
            fetchBotSources()
          ]);
          setTelegramChats(chats);
          setBotSources(sources);
        }

        if (view === 'future') {
          const batches = await fetchFutureBatches();
          setFutureBatches(batches);
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchHistory();
    fetchOtherData();
    
    const intervalHistory = setInterval(fetchHistory, 30000); // 30s sync for history
    const intervalOther = setInterval(fetchOtherData, 5000); // 5s for signals/meta
    
    // SSE for real-time ticks
    const es = new EventSource('/api/ticks');
    es.onmessage = (event) => {
      try {
        const tick = JSON.parse(event.data);
        if (tick.symbol === selectedAsset.symbol) {
          setLastTick(tick);
        }
      } catch (e) {}
    };

    return () => {
      clearInterval(intervalHistory);
      clearInterval(intervalOther);
      es.close();
    };
  }, [selectedAsset, view]);

  const handleSaveSettings = async (updated: any) => {
    try {
      setSaveStatus('saving');
      const toSave = { ...globalSettings, ...updated };
      // Sync separate toggle states into the object
      toSave.isSystemOn = isSystemOn;
      toSave.isAIOn = isAIOn;
      
      await saveSettings(toSave);
      setGlobalSettings(toSave);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e) {
      console.error("Failed to save settings", e);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const toggleSystem = async () => {
    const newState = !isSystemOn;
    setIsSystemOn(newState);
    await handleSaveSettings({ isSystemOn: newState });
  };

  const toggleAI = async () => {
    const newState = !isAIOn;
    setIsAIOn(newState);
    await handleSaveSettings({ isAIOn: newState });
  };

  const handleAddSource = async () => {
    try {
      if (!newSource.chatId || !newSource.name) {
        alert("Please enter Chat ID and Source Name");
        return;
      }
      
      let result;
      if (editingSourceId) {
        result = await updateBotSource(editingSourceId, newSource);
      } else {
        result = await addBotSource(newSource);
      }

      if (result.success) {
        const freshSources = await fetchBotSources();
        setBotSources(freshSources);
        setNewSource({ chatId: '', name: '', permissions: { signalsMenu: true, statsMenu: true, futureMenu: true, addListMenu: true } });
        setEditingSourceId(null);
        alert(editingSourceId ? "Bot source updated successfully!" : "Bot source added successfully!");
      } else {
        alert("Operation failed: " + (result.error || "Unknown error"));
      }
    } catch (e) {
      console.error(e);
      alert("Error connecting to server");
    }
  };

  const handleEditSource = (source: any) => {
    setEditingSourceId(source.id);
    setNewSource({
      chatId: source.chatId,
      name: source.name,
      permissions: source.permissions
    });
    // Scroll to form
    const formElement = document.getElementById('bot-source-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCancelEdit = () => {
    setEditingSourceId(null);
    setNewSource({ chatId: '', name: '', permissions: { signalsMenu: true, statsMenu: true, futureMenu: true, addListMenu: true } });
  };

  const handleAddChat = async () => {
    try {
      if (!newChat.chatId || !newChat.name) {
        alert("Please enter Chat ID and Name");
        return;
      }

      let result;
      if (editingChatId) {
        result = await updateTelegramChat(editingChatId, newChat);
      } else {
        result = await saveTelegramChat(newChat);
      }

      if (result.success) {
        const freshChats = await fetchTelegramChats();
        setTelegramChats(freshChats);
        setNewChat({ chatId: '', name: '', permissions: { liveSignal: true, futurePre: true, futureResult: true, liveResult: true, customMsg: true, strategyAlert: true, signalsMenu: false, statsMenu: false, futureMenu: false } });
        setEditingChatId(null);
        alert(editingChatId ? "Telegram chat updated successfully!" : "Telegram chat added successfully!");
      } else {
        alert("Operation failed: " + (result.error || "Unknown error"));
      }
    } catch (e) {
      console.error(e);
      alert("Error connecting to server");
    }
  };

  const handleEditChat = (chat: any) => {
    setEditingChatId(chat.id);
    setNewChat({
      chatId: chat.chatId,
      name: chat.name,
      permissions: chat.permissions
    });
    // Scroll to form
    const formElement = document.getElementById('telegram-chat-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCancelEditChat = () => {
    setEditingChatId(null);
    setNewChat({ chatId: '', name: '', permissions: { liveSignal: true, futurePre: true, futureResult: true, liveResult: true, customMsg: true, strategyAlert: true, signalsMenu: false, statsMenu: false, futureMenu: false } });
  };

  const handleUpload = async () => {
    try {
      if (!manualSignalsText.trim()) return;
      setIsUploading(true);
      const res = await uploadFutureSignals(manualSignalsText, "Web UI");
      if (res.success) {
        alert("Signals uploaded successfully!");
        setManualSignalsText('');
        setShowUploadForm(false);
        const batches = await fetchFutureBatches();
        setFutureBatches(batches);
      } else {
        alert("Upload failed: " + res.error);
      }
    } catch (e) {
      alert("Error: " + (e instanceof Error ? e.message : "Unknown error"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteBatch = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this signal list?")) return;
    try {
      const res = await deleteFutureBatch(id);
      if (res.success) {
        const batches = await fetchFutureBatches();
        setFutureBatches(batches);
      } else {
        alert("Delete failed: " + res.error);
      }
    } catch (e) {
      alert("Error: " + (e instanceof Error ? e.message : "Unknown error"));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await login(loginForm);
      if (res.success) {
        setIsLoggedIn(true);
        localStorage.setItem('isLoggedIn', 'true');
      } else {
        setLoginError(res.error || "Invalid credentials");
      }
    } catch (e) {
      setLoginError("Server error. Please try again.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
  };

  const handleUpdateAuth = async () => {
    try {
      setIsUpdatingAuth(true);
      const res = await updateAuthSettings(authSettings);
      if (res.success) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        alert("Failed to update credentials");
      }
    } catch (e) {
      alert("Error updating credentials");
    } finally {
      setIsUpdatingAuth(false);
    }
  };

  useEffect(() => {
    if (view === 'settings' && isLoggedIn) {
      fetchAuthSettings().then(setAuthSettings).catch(console.error);
    }
  }, [view, isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B0E14] font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-8 bg-[#14171C] rounded-2xl border border-[#1E2329] shadow-2xl shadow-blue-500/5 mx-4"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/20 shadow-lg shadow-blue-500/10">
              <Shield className="text-blue-500" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">SignalPro Admin</h1>
            <p className="text-gray-500 text-sm mt-1">Authorize to access full power</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest ml-1">Username</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  placeholder="Enter your username"
                  className="w-full h-12 bg-[#0B0E11] border border-[#1E2329] rounded-xl pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-all text-white placeholder:text-gray-600"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full h-12 bg-[#0B0E11] border border-[#1E2329] rounded-xl pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-all text-white placeholder:text-gray-600"
                  required
                />
              </div>
            </div>

            {loginError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-500 text-xs font-medium flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                {loginError}
              </motion.div>
            )}

            <button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <LogIn size={18} />
              Sign In to Dashboard
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#1E2329] text-center">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-medium">Secured by SignalPro Cloud Enterprise</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0B0E14] text-[#D9D9D9] font-sans overflow-hidden">
      {/* Top Navigation Header */}
      <header className="h-16 border-b border-[#1E2329] bg-[#0B0E14] px-6 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <Zap className="text-white w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">SignalPro<span className="text-blue-500 text-sm align-top ml-1">v5</span></span>
          </div>

          <nav className="flex items-center gap-1">
            <NavItem active={view === 'dashboard'} onClick={() => setView('dashboard')} icon={<LayoutDashboard size={18} />} label="Dashboard" />
            <NavItem active={view === 'signals'} onClick={() => setView('signals')} icon={<Activity size={18} />} label="Signals" />
            <NavItem active={view === 'assets'} onClick={() => setView('assets')} icon={<Layers size={18} />} label="Assets" />
            <NavItem active={view === 'strategies'} onClick={() => setView('strategies')} icon={<BarChart3 size={18} />} label="Strategies" />
            <NavItem active={view === 'future'} onClick={() => setView('future')} icon={<CalendarClock size={18} />} label="Future Signals" />
            <NavItem active={view === 'settings'} onClick={() => setView('settings')} icon={<Settings size={18} />} label="Settings" />
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-xs font-bold border-r border-[#1E2329] pr-6">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isSystemOn ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-white uppercase tracking-wider">{isSystemOn ? 'System ON' : 'System OFF'}</span>
            </div>
            <button 
              onClick={toggleSystem}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-2 ${isSystemOn ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'}`}
            >
              <Power size={14} />
              {isSystemOn ? 'STOP' : 'START'}
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {saveStatus === 'saved' && <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">Changes Saved!</span>}
              {saveStatus === 'error' && <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded">Save Failed</span>}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#14171C] rounded-lg border border-[#1E2329]">
                 <User size={14} className="text-blue-500" />
                 <span className="text-xs font-bold text-white opacity-90">{localStorage.getItem('username') || 'admin'}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-[10px] font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded border border-red-500/20 transition-all flex items-center gap-2"
              >
                <LogOut size={12} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sub-Header for Time & Stats */}
      <div className="h-12 border-b border-[#1E2329] bg-[#0E1218] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 bg-[#1E2329]/50 px-3 py-1 rounded-md border border-[#2B3139]">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-medium tabular-nums">{(() => {
                const bstDate = new Date(currentTime.getTime() + 6 * 3600 * 1000);
                return bstDate.getUTCHours().toString().padStart(2, '0') + ":" + 
                       bstDate.getUTCMinutes().toString().padStart(2, '0') + ":" + 
                       bstDate.getUTCSeconds().toString().padStart(2, '0');
              })()}</span>
              <span className="text-[9px] opacity-50 ml-1">UTC+6</span>
           </div>
           <div className="h-4 w-[1px] bg-[#1E2329]" />
           <span className="text-[10px] font-bold text-blue-500 tracking-widest uppercase">Live Market Data Stream</span>
           
           {view === 'dashboard' && selectedAsset && (
             <>
               <div className="h-4 w-[1px] bg-[#1E2329] ml-2" />
               <div className="flex items-center gap-4 ml-2">
                 <h2 className="text-sm font-bold flex items-center gap-2">
                   {selectedAsset.name} 
                   <span className="text-sm font-mono text-white/90">
                     {candleData[candleData.length - 1]?.close.toFixed(5) || "0.00000"}
                   </span>
                   <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">+1.320%</span>
                 </h2>
                 <div className="flex items-center gap-3 text-[10px] font-mono text-[#929498]">
                   <span>O <span className="text-white">{candleData[candleData.length - 1]?.open.toFixed(5) || "0"}</span></span>
                   <span>H <span className="text-white">{candleData[candleData.length - 1]?.high.toFixed(5) || "0"}</span></span>
                   <span>L <span className="text-white">{candleData[candleData.length - 1]?.low.toFixed(5) || "0"}</span></span>
                   <span>C <span className="text-white">{candleData[candleData.length - 1]?.close.toFixed(5) || "0"}</span></span>
                 </div>
               </div>
             </>
           )}
        </div>
        
        <div className="flex items-center gap-4 text-[10px] font-bold text-[#929498]">
           <span>SERVER: <span className="text-green-500">STABLE</span></span>
           <span>LATENCY: <span className="text-blue-400">42ms</span></span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-[#0B0E14]">
          <AnimatePresence mode="wait">
            {view === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex gap-6 h-full p-4"
              >
                {/* Left: Asset Selector */}
                <div className="w-[160px] flex-shrink-0 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#929498]">Assets <span className="ml-2 px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[10px]">{ASSETS.length} LIVE</span></h3>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" size={12} />
                    <input 
                      type="text" 
                      placeholder="Search assets..." 
                      value={assetSearchQuery}
                      onChange={(e) => setAssetSearchQuery(e.target.value)}
                      className="w-full bg-[#14171C] border border-[#1E2329] focus:border-blue-500/50 rounded-md pl-7 pr-3 py-2 text-xs text-white outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-2 overflow-y-auto pr-1 pb-4" style={{ maxHeight: 'calc(100vh - 250px)' }}>
                    {assets.filter(asset => asset.name.toLowerCase().includes(assetSearchQuery.toLowerCase()) || asset.symbol.toLowerCase().includes(assetSearchQuery.toLowerCase())).map(asset => (
                      <AssetItem 
                        key={asset.symbol} 
                        asset={asset} 
                        active={selectedAsset.symbol === asset.symbol} 
                        onClick={() => setSelectedAsset(asset)}
                      />
                    ))}
                  </div>
                </div>

                {/* Right: Chart */}
                <div className="flex-1 min-w-0 flex flex-col gap-6">
                    <div className="bg-[#14171C] rounded-xl border border-[#1E2329] overflow-hidden p-4 relative flex-1">
                    <TradingChart data={candleData} lastTick={lastTick} />
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'signals' && (
              <motion.div key="signals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="grid grid-cols-4 gap-6">
                  <StatCard label="TOTAL" value="73" />
                  <StatCard label="WINS" value="34" />
                  <StatCard label="LOSS" value="36" />
                  <StatCard label="WIN RATE" value="46.6%" />
                </div>
                <div className="bg-[#14171C] rounded-xl border border-[#1E2329] overflow-hidden">
                   <table className="w-full text-left">
                     <thead className="bg-[#1E2329]/50 text-[10px] uppercase font-bold tracking-widest text-[#929498]">
                       <tr>
                         <th className="p-4">Direction</th>
                         <th className="p-4">Asset</th>
                         <th className="p-4">Entry Time</th>
                         <th className="p-4">AI Conf.</th>
                         <th className="p-4">Result</th>
                       </tr>
                     </thead>
                     <tbody className="text-sm border-t border-[#1E2329]">
                        {signals.map(s => (
                          <tr key={s.id} className="border-b border-[#1E2329] hover:bg-[#1E2329]/30 transition-colors">
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded text-[10px] font-bold ${s.direction === 'CALL' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                {s.direction === 'CALL' ? '▲ CALL' : '▼ PUT'}
                              </span>
                            </td>
                            <td className="p-4 font-bold">{s.symbol}</td>
                            <td className="p-4 font-mono text-[#929498]">{new Date(s.entryTime * 1000).toLocaleTimeString()}</td>
                            <td className="p-4">
                               <div className="flex items-center gap-2">
                                 <div className="w-16 h-1.5 bg-[#1E2329] rounded-full overflow-hidden">
                                   <div className="bg-blue-500 h-full" style={{ width: '75%' }} />
                                 </div>
                                 <span className="text-xs">75%</span>
                               </div>
                            </td>
                            <td className="p-4">
                               <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.result === 'WIN' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                 {s.result || 'PENDING'}
                               </span>
                            </td>
                          </tr>
                        ))}
                     </tbody>
                   </table>
                </div>
              </motion.div>
            )}

            {view === 'assets' && (
              <motion.div key="assets" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold flex items-center gap-2"><Layers className="text-blue-500" /> Asset Management</h2>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Add Custom Asset</button>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  {assets.map(asset => (
                    <div key={asset.symbol} className="bg-[#14171C] p-6 rounded-xl border border-[#1E2329] space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-bold">{asset.name}</h4>
                          <span className="text-xs text-[#929498]">{asset.symbol}</span>
                        </div>
                        <span className="px-2 py-1 bg-[#1E2329] rounded text-[10px] font-bold text-white/50">{asset.type}</span>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2 text-sm">
                             <BarChart3 size={16} className="text-blue-400" />
                             <span>Live (Candle Chart)</span>
                           </div>
                           <button 
                           onClick={() => {
                             const newAssets = assets.map(a => a.symbol === asset.symbol ? {...a, isLive: !a.isLive} : a);
                             setAssets(newAssets);
                           }}
                         >
                           <Switch active={asset.isLive} />
                         </button>
                      </div>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2 text-sm">
                           <Zap size={16} className="text-yellow-400" />
                           <span>Signal Generate</span>
                         </div>
                         <button 
                           onClick={() => {
                             const newAssets = assets.map(a => a.symbol === asset.symbol ? {...a, isSignalEnabled: !a.isSignalEnabled} : a);
                             setAssets(newAssets);
                           }}
                         >
                            <Switch active={asset.isSignalEnabled} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {view === 'strategies' && (
              <motion.div key="strategies" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="text-orange-500" /> Strategy Management</h2>
                  <div className="flex gap-2">
                     <button className="bg-[#1E2329] px-4 py-2 rounded-lg text-sm font-bold border border-[#2B3139]">Reset</button>
                     <button className="bg-blue-600 px-4 py-2 rounded-lg text-sm font-bold text-white">Save Changes</button>
                  </div>
                </div>
                
                <div className="bg-[#14171C] rounded-xl border border-[#1E2329] p-6 space-y-8">
                   <div className="flex items-center justify-between pb-6 border-b border-[#1E2329]">
                     <div>
                       <h4 className="font-bold">Minimum Match Threshold</h4>
                       <p className="text-xs text-[#929498] mt-1">কতটি Signal-eligible strategy match করলে signal generate হবে</p>
                     </div>
                     <div className="flex items-center gap-4">
                       <input 
                         type="number" 
                         value={globalSettings.minMatchThreshold || 2} 
                         onChange={(e) => setGlobalSettings({...globalSettings, minMatchThreshold: parseInt(e.target.value)})}
                         className="w-16 bg-[#0B0E14] border border-[#1E2329] rounded p-2 text-center text-sm font-bold" 
                       />
                       <button 
                         onClick={() => handleSaveSettings(globalSettings)}
                         className="bg-blue-600/10 text-blue-500 px-4 py-2 rounded text-xs font-bold border border-blue-500/20"
                       >
                         Save
                       </button>
                     </div>
                   </div>

                   <StrategyItem name="2 Green 2 Red" description="Down trend এ ২টি Green → ১টি Red → PUT signal" />
                   <StrategyItem name="RSI Overbought/Oversold" description="RSI>70 PUT, RSI<30 CALL (OTC mean reversion)" hasParams params={{ Period: 14, Overbought: 70, Oversold: 30 }} />
                   <StrategyItem name="Fractal" description="Quotex Fractal (5-candle) → PUT/CALL signal" />
                </div>
              </motion.div>
            )}

            {view === 'future' && (
              <motion.div 
                key="future"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 pb-20"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                    <h2 className="text-sm font-bold tracking-wider uppercase text-gray-400">Future Signals Console</h2>
                  </div>
                  <button 
                    onClick={() => setShowUploadForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
                  >
                    <Upload size={14} /> Add New Future Signal
                  </button>
                </div>

                {showUploadForm && (
                  <div className="bg-[#14171C] rounded-xl border border-[#1E2329] p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-sm font-bold text-gray-300">Upload New Signals</p>
                      <button onClick={() => setShowUploadForm(false)} className="text-gray-500 hover:text-white transition-colors">
                        <X size={18} />
                      </button>
                    </div>
                    <div className="mb-4">
                      <p className="text-xs text-gray-400 mb-2">নিচের format এ Future Signal list paste করুন (UTC+6 time):</p>
                      <div className="bg-[#0B0E11] p-5 rounded-lg border border-[#1E2329] font-mono text-[11px] text-gray-500 mb-6 leading-relaxed bg-[#0B0E11]/80 shadow-inner">
                        1. 14:41 USD/COP OTC DOWN<br/>
                        2. 14:46 USD/COP OTC UP<br/>
                        3. 14:47 USD/COP OTC UP
                      </div>
                    </div>

                    <textarea
                      value={manualSignalsText}
                      onChange={(e) => setManualSignalsText(e.target.value)}
                      placeholder="Paste your signal list here..."
                      className="w-full h-80 bg-[#0B0E11] border border-[#1E2329] rounded-lg p-6 text-sm focus:outline-none focus:border-blue-500 transition-all font-mono resize-none mb-6 shadow-lg shadow-black/20 text-[#D9D9D9]"
                    />

                    <div className="flex justify-end pt-2 gap-3">
                      <button
                        onClick={() => setShowUploadForm(false)}
                        className="px-6 py-4 rounded-xl bg-[#1E2329] text-gray-400 font-bold text-sm hover:bg-[#2A313A] hover:text-white transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpload}
                        disabled={isUploading || !manualSignalsText.trim()}
                        className="flex items-center gap-3 px-8 py-4 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-600/30 active:scale-95 group"
                      >
                        {isUploading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Upload size={20} className="group-hover:translate-y-[-2px] transition-transform" />
                        )}
                        Upload Signals
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-[#14171C] rounded-xl border border-[#1E2329] overflow-hidden">
                  {futureBatches.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">
                      No future signal lists Found. Add one to get started.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#1E2329] bg-[#0B0E11]/50 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                            <th className="py-4 px-6">Upload Time</th>
                            <th className="py-4 px-6">Source</th>
                            <th className="py-4 px-6">Total Signals</th>
                            <th className="py-4 px-6">Upcoming</th>
                            <th className="py-4 px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {futureBatches.map((batch) => (
                            <tr key={batch.id} className="border-b border-[#1E2329] hover:bg-[#1E2329]/30 transition-colors">
                              <td className="py-4 px-6 text-gray-300">
                                {new Date(batch.uploadTime).toLocaleString()}
                              </td>
                              <td className="py-4 px-6 text-blue-400 font-medium">
                                {batch.sourceName}
                              </td>
                              <td className="py-4 px-6">
                                <span className="bg-[#1E2329] px-2 py-1 rounded text-xs text-gray-300 font-mono">
                                  {batch.signalCount}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <span className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded text-xs font-mono">
                                  {batch.upcomingCount}
                                </span>
                              </td>
                              <td className="py-4 px-6 flex justify-end gap-2">
                                <button
                                  onClick={() => setViewingBatch(batch)}
                                  className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded transition-colors"
                                  title="View Details"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteBatch(batch.id)}
                                  className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded transition-colors"
                                  title="Delete Batch"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {viewingBatch && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-[#14171C] w-full max-w-3xl rounded-2xl border border-[#1E2329] shadow-2xl flex flex-col max-h-[85vh]"
                    >
                      <div className="p-6 border-b border-[#1E2329] flex justify-between items-center shrink-0">
                        <div>
                          <h3 className="text-lg font-bold text-white">Signal List Details</h3>
                          <p className="text-xs text-gray-400 mt-1">Source: {viewingBatch.sourceName} • {new Date(viewingBatch.uploadTime).toLocaleString()}</p>
                        </div>
                        <button onClick={() => setViewingBatch(null)} className="text-gray-500 hover:text-white transition-colors">
                          <X size={24} />
                        </button>
                      </div>
                      <div className="p-6 overflow-y-auto w-full custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {viewingBatch.signals?.map((sig: any) => (
                            <div key={sig.id} className="bg-[#0B0E11] p-4 rounded-xl border border-[#1E2329] flex justify-between items-center">
                              <div className="flex flex-col gap-1">
                                <span className="text-gray-400 text-xs font-mono">{sig.time}</span>
                                <span className="font-bold text-sm tracking-wider">{sig.symbol}</span>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${sig.direction === 'CALL' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                  {sig.direction === 'CALL' ? 'CALL 🔼' : 'PUT 🔽'}
                                </span>
                                <span className="text-[10px] uppercase font-bold tracking-wider mt-1">
                                  {sig.resultProcessed ? (
                                    sig.result === 'WIN' ? (
                                      <span className="text-green-500">✅ WIN</span>
                                    ) : (
                                      <span className="text-red-500">❌ LOSS</span>
                                    )
                                  ) : (
                                    <span className="text-yellow-500">⏳ Upcoming</span>
                                  )}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}

            {view === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
                <div className="flex items-center gap-3">
                  <Settings className="text-[#929498] w-6 h-6" />
                  <h2 className="text-2xl font-bold">Settings</h2>
                </div>
                
                {/* 1. System Control */}
                <SettingsSection title="System Control">
                  <div className="grid grid-cols-2 gap-6">
                     <div className="bg-[#14171C] p-6 rounded-xl border border-[#1E2329] flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                              <Zap className="text-yellow-500 w-5 h-5" />
                           </div>
                           <div>
                             <h4 className="font-bold text-sm">System Kill Switch</h4>
                             <p className="text-[10px] text-[#929498] mt-1">সিস্টেম চালু/বন্ধ করুন। বন্ধ করলে সব stream ও signal বন্ধ হবে।</p>
                           </div>
                        </div>
                        <button 
                          onClick={toggleSystem}
                          className={`px-6 py-2 rounded-lg font-bold text-xs transition-all ${isSystemOn ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                        >
                          {isSystemOn ? 'ON' : 'OFF'}
                        </button>
                     </div>

                     <div className="bg-[#14171C] p-6 rounded-xl border border-[#1E2329] flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                              <Bot size={20} />
                           </div>
                           <div>
                             <h4 className="font-bold text-sm">AI Kill Switch</h4>
                             <p className="text-[10px] text-[#929498] mt-1">AI বন্ধ করলে শুধু Strategy দিয়ে signal generate হবে।</p>
                           </div>
                        </div>
                        <button 
                          onClick={toggleAI}
                          className={`px-6 py-2 rounded-lg font-bold text-xs transition-all ${isAIOn ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-white'}`}
                        >
                          {isAIOn ? 'AI ON' : 'AI OFF'}
                        </button>
                     </div>
                  </div>
                </SettingsSection>

                {/* 2. Signal Configuration */}
                <SettingsSection title="Signal Configuration">
                   <div className="bg-[#14171C] rounded-xl border border-[#1E2329] p-6 space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                         <div className="col-span-2">
                            <InputGroup 
                              label="Telegram Bot Token" 
                              value={globalSettings.botToken} 
                              onChange={(v) => setGlobalSettings({...globalSettings, botToken: v})}
                              placeholder="7123456789:AAH-xXyYzZ..." 
                              type="password"
                            />
                         </div>
                         <InputGroup 
                           label="AI MIN CONFIDENCE (%)" 
                           value={globalSettings.minConfidence} 
                           onChange={(v) => setGlobalSettings({...globalSettings, minConfidence: parseInt(v)})}
                           description="এর নিচে confidence হলে signal skip" 
                         />
                         <InputGroup 
                           label="SIGNAL COOLDOWN (SECOND)" 
                           value={globalSettings.signalCooldown} 
                           onChange={(v) => setGlobalSettings({...globalSettings, signalCooldown: parseInt(v)})}
                           description="একই asset এ পরপর signal এর মধ্যে বিরতি" 
                         />
                         <InputGroup 
                           label="SIGNAL CUTOFF (SECOND)" 
                           value={globalSettings.signalCutoff} 
                           onChange={(v) => setGlobalSettings({...globalSettings, signalCutoff: parseInt(v)})}
                           description="Entry time এর এত second পরে signal deliver হবে না" 
                         />
                         <InputGroup 
                           label="FUTURE SIGNAL PRE-DELIVERY (MINUTES)" 
                           value={globalSettings.preDeliveryMinutes} 
                           onChange={(v) => setGlobalSettings({...globalSettings, preDeliveryMinutes: parseInt(v)})}
                           description="Future signal entry টাইমের কত মিনিট আগে পাঠাবে" 
                         />
                         <InputGroup 
                           label="CANDLE TIMEFRAME (SECONDS)" 
                           value={globalSettings.candleTimeframe} 
                           onChange={(v) => setGlobalSettings({...globalSettings, candleTimeframe: parseInt(v)})}
                           description="Default: 60 (1 minute)" 
                         />
                      </div>
                      <button 
                        onClick={() => handleSaveSettings(globalSettings)}
                        className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-blue-700 transition-colors"
                      >
                        <FileUp size={16} />
                        Save Signal Settings
                      </button>
                   </div>
                </SettingsSection>

                {/* 3. Custom Signal Message */}
                <SettingsSection title="Custom Signal Message">
                   <div className="bg-[#14171C] rounded-xl border border-[#1E2329] p-6 space-y-4">
                     <div className="space-y-2">
                       <label className="text-[10px] font-bold text-[#929498] uppercase tracking-wider">MESSAGE (প্রতিটি SIGNAL এ যোগ হবে)</label>
                       <textarea 
                         value={globalSettings.customMessage}
                         onChange={(e) => setGlobalSettings({...globalSettings, customMessage: e.target.value})}
                         className="w-full h-24 bg-[#0B0E14] border border-[#1E2329] rounded-lg p-4 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                         placeholder="যেমন: 💰 $10 invest করুন | Martingale 3x"
                       />
                       <p className="text-[10px] text-[#929498]">Dashboard & Telegram উভয় জায়গায় দেখাবে (Chat ID permission এর উপর নির্ভর করে)</p>
                     </div>
                     <div className="flex gap-3">
                       <button 
                         onClick={() => handleSaveSettings(globalSettings)}
                         className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2"
                       >
                         <MessageSquare size={16} />
                         Save Message
                       </button>
                       <button 
                         onClick={() => setGlobalSettings({...globalSettings, customMessage: ""})}
                         className="px-8 py-2.5 rounded-lg font-bold text-xs bg-[#1E2329] text-[#929498] border border-[#2B3139] flex items-center gap-2"
                       >
                          <Trash2 size={16} />
                          Clear
                       </button>
                     </div>
                   </div>
                </SettingsSection>

                {/* 4. Telegram Chat IDs */}
                <SettingsSection title="Telegram Chat IDs">
                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] text-[#929498]">Chat এ ক্লিক করে permission edit করুন</span>
                      </div>
                      
                      <div className="space-y-3">
                        {telegramChats.map(chat => (
                          <div key={chat.id} className="bg-[#14171C] p-4 rounded-xl border border-[#1E2329] flex items-center justify-between group">
                            <div>
                               <h5 className="font-bold text-sm">{chat.name}</h5>
                               <p className="text-[10px] text-[#929498]">{chat.chatId}</p>
                               <div className="flex flex-wrap gap-2 mt-3">
                                  {Object.entries(chat.permissions).map(([key, val]) => val && (
                                    <span key={key} className="px-2 py-0.5 bg-[#1E2329] text-[#929498] rounded-[4px] text-[8px] font-bold uppercase tracking-wider border border-[#2B3139]">
                                      {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                  ))}
                               </div>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={async () => {
                                  const res = await sendTestTelegramMessage(chat.chatId);
                                  if (res.success) {
                                    alert("Test message sent!");
                                  } else {
                                    alert("Failed to send: " + (res.error || "Unknown error"));
                                  }
                                }}
                                title="Send Test Message"
                                className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors border border-blue-500/20"
                              >
                                <Send size={14} />
                              </button>
                              <button 
                                onClick={() => handleEditChat(chat)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-500 font-bold text-[10px] border border-yellow-500/20"
                              >
                                <Edit2 size={12} /> Edit
                              </button>
                              <button 
                                onClick={async () => {
                                  await deleteTelegramChat(chat.id);
                                  setTelegramChats(await fetchTelegramChats());
                                }}
                                className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors border border-red-500/20"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div id="telegram-chat-form" className="bg-[#14171C] p-6 rounded-xl border border-[#1E2329] mt-6 space-y-6">
                         <h5 className="text-[10px] font-bold uppercase tracking-wider">{editingChatId ? "Edit Chat ID" : "+ নতুন Chat ID যোগ করুন"}</h5>
                         <div className="grid grid-cols-2 gap-4">
                            <InputGroup 
                              label="CHAT ID" 
                              placeholder="-1001234567890" 
                              value={newChat.chatId} 
                              onChange={(v) => setNewChat({...newChat, chatId: v})} 
                            />
                            <InputGroup 
                              label="NAME / LABEL" 
                              placeholder="Premium Members" 
                              value={newChat.name} 
                              onChange={(v) => setNewChat({...newChat, name: v})} 
                            />
                         </div>
                         <div className="space-y-3">
                            <p className="text-[10px] font-bold text-[#929498] flex items-center gap-2"><Bell size={10} /> Notification Permissions:</p>
                            <div className="grid grid-cols-6 gap-3">
                               <Checkbox 
                                 label="Live Signal" 
                                 checked={newChat.permissions.liveSignal} 
                                 onChange={(v) => setNewChat({...newChat, permissions: {...newChat.permissions, liveSignal: v}})} 
                               />
                               <Checkbox 
                                 label="Future Pre" 
                                 checked={newChat.permissions.futurePre} 
                                 onChange={(v) => setNewChat({...newChat, permissions: {...newChat.permissions, futurePre: v}})} 
                               />
                               <Checkbox 
                                 label="Future Result" 
                                 checked={newChat.permissions.futureResult} 
                                 onChange={(v) => setNewChat({...newChat, permissions: {...newChat.permissions, futureResult: v}})} 
                               />
                               <Checkbox 
                                 label="Live Result" 
                                 checked={newChat.permissions.liveResult} 
                                 onChange={(v) => setNewChat({...newChat, permissions: {...newChat.permissions, liveResult: v}})} 
                               />
                               <Checkbox 
                                 label="Custom Msg" 
                                 checked={newChat.permissions.customMsg} 
                                 onChange={(v) => setNewChat({...newChat, permissions: {...newChat.permissions, customMsg: v}})} 
                               />
                               <Checkbox 
                                 label="Strategy Alert" 
                                 checked={newChat.permissions.strategyAlert} 
                                 onChange={(v) => setNewChat({...newChat, permissions: {...newChat.permissions, strategyAlert: v}})} 
                               />
                            </div>
                         </div>
                         <div className="flex gap-2">
                           <button 
                             onClick={handleAddChat}
                             className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-xs flex items-center gap-2 mt-4 transition-transform active:scale-95 sm:w-auto w-full justify-center"
                           >
                              {editingChatId ? <Save size={16} /> : <PlusCircle size={16} />}
                              {editingChatId ? "Update Chat ID" : "Add Chat ID"}
                           </button>
                           {editingChatId && (
                             <button 
                               onClick={handleCancelEditChat}
                               className="bg-slate-700 text-white px-6 py-2 rounded-lg font-bold text-xs mt-4 transition-transform active:scale-95 sm:w-auto w-full justify-center"
                             >
                                Cancel
                             </button>
                           )}
                         </div>
                      </div>
                   </div>
                </SettingsSection>

                {/* 5. Future Signal - Bot Sources */}
                <SettingsSection title="Future Signal — Bot Sources">
                   <div className="bg-[#14171C] p-6 rounded-xl border border-[#1E2329] space-y-6">
                      <p className="text-[10px] text-[#929498]">এই Chat ID গুলো থেকে Telegram Bot এ Future Signal list পাঠালে সিস্টেম গ্রহণ করবে।</p>
                      
                      <div className="overflow-hidden border border-[#1E2329] rounded-lg">
                        <table className="w-full text-left text-[10px]">
                          <thead className="bg-[#1E2329]/50 font-bold uppercase tracking-wider text-[#929498]">
                            <tr>
                              <th className="p-3">Source Name</th>
                              <th className="p-3">Chat ID</th>
                              <th className="p-3">Permissions</th>
                              <th className="p-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#1E2329] bg-[#0B0E14]">
                            {botSources.length === 0 && (
                              <tr>
                                <td colSpan={4} className="p-4 text-center italic text-[#929498] opacity-60">Source নেই।</td>
                              </tr>
                            )}
                            {botSources.map(source => (
                              <tr key={source.id} className="hover:bg-[#1E2329]/20 transition-colors">
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded bg-blue-500/10 flex items-center justify-center text-blue-500">
                                      <Bot size={12} />
                                    </div>
                                    <span className="font-bold">{source.name}</span>
                                  </div>
                                </td>
                                <td className="p-3 text-[#929498] font-mono">{source.chatId}</td>
                                <td className="p-3">
                                  <div className="flex gap-1.5 flex-wrap">
                                    {source.permissions.signalsMenu && <span className="px-1.5 py-0.5 bg-green-500/10 text-green-500 rounded text-[7.5px] font-bold border border-green-500/20 uppercase">Signals</span>}
                                    {source.permissions.statsMenu && <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-500 rounded text-[7.5px] font-bold border border-blue-500/20 uppercase">Stats</span>}
                                    {source.permissions.futureMenu && <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-500 rounded text-[7.5px] font-bold border border-purple-500/20 uppercase">Future</span>}
                                  </div>
                                </td>
                                <td className="p-3 text-right">
                                  <div className="flex gap-2 justify-end">
                                    <button 
                                      onClick={() => handleEditSource(source)}
                                      className="p-1.5 hover:bg-blue-500/10 text-blue-500 rounded transition-colors"
                                      title="Edit Source"
                                    >
                                      <Edit2 size={12} />
                                    </button>
                                    <button 
                                      onClick={async () => {
                                        if (confirm('Delete this source?')) {
                                          await deleteBotSource(source.id);
                                          setBotSources(await fetchBotSources());
                                        }
                                      }}
                                      className="p-1.5 hover:bg-red-500/10 text-red-500 rounded transition-colors"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div id="bot-source-form" className="bg-[#0B0E14] p-4 rounded-lg border border-[#1E2329] space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                           <InputGroup 
                             label="CHAT ID" 
                             placeholder="-1001234567890" 
                             value={newSource.chatId}
                             onChange={(v) => setNewSource({...newSource, chatId: v})}
                           />
                           <InputGroup 
                             label="NAME" 
                             placeholder="Admin" 
                             value={newSource.name}
                             onChange={(v) => setNewSource({...newSource, name: v})}
                           />
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-[#929498]">📊 Bot Menu Permissions:</p>
                          <div className="flex gap-6">
                             <Checkbox 
                               label="Signals Menu" 
                               checked={newSource.permissions.signalsMenu} 
                               onChange={(v) => setNewSource({...newSource, permissions: {...newSource.permissions, signalsMenu: v}})}
                             />
                             <Checkbox 
                               label="Stats Menu" 
                               checked={newSource.permissions.statsMenu} 
                               onChange={(v) => setNewSource({...newSource, permissions: {...newSource.permissions, statsMenu: v}})}
                             />
                             <Checkbox 
                               label="Future Menu" 
                               checked={newSource.permissions.futureMenu} 
                               onChange={(v) => setNewSource({...newSource, permissions: {...newSource.permissions, futureMenu: v}})}
                             />
                             <Checkbox 
                               label="Add List Menu" 
                               checked={newSource.permissions.addListMenu} 
                               onChange={(v) => setNewSource({...newSource, permissions: {...newSource.permissions, addListMenu: v}})}
                             />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={handleAddSource}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-[10px] flex items-center gap-2 mt-2 hover:bg-blue-700 active:scale-95 transition-all w-full sm:w-auto justify-center"
                          >
                             {editingSourceId ? <Save size={14} /> : <PlusCircle size={14} />}
                             {editingSourceId ? "Update Source" : "Add Source"}
                          </button>
                          {editingSourceId && (
                            <button 
                              onClick={handleCancelEdit}
                              className="bg-slate-700 text-white px-4 py-2 rounded-lg font-bold text-[10px] mt-2 hover:bg-slate-600 active:scale-95 transition-all w-full sm:w-auto justify-center"
                            >
                               Cancel
                            </button>
                          )}
                        </div>
                      </div>
                   </div>
                </SettingsSection>

                {/* 6. Future Signal — Manual Upload */}
                <SettingsSection title="Future Signal — Manual Upload">
                   <div className="bg-[#14171C] p-6 rounded-xl border border-[#1E2329] space-y-6">
                      <div className="space-y-4">
                        <p className="text-[10px] text-[#929498]">নিচের format এ Future Signal list paste করুন (UTC+6 time):</p>
                        <textarea 
                          value={manualSignalsText}
                          onChange={(e) => setManualSignalsText(e.target.value)}
                          className="w-full h-48 bg-[#0B0E14] border border-[#1E2329] rounded-lg p-4 font-mono text-[10px] text-white/80 focus:outline-none focus:border-blue-500 transition-colors"
                          placeholder="1. 14:41 USD/COP OTC DOWN
2. 14:46 USD/COP OTC UP
3. 14:47 USD/COP OTC UP"
                        />
                      </div>
                      <button 
                        onClick={async () => {
                          if (!manualSignalsText.trim()) return;
                          const res = await uploadFutureSignals(manualSignalsText);
                          if(res.success) {
                            alert(`${res.count} signals uploaded successfully!`);
                            setManualSignalsText('');
                          }
                        }}
                        className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95"
                      >
                         <FileUp size={16} />
                         Upload Signals
                      </button>
                   </div>
                </SettingsSection>

                {/* 7. Web UI Security */}
                <SettingsSection title="Web UI Security">
                   <div className="bg-[#14171C] p-6 rounded-xl border border-[#1E2329] grid grid-cols-2 gap-8 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                         <Shield size={120} />
                      </div>
                      <div className="space-y-6">
                         <InputGroup 
                           label="ADMIN USERNAME" 
                           value={authSettings.username}
                           onChange={(v) => setAuthSettings({ ...authSettings, username: v })}
                           placeholder="Enter new username"
                           description="Used for dashboard login"
                         />
                         <InputGroup 
                           label="ADMIN PASSWORD" 
                           type="password"
                           value={authSettings.password}
                           onChange={(v) => setAuthSettings({ ...authSettings, password: v })}
                           placeholder="Enter new password"
                           description="Choose a strong password"
                         />
                         <div className="pt-2">
                           <button 
                             onClick={handleUpdateAuth}
                             disabled={isUpdatingAuth}
                             className="bg-blue-600/10 text-blue-500 border border-blue-500/20 px-6 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-blue-600/20 transition-all"
                           >
                             {isUpdatingAuth ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}
                             Update Login Credentials
                           </button>
                         </div>
                      </div>
                      <div className="flex flex-col justify-center p-6 bg-blue-500/5 rounded-xl border border-blue-500/10">
                         <div className="flex items-center gap-2 text-blue-500 mb-2">
                            <Shield size={18} />
                            <span className="text-sm font-bold uppercase tracking-wider">Security Warning</span>
                         </div>
                         <p className="text-[11px] leading-relaxed text-gray-500">
                           Changing these credentials will update the access for all sessions. 
                           SignalPro uses encrypted database storage for your credentials. 
                           Make sure to remember your new password after updating.
                         </p>
                      </div>
                   </div>
                </SettingsSection>

                <div className="pt-10 pb-20 flex justify-center">
                   <button 
                     onClick={() => handleSaveSettings(globalSettings)}
                     disabled={saveStatus === 'saving'}
                     className={`px-12 py-4 rounded-xl font-bold text-lg flex items-center gap-3 shadow-xl transition-all active:scale-95 ${saveStatus === 'saving' ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                   >
                     {saveStatus === 'saving' ? 'Saving...' : (
                       <>
                         <Settings className={saveStatus === 'saved' ? 'animate-spin' : ''} />
                         Save All Configuration
                       </>
                     )}
                   </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    );
  }

function NavItem({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
        active 
          ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20' 
          : 'text-[#929498] hover:bg-[#1E2329] hover:text-white'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function AssetItem({ asset, active, onClick }: { asset: AssetConfig, active: boolean, onClick: () => void, key?: string }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
        active 
          ? 'bg-blue-600/10 border-blue-500/30' 
          : 'bg-[#14171C] border-[#1E2329] hover:border-[#2B3139]'
      }`}
    >
      <div className="flex flex-col items-start gap-1">
        <span className="text-xs font-bold text-white uppercase">{asset.name} <span className="text-[10px] opacity-40 ml-1 font-normal tracking-wide">{asset.type}</span></span>
        <span className="text-[10px] font-mono tabular-nums text-[#929498]">1509.76000</span>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${asset.isSignalEnabled ? 'text-green-500' : 'text-yellow-500'}`}>
          {asset.isSignalEnabled ? 'PUT' : 'NEUTRAL'}
        </span>
        <span className="text-[9px] font-bold text-green-500 flex items-center gap-1 uppercase tracking-tighter self-end"><div className="w-1 h-1 bg-green-500 rounded-full animate-ping" /> Live</span>
      </div>
    </button>
  );
}

function StatItem({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="flex flex-col items-center px-4 border-r border-[#1E2329] last:border-0 relative">
       <span className="text-[8px] font-bold text-[#929498] uppercase tracking-[0.2em]">{label}</span>
       <span className={`text-sm font-bold ${color} mt-0.5`}>{value}</span>
    </div>
  );
}

function StrategyProgress({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px] font-bold">
        <span className={color}>{label}</span>
        <span>{value.toFixed(1)}</span>
      </div>
      <div className="w-full h-1 bg-[#1E2329] rounded-full overflow-hidden">
        <div className={`h-full ${color.includes('green') ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-[#14171C] p-6 rounded-xl border border-[#1E2329] flex flex-col items-center justify-center space-y-2">
       <span className="text-6xl font-bold">{value}</span>
       <span className="text-[10px] font-bold tracking-[0.3em] text-[#929498] uppercase">{label}</span>
    </div>
  );
}

function Switch({ active }: { active: boolean }) {
  return (
    <div className={`w-10 h-5 rounded-full p-1 transition-colors ${active ? 'bg-blue-600' : 'bg-[#1E2329]'}`}>
      <div className={`w-3 h-3 bg-white rounded-full transition-transform ${active ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
  );
}

function StrategyItem({ name, description, hasParams, params }: { name: string, description: string, hasParams?: boolean, params?: any }) {
  const [enabled, setEnabled] = useState(true);
  return (
    <div className="flex items-start justify-between p-4 rounded-xl border border-[#1E2329] bg-[#1E2329]/20">
      <div className="flex gap-4">
        <div className="mt-1 cursor-grab active:cursor-grabbing text-[#929498]"><Layers size={14} /></div>
        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2">
              <h5 className="font-bold text-sm">{name}</h5>
              <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-500 rounded text-[8px] font-bold uppercase">Signal + Alert</span>
            </div>
            <p className="text-[10px] text-[#929498] mt-0.5">{description}</p>
          </div>
          {hasParams && params && (
             <div className="grid grid-cols-3 gap-3">
               {Object.entries(params).map(([key, val]) => (
                 <div key={key}>
                   <label className="text-[8px] font-bold text-[#929498] uppercase mb-1 block">{key}</label>
                   <input type="number" defaultValue={val as number} className="w-full bg-[#0B0E14] border border-[#1E2329] rounded p-1.5 text-xs font-mono" />
                 </div>
               ))}
             </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
         <select className="bg-[#0B0E14] border border-[#1E2329] text-[10px] rounded px-2 py-1 focus:outline-none">
           <option>Signal + Alert</option>
           <option>Signal Only</option>
           <option>Alert Only</option>
         </select>
         <button onClick={() => setEnabled(!enabled)}><Switch active={enabled} /></button>
      </div>
    </div>
  );
}

function SettingsSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-[#929498] flex items-center gap-3">
        <div className="w-1.5 h-3.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" /> {title}
      </h3>
      {children}
    </div>
  );
}

function InputGroup({ label, value, onChange, description, placeholder, type = "text" }: { label: string, value?: any, onChange?: (v: string) => void, description?: string, placeholder?: string, type?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-bold text-[#929498] uppercase tracking-wider">{label}</label>
      <input 
        type={type} 
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#0B0E14] border border-[#1E2329] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-700"
      />
      {description && <p className="text-[9px] text-[#929498] mt-1">{description}</p>}
    </div>
  );
}

function Checkbox({ label, checked, onChange }: { label: string, checked?: boolean, onChange?: (v: boolean) => void }) {
  return (
    <button 
      onClick={() => onChange?.(!checked)}
      className="flex items-center gap-2 group cursor-pointer"
    >
       <div className={`w-3.5 h-3.5 rounded-sm border transition-colors flex items-center justify-center ${checked ? 'bg-blue-600 border-blue-600' : 'border-[#2B3139] group-hover:border-[#929498]'}`}>
          {checked && <Zap className="w-2.5 h-2.5 text-white fill-current" />}
       </div>
       <span className={`text-[10px] font-medium transition-colors ${checked ? 'text-white' : 'text-[#929498]'}`}>{label}</span>
    </button>
  );
}

const telegram_chats_mock: TelegramChat[] = [
  {
    id: '1',
    chatId: '-1001597650385',
    name: 'Qx Vuya Signal',
    permissions: {
      liveSignal: true,
      futurePre: true,
      futureResult: true,
      liveResult: true,
      customMsg: true,
      strategyAlert: true,
      signalsMenu: true,
      statsMenu: true,
      futureMenu: true
    }
  },
  {
    id: '2',
    chatId: '6363876244',
    name: 'ZidanX',
    permissions: {
      liveSignal: true,
      futurePre: true,
      futureResult: true,
      liveResult: true,
      customMsg: true,
      strategyAlert: true,
      signalsMenu: true,
      statsMenu: true,
      futureMenu: true
    }
  },
  {
    id: '3',
    chatId: '-1001376997786',
    name: 'Qx Vuya Signal(Future Signal only)',
    permissions: {
       liveSignal: true,
       futurePre: true,
       futureResult: true,
       liveResult: true,
       customMsg: true,
       strategyAlert: true,
       signalsMenu: true,
       statsMenu: true,
       futureMenu: true
    }
  }
];


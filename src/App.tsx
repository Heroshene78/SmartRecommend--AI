import React, { useState, useEffect } from 'react';
import { Sparkles, Compass, Bookmark, BarChart3, User, Moon, Sun, LogOut, Check, Share2, Download, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserPreferences, TabType, RecommendationItem } from './types';
import { RECOMMENDATION_DATA, ALL_INTERESTS } from './data/items';
import AuthView from './components/AuthView';
import DashboardView from './components/DashboardView';
import AnalyticsView from './components/AnalyticsView';
import ProfileView from './components/ProfileView';
import RecommendationCard from './components/RecommendationCard';
import SplashScreen from './components/SplashScreen';

// Local storage indices
const STORAGE_USER_KEY = 'synapsesphere_ai_user';
const STORAGE_DARK_MODE_KEY = 'synapsesphere_ai_darkmode';

export default function App() {
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [shareSuccess, setShareSuccess] = useState(false);
  const [savedSearchQuery, setSavedSearchQuery] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSplashing, setIsSplashing] = useState(true);

  // 1. Load preferences on boot
  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_USER_KEY);
      if (cached) {
        setUserPreferences(JSON.parse(cached));
      }

      const cachedDarkMode = localStorage.getItem(STORAGE_DARK_MODE_KEY);
      if (cachedDarkMode !== null) {
        setIsDarkMode(cachedDarkMode === 'true');
      }
    } catch (e) {
      console.warn("Storage fetch failed", e);
    }
  }, []);

  // 2. Sync changes back to Cache
  const handleUpdatePreferences = (updated: UserPreferences) => {
    setUserPreferences(updated);
    try {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Storage set failed", e);
    }
  };

  const handleToggleDarkMode = () => {
    const newVal = !isDarkMode;
    setIsDarkMode(newVal);
    localStorage.setItem(STORAGE_DARK_MODE_KEY, String(newVal));
  };

  const handleAuthComplete = (newUser: UserPreferences) => {
    setUserPreferences(newUser);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(newUser));
    
    // Automatically transition to interests selection screen upon first sign up
    if (newUser.selectedInterests.length === 0) {
      setActiveTab('profile');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleSignOut = () => {
    setUserPreferences(null);
    localStorage.removeItem(STORAGE_USER_KEY);
    setActiveTab('dashboard');
  };

  const handleResetDatabase = () => {
    localStorage.removeItem(STORAGE_USER_KEY);
    setUserPreferences(null);
    setActiveTab('dashboard');
  };

  const handleToggleSave = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userPreferences) return;

    let updatedSaves = [...userPreferences.savedItemIds];
    if (updatedSaves.includes(itemId)) {
      updatedSaves = updatedSaves.filter(id => id !== itemId);
    } else {
      updatedSaves.push(itemId);
    }

    handleUpdatePreferences({
      ...userPreferences,
      savedItemIds: updatedSaves
    });
  };

  const handleViewItem = (itemId: string) => {
    if (!userPreferences) return;

    let updatedViews = [...userPreferences.viewedItemIds];
    if (!updatedViews.includes(itemId)) {
      updatedViews.push(itemId);
    }

    handleUpdatePreferences({
      ...userPreferences,
      viewedItemIds: updatedViews
    });
  };

  // Callback to personalizing and fire confetti!
  const handleSaveAndPersonalize = (selectedInterests: string[], name: string) => {
    if (!userPreferences) return;

    const isFirstTime = userPreferences.selectedInterests.length === 0;

    const updated: UserPreferences = {
      ...userPreferences,
      selectedInterests,
      name: name.trim() || userPreferences.name
    };

    handleUpdatePreferences(updated);

    // Fire Confetti!
    import('canvas-confetti').then((confettiModule) => {
      const confetti = (confettiModule.default as any) || (confettiModule as any);
      confetti({
        particleCount: 140,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#ec4899', '#3b82f6']
      });
    }).catch(err => {
      console.warn("Confetti call failed", err);
    });

    // Smooth transition back to dashboard
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveTab('dashboard');
  };

  // Convert raw saved item IDs to the full RecommendationItem objects
  const savedItems = RECOMMENDATION_DATA.filter(item => 
    userPreferences?.savedItemIds.includes(item.id)
  );

  const recentlyViewedItems = RECOMMENDATION_DATA.filter(item =>
    userPreferences?.viewedItemIds.includes(item.id)
  );

  // Filtered bookmark list (supports inner text searches)
  const filteredSavedItems = savedItems.filter(item => {
    if (!savedSearchQuery.trim()) return true;
    const q = savedSearchQuery.trim().toLowerCase();
    return item.title.toLowerCase().includes(q) || 
           item.category.toLowerCase().includes(q) ||
           item.tags.some(t => t.toLowerCase().includes(q));
  });

  // Export Saved Items as formatted Markdown text report
  const handleExportSaved = () => {
    if (savedItems.length === 0) return;

    let report = `# SynapseSphere AI - Saved Curations Report\n`;
    report += `Generated on: ${new Date().toLocaleDateString()}\n`;
    report += `User Account: ${userPreferences?.name || 'Explorer'}\n`;
    report += `Total Tracks: ${savedItems.length}\n\n`;
    report += `===============================================\n\n`;

    savedItems.forEach((item, index) => {
      report += `${index + 1}. [${item.category}] - ${item.title}\n`;
      report += `   Difficulty: ${item.difficulty} | Rating: ${item.rating} ★\n`;
      report += `   Duration: ${item.duration} | Learners: ${item.enrolledCount}\n`;
      report += `   Tags: ${item.tags.join(', ')}\n`;
      report += `   About: ${item.description}\n\n`;
    });

    try {
      const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SynapseSphere_AI_saved_list.md`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Download failed", e);
    }
  };

  // Simulate sharing a custom recommendation code/link
  const handleShareLink = () => {
    if (!userPreferences) return;
    
    const shareUrl = `${window.location.origin}?ref=synapsesphere&user=${encodeURIComponent(userPreferences.name)}&interests=${encodeURIComponent(userPreferences.selectedInterests.slice(0,3).join(','))}`;
    
    try {
      navigator.clipboard.writeText(shareUrl);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    } catch (e) {
      console.warn("Clip copy failed", e);
    }
  };

  // If splash sequence is active, show premium loading screen
  if (isSplashing) {
    return (
      <AnimatePresence mode="wait">
        <motion.div key="splash animate" className="w-full">
          <SplashScreen onFinished={() => setIsSplashing(false)} />
        </motion.div>
      </AnimatePresence>
    );
  }

  // If user is not logged in, show credentials view
  if (!userPreferences) {
    return (
      <AnimatePresence mode="wait">
        <motion.div key="auth animate" className="w-full">
          <AuthView onAuthComplete={handleAuthComplete} isDarkMode={isDarkMode} />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className={`min-h-screen font-sans transition-all duration-300 relative flex ${
      isDarkMode 
        ? 'bg-[#020617] text-slate-100' 
        : 'bg-slate-50 text-slate-850'
    }`}>
      
      {/* Background Glow decorative parameters */}
      {isDarkMode ? (
        <>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-fuchsia-600/5 blur-[100px] rounded-full pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-fuchsia-500/5 blur-[80px] rounded-full pointer-events-none" />
        </>
      )}

      {/* DESKTOP COLLAPSIBLE SIDEBAR */}
      <aside 
        className={`hidden md:flex flex-col justify-between sticky top-0 h-screen transition-all duration-300 border-r z-40 shrink-0 ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        } ${
          isDarkMode 
            ? 'bg-[#020617]/80 border-slate-900 backdrop-blur-xl' 
            : 'bg-white/90 border-slate-200 backdrop-blur-xl'
        }`}
      >
        {/* Sidebar brand header */}
        <div className="p-5 flex items-center gap-3 border-b border-dashed border-slate-800/10 dark:border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-indigo-550/20 shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {!isSidebarCollapsed && (
            <div className="animate-fadeIn">
              <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent block">
                SynapseSphere AI
              </span>
              <span className={`block text-[9px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Personalization Engine
              </span>
            </div>
          )}
        </div>

        {/* Sidebar Nav Elements */}
        <nav className="flex-1 p-3 space-y-2 pt-6">
          {/* Dashboard/Feed Tab */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3.5 select-none relative ${
              activeTab === 'dashboard'
                ? (isDarkMode ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-md' : 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm')
                : (isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent')
            }`}
          >
            <Compass className={`w-4.5 h-4.5 shrink-0 transition-transform duration-300 ${activeTab === 'dashboard' ? 'scale-110 text-indigo-400' : ''}`} />
            {!isSidebarCollapsed && <span className="animate-fadeIn">Predictions Feed</span>}
            {activeTab === 'dashboard' && (
              <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-indigo-500" />
            )}
          </button>

          {/* Saved Bookmarks Tab */}
          <button
            onClick={() => setActiveTab('saved')}
            className={`w-full px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3.5 select-none relative ${
              activeTab === 'saved'
                ? (isDarkMode ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-md' : 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm')
                : (isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent')
            }`}
          >
            <Bookmark className={`w-4.5 h-4.5 shrink-0 transition-transform duration-300 ${activeTab === 'saved' ? 'scale-110 text-indigo-400' : ''}`} />
            {!isSidebarCollapsed && (
              <span className="flex-grow flex items-center justify-between animate-fadeIn">
                <span>Saved Curations</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/25 px-2 py-0.5 rounded-md font-sans">
                  {savedItems.length}
                </span>
              </span>
            )}
            {isSidebarCollapsed && savedItems.length > 0 && (
              <div className="absolute top-1 right-2 w-4 h-4 rounded-full bg-indigo-600 border border-[#020617] text-[8px] flex items-center justify-center font-bold text-white scale-90">
                {savedItems.length}
              </div>
            )}
            {activeTab === 'saved' && (
              <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-indigo-500" />
            )}
          </button>

          {/* Analytics telemetry view */}
          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3.5 select-none relative ${
              activeTab === 'analytics'
                ? (isDarkMode ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-md' : 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm')
                : (isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent')
            }`}
          >
            <BarChart3 className={`w-4.5 h-4.5 shrink-0 transition-transform duration-300 ${activeTab === 'analytics' ? 'scale-110 text-indigo-400' : ''}`} />
            {!isSidebarCollapsed && <span className="animate-fadeIn">Score Analytics</span>}
            {activeTab === 'analytics' && (
              <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-indigo-500" />
            )}
          </button>

          {/* Profile Onboarding & Setup */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3.5 select-none relative ${
              activeTab === 'profile'
                ? (isDarkMode ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-md' : 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm')
                : (isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent')
            }`}
          >
            <User className={`w-4.5 h-4.5 shrink-0 transition-transform duration-300 ${activeTab === 'profile' ? 'scale-110 text-indigo-400' : ''}`} />
            {!isSidebarCollapsed && (
              <span className="flex items-center gap-1">
                <span className="animate-fadeIn">Profile & Interests</span>
                {userPreferences.selectedInterests.length === 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                )}
              </span>
            )}
            {activeTab === 'profile' && (
              <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-indigo-500" />
            )}
          </button>
        </nav>

        {/* Sidebar actions footer */}
        <div className="p-4 border-t border-dashed border-slate-800/10 dark:border-white/5 space-y-2.5">
          {/* Day / Night Theme Toggler */}
          <button
            onClick={handleToggleDarkMode}
            className={`w-full p-2.5 rounded-xl border transition-all flex items-center gap-3.5 text-xs font-bold select-none ${
              isDarkMode 
                ? 'border-slate-800/80 text-yellow-400 hover:bg-slate-850/50' 
                : 'border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4 shrink-0 text-amber-400" /> : <Moon className="w-4 h-4 shrink-0 text-indigo-650" />}
            {!isSidebarCollapsed && <span className="animate-fadeIn">{isDarkMode ? 'Daylight Mode' : 'Synthetic Contrast'}</span>}
          </button>

          {/* Secure Logout action */}
          <button
            onClick={handleSignOut}
            className={`w-full p-2.5 rounded-xl border transition-all flex items-center gap-3.5 text-xs font-bold select-none ${
              isDarkMode 
                ? 'border-slate-800/60 text-slate-400 hover:text-rose-400 hover:bg-rose-950/15' 
                : 'border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50/50'
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0 text-rose-500" />
            {!isSidebarCollapsed && <span className="animate-fadeIn font-bold">Disconnect</span>}
          </button>

          {/* Collapse vector controller */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`hidden md:flex w-full h-8 items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-slate-850/40 rounded-lg transition-all border border-transparent mt-3`}
            title={isSidebarCollapsed ? "Expand panel" : "Collapse panel"}
          >
            <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${isSidebarCollapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>
      </aside>

      {/* RIGHT SIDE MAIN FLEX COMPILATION */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        
        {/* MOBILE TOP NAVIGATION BAR */}
        <header className={`md:hidden sticky top-0 z-40 border-b backdrop-blur-xl transition-all ${
          isDarkMode ? 'bg-[#020617]/70 border-white/5' : 'bg-white/80 border-slate-200 shadow-sm'
        }`}>
          <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
            
            {/* Mobile Logo Brand */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-xs tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                  SynapseSphere AI
                </span>
                <span className={`block text-[8px] font-bold uppercase tracking-widest leading-none ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Dynamic Feed Mode
                </span>
              </div>
            </div>

            {/* Mobile controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleDarkMode}
                className={`p-2 rounded-lg border transition-all ${
                  isDarkMode ? 'border-slate-800 text-yellow-400 bg-slate-900/30' : 'border-slate-200 text-slate-600 bg-slate-50'
                }`}
              >
                {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
              
              <button
                onClick={handleSignOut}
                className={`p-2 rounded-lg border transition-all ${
                  isDarkMode ? 'border-slate-800 text-rose-450 bg-slate-900/30' : 'border-slate-200 text-rose-600 bg-slate-50'
                }`}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </header>

        {/* CONTAINER CONTENT AREA */}
        <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-12">
          
          {/* Prerequisite Preference Warning for blank profiles */}
          {userPreferences.selectedInterests.length === 0 && activeTab !== 'profile' && (
            <div className="mb-8 p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 animate-slideIn">
              <div className="space-y-1">
                <h4 className="font-bold text-xs uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 animate-pulse text-amber-500" />
                  Synapse Network Onboarding
                </h4>
                <p className="text-xs text-slate-450 mt-1 max-w-xl">
                  You haven't selected any matching nodes yet! Tap configure profile below to choose your technical preferences and initialize customized AI matrix vectors.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('profile')}
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-95 text-slate-950 text-xs font-black flex items-center gap-1.5 shrink-0 transition-all shadow-md hover:scale-101 active:scale-95"
              >
                Configure Profile
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ACTIVE TAB VIEWS */}
          {activeTab === 'dashboard' && (
            <DashboardView
              items={RECOMMENDATION_DATA}
              userPreferences={userPreferences}
              isDarkMode={isDarkMode}
              onToggleSave={handleToggleSave}
              onViewItem={handleViewItem}
              recentlyViewedItems={recentlyViewedItems}
            />
          )}

          {activeTab === 'saved' && (
            <div className="space-y-6">
              <div className={`p-6 sm:p-8 rounded-3xl relative overflow-hidden backdrop-blur-xl border flex flex-col md:flex-row items-center justify-between gap-6 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-indigo-950/30 via-slate-900/10 to-purple-950/20 border-white/5' 
                  : 'bg-gradient-to-r from-slate-100 to-white border-slate-200 shadow-sm'
              }`}>
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-600/10 blur-[80px] rounded-full pointer-events-none" />
                
                <div className="relative z-10">
                  <h2 className="text-2xl font-black mb-1">My Curated Workspace</h2>
                  <p className="text-xs text-slate-400 max-w-md">Bookmarks persistent across browser sessions. Generate shared links and export results downstream as structured text files.</p>
                </div>

                {savedItems.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2.5 relative z-10">
                    <button
                      onClick={handleShareLink}
                      className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 select-none active:scale-95 ${
                        shareSuccess
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : (isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-750' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-sm')
                      }`}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      {shareSuccess ? 'Link Copied!' : 'Share Dashboard'}
                    </button>
                    <button
                      onClick={handleExportSaved}
                      className="py-2.5 px-4 rounded-xl text-xs font-bold transition-all bg-gradient-to-r from-indigo-600 to-indigo-700 hover:opacity-95 text-white shadow-md flex items-center gap-2 select-none active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export (.MD Report)
                    </button>
                  </div>
                )}
              </div>

              {/* Inner Bookmarks Filter Bar */}
              {savedItems.length > 0 && (
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Filter saved items by tags or categories..."
                    value={savedSearchQuery}
                    onChange={(e) => setSavedSearchQuery(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-indigo-500/50 ${
                      isDarkMode ? 'bg-slate-950/60 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-850'
                    }`}
                  />
                </div>
              )}

              {/* Bookmarked lists */}
              {filteredSavedItems.length === 0 ? (
                <div className={`p-16 text-center rounded-2xl border border-dashed text-slate-400 ${
                  isDarkMode ? 'border-slate-850 bg-slate-950/10' : 'border-slate-200 bg-slate-50'
                }`}>
                  <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
                  <h4 className="font-bold text-base mb-1 text-slate-300 dark:text-slate-400">No bookmarked tracks found</h4>
                  <p className="text-xs max-w-xs mx-auto">
                    {savedItems.length > 0
                      ? "Adjust your filter searches above"
                      : "Bookmark interesting suggested modules in your recommendations feed!"
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSavedItems.map((item) => {
                    // Reconstruct mock scores for bookmarks view using active interests
                    const userInterests = userPreferences.selectedInterests;
                    const matchingTags = item.tags.filter(tag => userInterests.includes(tag));
                    const score = matchingTags.length;
                    
                    let matchPercentage = 60;
                    if (userInterests.length > 0) {
                      const overlapFactor = score / item.tags.length;
                      const preferenceCoverage = score / userInterests.length;
                      const alignment = (overlapFactor + preferenceCoverage) / 2;
                      
                      let targetScore = 61;
                      if (alignment >= 0.8) targetScore = 98;
                      else if (alignment >= 0.6) targetScore = 93;
                      else if (alignment >= 0.45) targetScore = 88;
                      else if (alignment >= 0.3) targetScore = 82;
                      else if (alignment >= 0.2) targetScore = 76;
                      else if (alignment >= 0.1) targetScore = 69;

                      const pseudoRandomOffset = (parseInt(item.id) % 5) - 2;
                      matchPercentage = targetScore + pseudoRandomOffset;
                    }

                    const resultItem = {
                      ...item,
                      score,
                      matchPercentage,
                      explanation: "Slick saved item tracking compatible with database indices."
                    };

                    return (
                      <RecommendationCard
                        key={`saved-${item.id}`}
                        item={resultItem}
                        isSaved={true}
                        isDarkMode={isDarkMode}
                        onToggleSave={handleToggleSave}
                        onViewDetails={handleViewItem}
                        userInterests={userPreferences.selectedInterests}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              recommendedItems={RECOMMENDATION_DATA.map(item => {
                const userInterests = userPreferences.selectedInterests;
                const matchingTags = item.tags.filter(tag => userInterests.includes(tag));
                const score = matchingTags.length;

                let matchPercentage = 60;
                if (userInterests.length > 0) {
                  const overlapFactor = score / item.tags.length;
                  const preferenceCoverage = score / userInterests.length;
                  const alignment = (overlapFactor + preferenceCoverage) / 2;
                  
                  let targetScore = 61;
                  if (alignment >= 0.8) targetScore = 98;
                  else if (alignment >= 0.6) targetScore = 93;
                  else if (alignment >= 0.45) targetScore = 88;
                  else if (alignment >= 0.3) targetScore = 82;
                  else if (alignment >= 0.2) targetScore = 76;
                  else if (alignment >= 0.1) targetScore = 69;

                  const pseudoRandomOffset = (parseInt(item.id) % 5) - 2;
                  matchPercentage = targetScore + pseudoRandomOffset;
                }

                return { 
                  ...item, 
                  score, 
                  matchPercentage, 
                  explanation: 'Analytics alignment vector' 
                };
              })}
              savedItems={savedItems}
              userInterests={userPreferences.selectedInterests}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              userPreferences={userPreferences}
              isDarkMode={isDarkMode}
              onResetDatabase={handleResetDatabase}
              onSaveAndPersonalize={handleSaveAndPersonalize}
            />
          )}

        </main>

        {/* COMPREHENSIVE PLATFORM FOOTER */}
        <footer className={`py-6 border-t mt-auto text-center select-none text-[10px] uppercase tracking-widest font-bold ${
          isDarkMode ? 'border-slate-900/60 text-slate-500 bg-slate-950/20' : 'border-slate-200 text-slate-400 bg-slate-50'
        }`}>
          SynapseSphere AI • "Where Your Interests Shape the Future."
        </footer>
      </div>

      {/* MOBILE BOTTOM NAVIGATION TABS (visible on small/medium screens ONLY) */}
      <nav className={`md:hidden fixed bottom-0 inset-x-0 z-40 border-t backdrop-blur-xl p-2.5 flex justify-around transition-all ${
        isDarkMode ? 'bg-slate-950/85 border-slate-900' : 'bg-white/85 border-slate-200 shadow-lg'
      }`}>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center p-2 rounded-lg text-[9px] font-bold ${
            activeTab === 'dashboard' ? 'text-indigo-400' : 'text-slate-400'
          }`}
        >
          <Compass className="w-4 h-4 mb-0.5" />
          Feed
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex flex-col items-center p-2 rounded-lg text-[9px] font-bold relative ${
            activeTab === 'saved' ? 'text-indigo-400' : 'text-slate-400'
          }`}
        >
          <Bookmark className="w-4 h-4 mb-0.5" />
          Saved ({savedItems.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center p-2 rounded-lg text-[9px] font-bold ${
            activeTab === 'analytics' ? 'text-indigo-400' : 'text-slate-400'
          }`}
        >
          <BarChart3 className="w-4 h-4 mb-0.5" />
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center p-2 rounded-lg text-[9px] font-bold ${
            activeTab === 'profile' ? 'text-indigo-400' : 'text-slate-400'
          }`}
        >
          <User className="w-4 h-4 mb-0.5" />
          Profile
        </button>
      </nav>
    </div>
  );
}

import React, { useState } from 'react';
import { User, ListFilter, Trash2, Check, Sparkles, Shield, Bookmark, CircleDot } from 'lucide-react';
import { UserPreferences } from '../types';
import { ALL_INTERESTS } from '../data/items';

interface ProfileViewProps {
  userPreferences: UserPreferences;
  isDarkMode: boolean;
  onResetDatabase: () => void;
  onSaveAndPersonalize: (selectedInterests: string[], name: string) => void;
}

export default function ProfileView({
  userPreferences,
  isDarkMode,
  onResetDatabase,
  onSaveAndPersonalize
}: ProfileViewProps) {
  // Localized states to edit provisional preferences before saving them with ONE tap
  const [profileName, setProfileName] = useState(userPreferences.name);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(userPreferences.selectedInterests);
  const [tagFilter, setTagFilter] = useState('');

  const handleToggleInterest = (interest: string) => {
    let updatedList = [...selectedInterests];
    if (updatedList.includes(interest)) {
      updatedList = updatedList.filter(item => item !== interest);
    } else {
      updatedList.push(interest);
    }
    setSelectedInterests(updatedList);
  };

  const handleSelectAll = () => {
    setSelectedInterests([...ALL_INTERESTS]);
  };

  const handleClearAll = () => {
    setSelectedInterests([]);
  };

  // Filter tag display lists dynamically as the user types
  const filteredInterests = ALL_INTERESTS.filter(interest => 
    interest.toLowerCase().includes(tagFilter.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Decorative Floating Title */}
      <div className="space-y-1 mb-2">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Personalization Matrix
        </h1>
        <p className="text-xs text-slate-400">
          Construct your technical nodes below. Click "Save & Personalize Experience" to activate your personalized SynapseSphere feed.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Personal credentials card */}
        <div className="lg:col-span-4 space-y-6">
          <div className={`p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
            isDarkMode 
              ? 'bg-white/5 border-white/10 shadow-2xl' 
              : 'bg-white border-slate-200 shadow-lg shadow-slate-200/50'
          }`}>
            <div className="flex flex-col items-center text-center pb-6 border-b border-dashed border-slate-800/10 dark:border-white/5">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 via-purple-600 to-fuchsia-600 flex items-center justify-center text-white text-3xl font-black mb-4 shadow-xl shadow-indigo-600/15 relative">
                <div className="absolute inset-0 rounded-full bg-indigo-500/10 animate-ping pointer-events-none" />
                {profileName ? profileName.slice(0, 2).toUpperCase() : 'ME'}
              </div>
              
              <div className="space-y-1">
                <h3 className={`font-bold text-lg leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {profileName || 'Anonymous Scholar'}
                </h3>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-indigo-400 tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/5 border border-indigo-500/10">
                  <Shield className="w-3 h-3 text-indigo-400" />
                  {profileName === 'Guest Explorer' ? 'Guest mode' : 'AI Identity Vector'}
                </span>
              </div>
            </div>

            {/* Input Form Fields (provisional state edits) */}
            <div className="space-y-4 pt-6">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest mb-1.5 text-slate-400">
                  Display Alias / Name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Set account name..."
                  className={`w-full px-4 py-3 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                    isDarkMode 
                      ? 'bg-black/35 border-white/10 text-white placeholder-slate-500 focus:bg-black/50' 
                      : 'bg-white border-slate-200 text-slate-900 focus:bg-slate-50'
                  }`}
                />
              </div>

              {/* Live Statistics widget inside the profile */}
              <div className="pt-4 space-y-3 border-t border-slate-800/10 dark:border-white/5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-450">Active Saved Bookmarks</span>
                  <span className={`font-mono font-bold ${isDarkMode ? 'text-indigo-400' : 'text-slate-900'}`}>
                    {userPreferences.savedItemIds.length} tracks
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-450">Selected Active Interests</span>
                  <span className={`font-mono font-bold ${isDarkMode ? 'text-indigo-400' : 'text-slate-900'}`}>
                    {selectedInterests.length} nodes
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Reset Utility */}
          <div className={`p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
            isDarkMode ? 'bg-white/5 border-white/10' : 'bg-rose-50/20 border-rose-100 shadow-sm'
          }`}>
            <h4 className="font-bold text-xs text-rose-450 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5" />
              Reset Core Engine
            </h4>
            <p className="text-xs text-slate-455 leading-relaxed mb-4">
              Clears saved bookmarks, view histories, and custom nodes back to fresh default states.
            </p>
            <button
              onClick={onResetDatabase}
              className="w-full py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/5 hover:bg-rose-600 hover:text-white hover:border-rose-600 text-rose-400 font-bold text-xs transition-all flex items-center justify-center gap-1.5 select-none active:scale-95"
            >
              Reset Session Workspace
            </button>
          </div>
        </div>

        {/* Right Column: Multi-select Interests */}
        <div className={`lg:col-span-8 p-6 rounded-2xl border backdrop-blur-xl flex flex-col justify-between transition-all duration-305 ${
          isDarkMode 
            ? 'bg-white/5 border-white/10 shadow-2xl shadow-black/20' 
            : 'bg-white border-slate-200 shadow-lg shadow-slate-200/50'
        }`}>
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className={`font-bold text-lg flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  <ListFilter className="w-5 h-5 text-indigo-400" />
                  Configure Interest Profile
                </h3>
                <p className="text-xs text-slate-450">Toggle multiple technical topics to feed matching and accuracy scoring vectors.</p>
              </div>

              {/* Utility actions inside interest picker */}
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAll}
                  className={`py-1.5 px-3 rounded-lg text-[10px] font-extrabold uppercase transition-all select-none whitespace-nowrap active:scale-95 ${
                    isDarkMode ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-705' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Select All
                </button>
                <button
                  onClick={handleClearAll}
                  className={`py-1.5 px-3 rounded-lg text-[10px] font-extrabold uppercase transition-all select-none whitespace-nowrap active:scale-95 ${
                    isDarkMode 
                      ? 'bg-slate-800/80 text-slate-400 hover:bg-rose-950/30 hover:text-rose-450' 
                      : 'bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600'
                  }`}
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Quick search interests filtering node */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Filter catalog categories..."
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-indigo-550/50 transition-all ${
                  isDarkMode 
                    ? 'bg-slate-950/60 border-slate-800 text-white placeholder-slate-500' 
                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            {/* Grid of Interests */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredInterests.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={`interest-${interest}`}
                    onClick={() => handleToggleInterest(interest)}
                    className={`p-3 rounded-xl border text-xs text-left font-bold transition-all duration-200 select-none flex items-center justify-between hover:-translate-y-0.5 ${
                      isSelected
                        ? 'bg-gradient-to-br from-indigo-500/15 via-purple-600/5 to-transparent border-indigo-500 text-indigo-400 shadow-md shadow-indigo-600/5'
                        : (isDarkMode ? 'bg-slate-950/30 border-slate-850 hover:bg-slate-900/60 text-slate-400' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600')
                    }`}
                  >
                    <span className="truncate pr-1">{interest}</span>
                    <div className={`w-4.5 h-4.5 rounded-md flex items-center justify-center transition-all border shrink-0 ${
                      isSelected 
                        ? 'bg-indigo-600 border-indigo-500 text-white' 
                        : (isDarkMode ? 'border-slate-850 bg-slate-955' : 'border-slate-350 bg-white')
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Informational Warning Callout */}
          <div className={`mt-8 p-4 rounded-xl border border-dashed flex items-center gap-3.5 ${
            isDarkMode ? 'bg-indigo-950/10 border-indigo-900/30' : 'bg-indigo-50/20 border-indigo-100'
          }`}>
            <Sparkles className="w-5 h-5 text-indigo-400 animate-spin-pulse shrink-0" />
            <p className="text-xs text-slate-400 leading-relaxed">
              Upon clicking the personalization button below, our client-side machine ranking layers immediately generate confidence vectors with zero latency.
            </p>
          </div>
        </div>

      </div>

      {/* FOOTER ACTION: THE ONLY PROMINENT SAVE BUTTON */}
      <div className="flex justify-center pt-8 border-t border-dashed border-slate-800/10 dark:border-white/5">
        <button
          onClick={() => onSaveAndPersonalize(selectedInterests, profileName)}
          disabled={selectedInterests.length === 0}
          className="w-full sm:w-auto py-4 px-12 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-fuchsia-600 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-sm shadow-xl shadow-indigo-500/25 hover:scale-101 active:scale-98 transition-all flex items-center justify-center gap-3 group select-none"
        >
          <Sparkles className="w-5 h-5 text-white stroke-[2.5px] group-hover:rotate-12 transition-transform duration-300" />
          Save & Personalize Experience
        </button>
      </div>

    </div>
  );
}

import React, { useState } from 'react';
import { Star, Clock, Bookmark, BookmarkCheck, Award, Sparkles, ChevronDown, ChevronUp, Check, ExternalLink } from 'lucide-react';
import { RecommendationResult } from '../types';

interface RecommendationCardProps {
  key?: string | number;
  item: RecommendationResult;
  isSaved: boolean;
  isDarkMode: boolean;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onViewDetails: (id: string) => void;
  onEnroll?: (item: RecommendationResult) => void;
  userInterests: string[];
  isEnrolled?: boolean;
}

export default function RecommendationCard({
  item,
  isSaved,
  isDarkMode,
  onToggleSave,
  onViewDetails,
  onEnroll,
  userInterests,
  isEnrolled
}: RecommendationCardProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  // Sync state with incoming prop
  React.useEffect(() => {
    if (isEnrolled !== undefined) {
      setEnrolled(isEnrolled);
    }
  }, [isEnrolled]);

  // Identify which tags overlap with user interests
  const matchingTags = item.tags.filter(tag => userInterests.includes(tag));
  const otherTags = item.tags.filter(tag => !userInterests.includes(tag));

  const handleEnroll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEnrolled(true);
    onViewDetails(item.id);
    if (onEnroll) {
      onEnroll(item);
    }
  };

  // Assign match color weights for progress and text styling
  let matchColorClass = 'text-indigo-400 bg-indigo-550/10 border-indigo-500/25';
  let matchBarColor = 'bg-gradient-to-r from-indigo-500 to-purple-500';
  if (item.matchPercentage < 55) {
    matchColorClass = 'text-slate-400 bg-slate-400/10 border-slate-500/10';
    matchBarColor = 'bg-slate-400';
  } else if (item.matchPercentage < 78) {
    matchColorClass = 'text-purple-400 bg-purple-550/10 border-purple-500/20';
    matchBarColor = 'bg-gradient-to-r from-purple-500 to-fuchsia-500';
  }

  // SVG Circular Gauge configurations
  const radius = 13;
  const strokeWidth = 2.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (item.matchPercentage / 100) * circumference;

  return (
    <div 
      className={`group relative rounded-2xl border backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl flex flex-col justify-between overflow-hidden ${
        isDarkMode 
          ? 'bg-white/[0.04] border-white/5 hover:bg-white/[0.08] shadow-black/30' 
          : 'bg-white/90 border-slate-200/80 hover:border-slate-350 shadow-slate-150/40'
      }`}
      style={{ contentVisibility: 'auto' }}
    >
      <div>
        {/* Banner with gradient & visual thumbnail */}
        <div className={`h-24 bg-gradient-to-br ${item.gradient || 'from-indigo-600 to-indigo-900'} p-4 flex flex-col justify-between relative overflow-hidden`}>
          {/* Subtle line grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:10px_10px]" />
          <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-white/15 blur-xl pointer-events-none" />
          
          <div className="flex justify-between items-start z-10">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/90 bg-black/35 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
              {item.category}
            </span>

            {/* Quick Bookmark action */}
            <button
              onClick={(e) => onToggleSave(item.id, e)}
              className="p-1.5 rounded-lg bg-black/35 hover:bg-black/55 text-white backdrop-blur-md transition-all active:scale-90"
              title={isSaved ? "Remove from bookmarks" : "Add to bookmarks"}
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4 text-pink-500 fill-pink-500" />
              ) : (
                <Bookmark className="w-4 h-4 text-white" />
              )}
            </button>
          </div>

          {/* Social proof indicators */}
          <div className="flex items-center gap-1.5 z-10">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-white leading-none">
              {item.rating.toFixed(1)}
            </span>
            <span className="text-[9px] text-white/75 leading-none">
              ({item.enrolledCount.toLocaleString()} tracked)
            </span>
          </div>
        </div>

        {/* Content body */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-black ${
              item.difficulty === 'Beginner' ? 'text-emerald-500' :
              item.difficulty === 'Intermediate' ? 'text-amber-500' : 'text-rose-500'
            }`}>
              <Award className="w-3.5 h-3.5" />
              {item.difficulty}
            </span>
            <div className={`flex items-center text-[10px] font-bold select-none uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
              {item.duration}
            </div>
          </div>

          <h3 className={`text-base font-extrabold leading-tight line-clamp-2 mb-2 transition-colors ${
            isDarkMode ? 'text-white group-hover:text-indigo-400' : 'text-slate-900 group-hover:text-indigo-600'
          }`}>
            {item.title}
          </h3>

          <p className={`text-xs line-clamp-2 mb-4 select-text leading-relaxed ${
            isDarkMode ? 'text-slate-450' : 'text-slate-600'
          }`}>
            {item.description}
          </p>

          {/* Dynamic Match progress card container */}
          <div className={`p-3 rounded-xl border border-dashed transition-all duration-200 mb-4 ${
            isDarkMode ? 'bg-black/25 border-slate-850' : 'bg-slate-50/50 border-slate-200'
          }`}>
            <div className="flex justify-between items-center mb-2">
              <span className={`text-[10px] uppercase tracking-widest font-extrabold flex items-center gap-1.5 ${
                isSaved ? 'text-slate-400' : 'text-indigo-400'
              }`}>
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin-pulse" />
                Synapse Match Logic
              </span>

              {/* Animated SVGCircular progress indicator */}
              <div className="relative flex items-center justify-center w-7 h-7 shrink-0 selector-matching-radial">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="14"
                    cy="14"
                    r={radius}
                    className={`${isDarkMode ? 'stroke-slate-900' : 'stroke-slate-200'} fill-none`}
                    strokeWidth={strokeWidth}
                  />
                  <circle
                    cx="14"
                    cy="14"
                    r={radius}
                    className={`stroke-indigo-550 fill-none transition-all duration-1000 ease-out`}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-[8px] font-black font-sans text-indigo-400">
                  {item.matchPercentage}
                </span>
              </div>
            </div>
            
            {/* Horizontal progress representation */}
            <div className={`w-full h-1 rounded-full overflow-hidden relative ${
              isDarkMode ? 'bg-slate-900' : 'bg-slate-200'
            }`}>
              <div 
                className={`h-full rounded-full transition-all duration-700 ease-out ${matchBarColor}`}
                style={{ width: `${item.matchPercentage}%` }}
              />
            </div>
          </div>

          {/* Matching Interest nodes tags */}
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {matchingTags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-extrabold px-2 py-0.5 rounded-md border bg-indigo-500/10 text-indigo-400 border-indigo-500/20 flex items-center gap-1"
                title="Matches your profile interests"
              >
                <Check className="w-2.5 h-2.5 text-indigo-400 stroke-[3.5px]" />
                {tag}
              </span>
            ))}
            {otherTags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                  isDarkMode 
                    ? 'bg-slate-900/40 text-slate-500 border-slate-850' 
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              >
                {tag}
              </span>
            ))}
            {otherTags.length > 2 && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${
                isDarkMode ? 'text-slate-600 bg-slate-900/20' : 'text-slate-450 bg-slate-50'
              }`}>
                +{otherTags.length - 2}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer triggers */}
      <div className={`px-5 pb-5 pt-0 border-t ${
        isDarkMode ? 'border-slate-900/50' : 'border-slate-100'
      }`}>
        <div className="flex items-center justify-between gap-2.5 pt-4">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className={`text-xs font-bold select-none flex items-center gap-1 transition-all py-2 px-3 rounded-xl border ${
              isDarkMode 
                ? 'text-slate-400 border-slate-850 hover:text-slate-200 hover:bg-slate-900/50' 
                : 'text-slate-600 border-slate-200 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            Explain
            {showExplanation ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          <button
            onClick={handleEnroll}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-1 active:scale-98 select-none ${
              enrolled
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-indigo-600 hover:bg-indigo-550 text-white shadow-lg shadow-indigo-650/10'
            }`}
          >
            {enrolled ? (
              <>
                <Check className="w-3.5 h-3.5 text-white stroke-[2.5px]" />
                Enrolled
              </>
            ) : (
              <>
                Enroll Course
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </>
            )}
          </button>
        </div>

        {/* COMPREHENSIVE AI REVEAL DRAWER SECTION */}
        {showExplanation && (
          <div className={`mt-3 p-3.5 rounded-xl border text-xs leading-relaxed animate-fadeIn space-y-2.5 ${
            isDarkMode 
              ? 'bg-[#030712]/70 text-slate-300 border-slate-850' 
              : 'bg-slate-50 text-slate-700 border-slate-200'
          }`}>
            <p className="font-extrabold text-indigo-400 uppercase tracking-widest text-[9px] flex items-center gap-1 leading-none">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Synapse Recommendation Report
            </p>
            
            <p className="italic text-slate-300 dark:text-slate-400 leading-relaxed font-sans border-b border-dashed border-slate-850 pb-2.5">
              "{item.explanation}"
            </p>

            <div className="grid grid-cols-2 gap-2 text-[10px] bg-[#020617]/40 p-2 rounded-lg border border-slate-900/10 dark:border-white/5 font-mono">
              <div>
                <span className="text-slate-500 text-[9px] uppercase tracking-wider block">Index Accuracy</span>
                <span className="font-bold text-slate-300">{item.matchPercentage}% Score</span>
              </div>
              <div>
                <span className="text-slate-500 text-[9px] uppercase tracking-wider block">Rating Vector</span>
                <span className="font-bold text-slate-300">{item.rating} ★ Rated</span>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-900">
                <span className="text-slate-500 text-[9px] uppercase tracking-wider block">Matching Topic Nodes</span>
                <span className="font-bold text-indigo-400 truncate block">
                  {matchingTags.length > 0 ? matchingTags.join(', ') : 'Category alignment focus'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { BarChart3, PieChart, TrendingUp, Sparkles, Award, Star, ListCheck, BookOpen } from 'lucide-react';
import { RecommendationResult, RecommendationItem } from '../types';

interface AnalyticsViewProps {
  recommendedItems: RecommendationResult[];
  savedItems: RecommendationItem[];
  userInterests: string[];
  isDarkMode: boolean;
}

export default function AnalyticsView({
  recommendedItems,
  savedItems,
  userInterests,
  isDarkMode
}: AnalyticsViewProps) {
  // 1. Calculations
  const totalProcessed = recommendedItems.length;
  const userInterestCount = userInterests.length;

  // Calculate standard metrics
  const highMatchCount = recommendedItems.filter(item => item.matchPercentage >= 75).length;
  const midMatchCount = recommendedItems.filter(item => item.matchPercentage >= 40 && item.matchPercentage < 75).length;
  const lowMatchCount = recommendedItems.filter(item => item.matchPercentage < 40).length;

  // Most Selected Category from Recommended
  const categoryCounts: { [key: string]: number } = {};
  recommendedItems.forEach(item => {
    if (categoryCounts[item.category]) {
      categoryCounts[item.category]++;
    } else {
      categoryCounts[item.category] = 1;
    }
  });

  let topCategory = 'N/A';
  let topCategoryCount = 0;
  Object.entries(categoryCounts).forEach(([cat, val]) => {
    if (val > topCategoryCount) {
      topCategory = cat;
      topCategoryCount = val;
    }
  });

  // Calculate dynamic interest alignments
  const topMatchedInterests = userInterests.map(interest => {
    // Count how many total items in RECOMMENDATION_DATA have this interest as a tag
    const itemsCount = recommendedItems.filter(item => item.tags.includes(interest)).length;
    return {
      interest,
      count: itemsCount,
      percentage: Math.min(100, Math.round((itemsCount / Math.max(1, totalProcessed)) * 100))
    };
  }).sort((a, b) => b.count - a.count);

  // Maximum count for normalizing chart bars
  const maxInterestCount = Math.max(...topMatchedInterests.map(i => i.count), 1);

  return (
    <div className="space-y-8">
      {/* Dynamic Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className={`p-6 rounded-2xl border backdrop-blur-xl flex items-center gap-4 transition-all duration-300 ${
          isDarkMode ? 'bg-white/5 border-white/10 shadow-2xl' : 'bg-white/80 border-slate-200 shadow-slate-100 shadow-lg'
        }`}>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Processed Feed</p>
            <h4 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{totalProcessed}</h4>
            <p className="text-[10px] text-slate-400 leading-none mt-1">Total items analyzed</p>
          </div>
        </div>

        <div className={`p-6 rounded-2xl border backdrop-blur-xl flex items-center gap-4 transition-all duration-300 ${
          isDarkMode ? 'bg-white/5 border-white/10 shadow-2xl' : 'bg-white/80 border-slate-200 shadow-slate-100 shadow-lg'
        }`}>
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
            <ListCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Selected Profile</p>
            <h4 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{userInterestCount}/20</h4>
            <p className="text-[10px] text-slate-400 leading-none mt-1">Interest tags toggled</p>
          </div>
        </div>

        <div className={`p-6 rounded-2xl border backdrop-blur-xl flex items-center gap-4 transition-all duration-300 ${
          isDarkMode ? 'bg-white/5 border-white/10 shadow-2xl' : 'bg-white/80 border-slate-200 shadow-slate-100 shadow-lg'
        }`}>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Saved Bookmarks</p>
            <h4 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{savedItems.length}</h4>
            <p className="text-[10px] text-slate-400 leading-none mt-1">Curated item catalog</p>
          </div>
        </div>

        <div className={`p-6 rounded-2xl border backdrop-blur-xl flex items-center gap-4 transition-all duration-300 ${
          isDarkMode ? 'bg-white/5 border-white/10 shadow-2xl' : 'bg-white/80 border-slate-200 shadow-slate-100 shadow-lg'
        }`}>
          <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Most Matched</p>
            <h4 className={`text-lg font-extrabold truncate max-w-[150px] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{topCategory}</h4>
            <p className="text-[10px] text-slate-400 leading-none mt-1">{topCategoryCount} items in database</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Similarity Score Distribution Chart */}
        <div className={`lg:col-span-7 p-6 rounded-2xl border backdrop-blur-xl flex flex-col justify-between transition-all duration-300 ${
          isDarkMode ? 'bg-white/5 border-white/10 shadow-2xl' : 'bg-white/80 border-slate-200 shadow-slate-100 shadow-lg'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Similarity Distribution</h3>
            </div>
            <p className="text-xs text-slate-400 mb-6">Proportion of matching items sorted by algorithm accuracy scores</p>
          </div>

          <div className="grid grid-cols-3 gap-4 items-end h-64 pt-6 pb-2 relative">
            {/* Grid Line Markers */}
            <div className="absolute inset-x-0 top-0 border-t border-dashed border-slate-800/10" />
            <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-slate-800/10" />
            <div className="absolute inset-x-0 bottom-0 border-t border-dashed border-slate-800/20" />

            {/* High Matches */}
            <div className="flex flex-col items-center group h-full justify-end z-10">
              <div className="w-full max-w-[80px] bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-xl transition-all duration-500 origin-bottom hover:scale-x-105"
                   style={{ height: `${totalProcessed > 0 ? (highMatchCount / totalProcessed) * 100 : 0}%` }}>
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-slate-800 text-white py-1 px-1.5 rounded-lg whitespace-nowrap transition-all pointer-events-none">
                  {highMatchCount} items
                </div>
              </div>
              <p className={`text-xs font-bold mt-3 text-center ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Perfect Fit (75%+)</p>
              <p className="text-[10px] text-slate-400">{Math.round((highMatchCount / Math.max(1, totalProcessed)) * 100)}%</p>
            </div>

            {/* Medium Matches */}
            <div className="flex flex-col items-center group h-full justify-end z-10">
              <div className="w-full max-w-[80px] bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-xl transition-all duration-500 origin-bottom hover:scale-x-105 animate-grow"
                   style={{ height: `${totalProcessed > 0 ? (midMatchCount / totalProcessed) * 100 : 10}%` }}>
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-slate-800 text-white py-1 px-1.5 rounded-lg whitespace-nowrap transition-all pointer-events-none">
                  {midMatchCount} items
                </div>
              </div>
              <p className={`text-xs font-bold mt-3 text-center ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Partial Fit (40-74%)</p>
              <p className="text-[10px] text-slate-400">{Math.round((midMatchCount / Math.max(1, totalProcessed)) * 100)}%</p>
            </div>

            {/* Low Matches */}
            <div className="flex flex-col items-center group h-full justify-end z-10">
              <div className="w-full max-w-[80px] bg-gradient-to-t from-slate-600 to-slate-400 rounded-t-xl transition-all duration-500 origin-bottom hover:scale-x-105"
                   style={{ height: `${totalProcessed > 0 ? (lowMatchCount / totalProcessed) * 100 : 0}%` }}>
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-slate-800 text-white py-1 px-1.5 rounded-lg whitespace-nowrap transition-all pointer-events-none">
                  {lowMatchCount} items
                </div>
              </div>
              <p className={`text-xs font-bold mt-3 text-center ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Broad Scope (&lt;40%)</p>
              <p className="text-[10px] text-slate-400">{Math.round((lowMatchCount / Math.max(1, totalProcessed)) * 100)}%</p>
            </div>
          </div>
        </div>

        {/* Selected Interests Breakdown */}
        <div className={`lg:col-span-5 p-6 rounded-2xl border backdrop-blur-xl flex flex-col justify-between transition-all duration-305 ${
          isDarkMode ? 'bg-white/5 border-white/10 shadow-2xl' : 'bg-white/80 border-slate-200 shadow-slate-100 shadow-lg'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PieChart className="w-5 h-5 text-indigo-400" />
              <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>My Top Interest Maps</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">Alignment of your selected preferences against our item tags</p>
          </div>

          <div className="space-y-4 max-h-[260px] overflow-y-auto pr-1">
            {userInterestCount === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Choose some interests in your Profile to visualize custom tag coverage charts!
              </div>
            ) : (
              topMatchedInterests.slice(0, 5).map((interestData) => (
                <div key={interestData.interest} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className={`font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>{interestData.interest}</span>
                    <span className="text-slate-400 font-medium">{interestData.count} matches ({interestData.percentage}%)</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <div 
                      className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                      style={{ width: `${(interestData.count / maxInterestCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

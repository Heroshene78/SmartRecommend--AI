import React, { useState, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal, RefreshCw, Compass, ArrowRight, Star, Sparkles, TrendingUp, HelpCircle, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { RecommendationItem, RecommendationResult, UserPreferences } from '../types';
import RecommendationCard from './RecommendationCard';

interface DashboardViewProps {
  items: RecommendationItem[];
  userPreferences: UserPreferences;
  isDarkMode: boolean;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onViewItem: (id: string) => void;
  recentlyViewedItems: RecommendationItem[];
}

export default function DashboardView({
  items,
  userPreferences,
  isDarkMode,
  onToggleSave,
  onViewItem,
  recentlyViewedItems
}: DashboardViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState<'match' | 'rating' | 'popularity'>('match');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // E-commerce dynamic discovery and similar recommendations state
  const [enrolledItem, setEnrolledItem] = useState<RecommendationResult | null>(null);
  const similarSectionRef = React.useRef<HTMLDivElement>(null);
  const carouselRef = React.useRef<HTMLDivElement>(null);

  // Scroll carousel helper
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.7 
        : scrollLeft + clientWidth * 0.7;
      carouselRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  // Recalculate dynamic similar recommendations based on category and target topics
  const similarRecommendations = useMemo(() => {
    if (!enrolledItem) return [];

    return items
      .filter(item => item.id !== enrolledItem.id) // Exclude enrolled itself
      .map(item => {
        let score = 0;

        // 1. Same Category Boost
        if (item.category === enrolledItem.category) {
          score += 50;
        }

        // 2. Direct Tag Overlap
        const overlapTags = item.tags.filter(t => enrolledItem.tags.includes(t));
        score += overlapTags.length * 25;

        // 3. User requested cases / Keyword Overlaps
        const isEnrolledPython = enrolledItem.title.toLowerCase().includes("python") || enrolledItem.tags.some(t => t.toLowerCase() === "python");
        const isCandidatePython = item.title.toLowerCase().includes("python") || item.tags.some(t => t.toLowerCase() === "python");

        const isEnrolledAI = enrolledItem.tags.some(t => ["Artificial Intelligence", "Machine Learning", "Data Science", "Robotics"].includes(t)) || 
                             /ai|artificial|neural|deep learning|llm|generative|machine learning|nlp|data science|transformers/i.test(enrolledItem.title);
        const isCandidateAI = item.tags.some(t => ["Artificial Intelligence", "Machine Learning", "Data Science", "Robotics"].includes(t)) || 
                              /ai|artificial|neural|deep learning|llm|generative|machine learning|nlp|data science|transformers/i.test(item.title);

        const isEnrolledWeb = enrolledItem.tags.some(t => ["Web Development", "UI/UX"].includes(t)) || 
                              /web|html|css|javascript|react|next|fullstack|design systems|accessibility/i.test(enrolledItem.title);
        const isCandidateWeb = item.tags.some(t => ["Web Development", "UI/UX"].includes(t)) || 
                               /web|html|css|javascript|react|next|fullstack|design systems|accessibility/i.test(item.title);

        if (isEnrolledPython && isCandidatePython) {
          score += 65;
        }
        if (isEnrolledAI && isCandidateAI) {
          score += 65;
        }
        if (isEnrolledWeb && isCandidateWeb) {
          score += 65;
        }

        // Title Tokens Overlap
        const enrolledTokens = enrolledItem.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        enrolledTokens.forEach(token => {
          if (item.title.toLowerCase().includes(token)) {
            score += 15;
          }
        });

        // Map to a nice e-commerce-style match percentage
        const basePercent = 55 + Math.min(38, score * 0.4);
        const pseudoRandomOffset = (parseInt(item.id) % 5) - 2;
        const matchPercentage = Math.min(99, Math.round(basePercent + pseudoRandomOffset));

        return {
          ...item,
          matchPercentage,
          explanation: `Strong similarity connection with your enrolled item "${enrolledItem.title}" in the "${enrolledItem.category}" scope.`
        } as RecommendationResult;
      })
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 10); // Show top 10 matches
  }, [enrolledItem, items]);

  const handleCourseEnroll = (enrolledCourse: RecommendationResult) => {
    setEnrolledItem(enrolledCourse);
    onViewItem(enrolledCourse.id);

    // Scroll to the Similar Recommendations section smoothly
    setTimeout(() => {
      similarSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  };

  const handleEnrollSimilar = (similarItem: RecommendationResult) => {
    onViewItem(similarItem.id);
    setEnrolledItem(similarItem);

    // Dynamic recursive carousel refocus
    setTimeout(() => {
      similarSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (carouselRef.current) {
        carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      }
    }, 150);
  };

  // List of unique categories for our dropdown filter
  const categories = useMemo(() => {
    const list = new Set(items.map(item => item.category));
    return ['All', ...Array.from(list)];
  }, [items]);

  // Core Recommendation Scoring logic (Deterministic Overlap matching)
  const processedRecommendations = useMemo(() => {
    // Avoid duplicates using a state Map targeting unique IDs
    const seenIds = new Set<string>();
    const uniqueItems = items.filter(item => {
      if (seenIds.has(item.id)) return false;
      seenIds.add(item.id);
      return true;
    });

    return uniqueItems.map(item => {
      const userInterests = userPreferences.selectedInterests;
      
      // Calculate matches
      const matchingTags = item.tags.filter(tag => userInterests.includes(tag));
      const score = matchingTags.length;

      // Calculate confidence percentage
      let matchPercentage = 0;
      let explanation = '';

      if (userInterests.length === 0) {
        // Fallback for empty preference profiles: well-distributed baseline rating-driven predictions
        const val = 60 + (parseInt(item.id) % 4) * 6 + (item.rating > 4.7 ? 8 : 2);
        matchPercentage = Math.min(95, val);
        explanation = "General technical course recommended for broad skill expansion.";
      } else if (score === 0) {
        // Base match score for zero topic direct overlaps: distribute nicely in a lower band
        const val = 45 + (parseInt(item.id) % 3) * 7 + (item.rating > 4.7 ? 5 : 0);
        matchPercentage = val;
        explanation = `Suggested as a broad category fit in ${item.category} to expand your horizons.`;
      } else {
        // Advanced weighted matching metric
        const overlapFactor = score / item.tags.length;
        const preferenceCoverage = score / userInterests.length;
        const alignment = (overlapFactor + preferenceCoverage) / 2;
        
        let targetScore = 61;
        if (score === userInterests.length && score === item.tags.length) {
          targetScore = 98; // Perfect matching node
        } else if (alignment >= 0.8) {
          targetScore = 98;
        } else if (alignment >= 0.6) {
          targetScore = 93;
        } else if (alignment >= 0.45) {
          targetScore = 88;
        } else if (alignment >= 0.3) {
          targetScore = 82;
        } else if (alignment >= 0.2) {
          targetScore = 76;
        } else if (alignment >= 0.1) {
          targetScore = 69;
        } else {
          targetScore = 61;
        }

        // Add slight pseudo-random variation based on item.id so it doesn't change on render but is well-distributed
        const pseudoRandomOffset = (parseInt(item.id) % 5) - 2; // -2 to +2
        matchPercentage = Math.min(99, Math.max(50, targetScore + pseudoRandomOffset));

        // Explanations
        const matchedNames = matchingTags.slice(0, 3).join(', ');
        const additionalCount = matchingTags.length > 3 ? ` and ${matchingTags.length - 3} more` : '';
        explanation = `Recommended because you selected ${matchedNames}${additionalCount} in your preference node, representing a high similarity matrix alignment.`;
      }

      return {
        ...item,
        score,
        matchPercentage,
        explanation
      } as RecommendationResult;
    });
  }, [items, userPreferences.selectedInterests]);

  // Filter and Sort Recommendations
  const filteredAndSortedItems = useMemo(() => {
    let result = [...processedRecommendations];

    // Search Query (title or description or tags)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(item => 
        item.title.toLowerCase().includes(q) || 
        item.description.toLowerCase().includes(q) ||
        item.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Category Filter
    if (selectedCategory !== 'All') {
      result = result.filter(item => item.category === selectedCategory);
    }

    // Difficulty Filter
    if (selectedDifficulty !== 'All') {
      result = result.filter(item => item.difficulty === selectedDifficulty);
    }

    // Rating Filter
    if (minRating > 0) {
      result = result.filter(item => item.rating >= minRating);
    }

    // Sort options
    result.sort((a, b) => {
      if (sortBy === 'match') {
        // Sort matching score first, then popularity
        if (b.matchPercentage !== a.matchPercentage) {
          return b.matchPercentage - a.matchPercentage;
        }
        return b.enrolledCount - a.enrolledCount;
      } else if (sortBy === 'rating') {
        return b.rating - a.rating;
      } else {
        return b.enrolledCount - a.enrolledCount;
      }
    });

    // Enforce category diversity: prevent showing more than 3 consecutive items of the same category if possible
    // Only apply if we have a lot of items and no category filter selected
    if (selectedCategory === 'All' && sortBy === 'match' && result.length > 5) {
      const diversified: typeof result = [];
      const catCount: Record<string, number> = {};
      const remaining: typeof result = [];

      for (const rx of result) {
        const count = catCount[rx.category] || 0;
        if (count < 2) {
          diversified.push(rx);
          catCount[rx.category] = count + 1;
        } else {
          remaining.push(rx);
        }
      }
      result = [...diversified, ...remaining];
    }

    return result;
  }, [processedRecommendations, searchQuery, selectedCategory, selectedDifficulty, minRating, sortBy]);

  const handleRefreshFeed = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  // Trending Interest tags to quickly inject search filters
  const trendingTags = ['Artificial Intelligence', 'Python', 'Web Development', 'UI/UX', 'Cloud Computing'];

  return (
    <div className="space-y-8">
      {/* Dynamic Welcome & Recommendation Summary Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl relative overflow-hidden backdrop-blur-xl border ${
        isDarkMode 
          ? 'bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border-white/10 shadow-2xl' 
          : 'bg-gradient-to-r from-indigo-500/15 via-fuchsia-500/5 to-slate-500/5 border-indigo-550/10 shadow-lg shadow-indigo-100/30'
      }`}>
        <div className="absolute -top-12 -right-12 w-96 h-96 bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-purple-600/15 blur-[80px] rounded-full pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Recommended For You, <span className="bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">{userPreferences.name}</span>!
              </h2>
              <p className={`text-sm mt-1 max-w-xl leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {userPreferences.selectedInterests.length > 0 
                  ? `Based on your selection of ${userPreferences.selectedInterests.length} preferred tracks, our score engine matched items using keyword overlaps and difficulty metrics.`
                  : "Pick some interest topics inside the Profile screen to supercharge compatibility calculations!"
                }
              </p>
            </div>
            <button
              onClick={handleRefreshFeed}
              disabled={isRefreshing}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 select-none active:scale-95 ${
                isDarkMode 
                  ? 'bg-slate-800/80 hover:bg-slate-700/80 text-white border-slate-700' 
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-sm'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Recalculate Scores
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-700/10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
              Quick Topics:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {trendingTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all border ${
                    searchQuery === tag
                      ? 'bg-indigo-500 text-white border-indigo-500'
                      : (isDarkMode ? 'bg-slate-800/40 border-slate-850 hover:bg-slate-800 text-slate-300' : 'bg-slate-100 hover:bg-slate-150 border-slate-200 text-slate-650')
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SIMILAR RECOMMENDATIONS (DYNAMIC CAROUSEL IF ENROLLED CELL EXISTS) */}
      {enrolledItem && (
        <div 
          ref={similarSectionRef}
          className={`p-6 rounded-3xl relative overflow-hidden backdrop-blur-xl border transition-all duration-300 animate-slideDown ${
            isDarkMode 
              ? 'bg-gradient-to-r from-emerald-950/20 via-slate-900/40 to-indigo-950/20 border-emerald-500/20' 
              : 'bg-gradient-to-r from-emerald-500/5 via-white to-slate-200/20 border-emerald-550/15 shadow-md shadow-emerald-100/20'
          }`}
        >
          {/* Subtle backgrounds */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 blur-[90px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                  <Sparkles className="w-5 h-5 text-emerald-400 animate-spin-pulse animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight flex items-center gap-2 flex-wrap">
                    <span>Similar Recommendations</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isDarkMode ? 'bg-emerald-500/10 text-emerald-450' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      Because you enrolled in "{enrolledItem.title}"
                    </span>
                  </h3>
                  <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-550'}`}>
                    Discover more topics in the <span className="font-extrabold text-indigo-400">{enrolledItem.category}</span> track. Ranked by correlation score.
                  </p>
                </div>
              </div>

              {/* Slider Arrow Controls */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => scrollCarousel('left')}
                  className={`p-2 rounded-xl border transition-all ${
                    isDarkMode ? 'bg-slate-900/60 border-slate-800 text-white hover:bg-slate-800' : 'bg-white border-slate-205 text-slate-700 hover:bg-slate-50'
                  }`}
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollCarousel('right')}
                  className={`p-2 rounded-xl border transition-all ${
                    isDarkMode ? 'bg-slate-900/60 border-slate-800 text-white hover:bg-slate-800' : 'bg-white border-slate-205 text-slate-700 hover:bg-slate-50'
                  }`}
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEnrolledItem(null)}
                  className={`text-[10px] font-bold px-3 py-2 rounded-xl border transition-all ${
                    isDarkMode ? 'bg-slate-900/30 border-slate-850 text-slate-500 hover:text-slate-350' : 'bg-slate-50 border-slate-205 text-slate-500 hover:text-slate-700'
                  }`}
                  title="Clear recommendation container"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Horizontal Track Slider */}
            <div 
              ref={carouselRef}
              className="flex gap-5 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory relative scroll-smooth focus:outline-none"
            >
              {similarRecommendations.map((simItem) => {
                const simEnrolled = userPreferences.viewedItemIds.includes(simItem.id);
                let dynamicIcon = <Compass className="w-5 h-5 text-white" />;
                if (simItem.category.includes("AI") || simItem.category.includes("Data")) {
                  dynamicIcon = <Sparkles className="w-5 h-5 text-white" />;
                } else if (simItem.category.includes("Web") || simItem.category.includes("Software")) {
                  dynamicIcon = <Compass className="w-5 h-5 text-white" />;
                }
                
                return (
                  <div 
                    key={`similar-deck-${simItem.id}`}
                    className={`w-[290px] sm:w-[325px] shrink-0 snap-start rounded-2xl border backdrop-blur-md transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                      isDarkMode 
                        ? 'bg-slate-950/45 border-white/5 hover:border-emerald-500/20 hover:bg-slate-900/50' 
                        : 'bg-white border-slate-200/80 hover:border-emerald-555 shadow-sm'
                    }`}
                  >
                    <div>
                      {/* Course Image alternative block using stylized category gradient & line layout */}
                      <div className={`h-28 bg-gradient-to-br ${simItem.gradient || 'from-indigo-650 to-indigo-900'} p-3.5 relative overflow-hidden flex flex-col justify-between`}>
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-black/25 opacity-70" />
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:10px_10px]" />
                        
                        <div className="absolute right-2.5 top-2.5 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/45 backdrop-blur-md border border-white/10 text-[9px] font-black text-emerald-400">
                          {simItem.matchPercentage}% MATCH
                        </div>

                        {/* Visual Image/Illustration Accent */}
                        <div className="absolute -bottom-2 -right-2 w-14 h-14 rounded-full bg-white/15 blur-sm pointer-events-none flex items-center justify-center">
                          {dynamicIcon}
                        </div>
                        
                        <div className="z-10 flex items-center gap-1 border border-white/10 bg-black/35 backdrop-blur-md px-2 py-0.5 rounded text-[9.5px] font-black text-white uppercase tracking-wider w-max">
                          {simItem.difficulty}
                        </div>

                        <div className="z-10 flex items-center gap-1.5 text-[10px] text-white">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="font-extrabold">{simItem.rating.toFixed(1)}</span>
                          <span className="text-[9px] text-white/70">({simItem.enrolledCount.toLocaleString()} built)</span>
                        </div>
                      </div>

                      {/* Info Panel content */}
                      <div className="p-4 space-y-2">
                        <h4 className={`text-sm font-extrabold leading-tight truncate ${
                          isDarkMode ? 'text-white' : 'text-slate-900'
                        }`} title={simItem.title}>
                          {simItem.title}
                        </h4>
                        
                        <p className={`text-[11px] line-clamp-2 leading-relaxed ${
                          isDarkMode ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          {simItem.description}
                        </p>

                        {/* Match Progress Gauge representation */}
                        <div className="pt-1.5 space-y-1">
                          <div className="flex justify-between items-center text-[9px] font-mono leading-none">
                            <span className="text-slate-400 uppercase tracking-wider">Correlation Score</span>
                            <span className="text-emerald-400 font-extrabold">{simItem.matchPercentage}%</span>
                          </div>
                          <div className={`w-full h-1 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-900' : 'bg-slate-150'}`}>
                            <div 
                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500" 
                              style={{ width: `${simItem.matchPercentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions bar inside similar recomendation card */}
                    <div className={`p-4 pt-2.5 border-t ${isDarkMode ? 'border-white/5 bg-black/10' : 'border-slate-100 bg-slate-50/40'} flex items-center justify-between gap-2`}>
                      <span className={`text-[10px] font-sans ${isDarkMode ? 'text-slate-500' : 'text-slate-450'}`}>
                        {simItem.duration} duration
                      </span>

                      <button
                        onClick={() => handleEnrollSimilar(simItem)}
                        className={`py-1.5 px-3 rounded-lg text-[10px] font-extrabold tracking-wide transition-all uppercase flex items-center gap-1 active:scale-95 ${
                          simEnrolled
                            ? 'bg-emerald-600 text-white cursor-default'
                            : 'bg-indigo-600 hover:bg-indigo-550 text-white shadow-md'
                        }`}
                        disabled={simEnrolled}
                      >
                        {simEnrolled ? (
                          <>
                            <Check className="w-3 h-3 text-white stroke-[3px]" />
                            Enrolled
                          </>
                        ) : (
                          <>
                            Enroll Course
                            <ArrowRight className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* RECENTLY VIEWED ROW */}
      {recentlyViewedItems.length > 0 && (
        <div className="space-y-3">
          <h3 className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Recently Enrolled / Opened
          </h3>
          <div className="flex items-center gap-4 overflow-x-auto pb-3 scrollbar-thin">
            {recentlyViewedItems.slice(0, 6).map((item) => (
              <div 
                key={`recent-${item.id}`}
                onClick={() => onViewItem(item.id)}
                className={`py-3 px-4 rounded-xl border flex items-center gap-3 cursor-pointer hover:border-indigo-550/40 transition-all duration-200 min-w-[240px] max-w-[280px] shrink-0 ${
                  isDarkMode ? 'bg-slate-900/50 border-slate-800 hover:bg-slate-900' : 'bg-white border-slate-200 hover:bg-slate-50 shadow-sm'
                }`}
              >
                <div className={`w-2.5 h-10 rounded bg-gradient-to-b ${item.gradient}`} />
                <div className="overflow-hidden">
                  <h4 className={`text-xs font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</h4>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{item.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FILTER PANEL */}
      <div className={`p-5 rounded-2xl border backdrop-blur-xl ${
        isDarkMode ? 'bg-white/5 border-white/10 shadow-2xl' : 'bg-white/80 border-slate-200 shadow-sm'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Search bar */}
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, topic, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                isDarkMode 
                  ? 'bg-black/35 border-white/10 text-white placeholder-slate-500' 
                  : 'bg-white border-slate-200 text-slate-900 shadow-inner'
              }`}
            />
          </div>

          {/* Category drop down */}
          <div className="md:col-span-2 relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer ${
                isDarkMode ? 'bg-black/35 border-white/10 text-white [&>option]:bg-slate-900' : 'bg-white border-slate-200 text-slate-850 shadow-inner'
              }`}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
              ))}
            </select>
          </div>

          {/* Difficulty filter */}
          <div className="md:col-span-2 relative">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer ${
                isDarkMode ? 'bg-black/35 border-white/10 text-white [&>option]:bg-slate-900' : 'bg-white border-slate-200 text-slate-850 shadow-inner'
              }`}
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Rating filter slider */}
          <div className="md:col-span-2 relative flex items-center gap-2">
            <div className={`w-full px-3 py-2 border rounded-xl flex items-center justify-between ${
              isDarkMode ? 'bg-black/35 border-white/10 text-white' : 'bg-white border-slate-200'
            }`}>
              <span className="text-[10px] font-bold text-slate-400">Min Rating:</span>
              <select
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value))}
                className={`text-xs bg-transparent border-none font-bold focus:outline-none cursor-pointer text-indigo-400 ${
                  isDarkMode ? '[&>option]:bg-slate-900' : ''
                }`}
              >
                <option value="0">All Ratings</option>
                <option value="4.5">4.5+ ★</option>
                <option value="4.8">4.8+ ★</option>
              </select>
            </div>
          </div>

          {/* Sorting rules */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={`w-full px-3 py-2.5 rounded-xl text-xs border focus:outline-none font-semibold focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer ${
                isDarkMode ? 'bg-black/35 border-white/10 text-indigo-405 [&>option]:bg-slate-900 text-indigo-400' : 'bg-indigo-50 text-slate-800 border-slate-200'
              }`}
            >
              <option value="match">Match Score</option>
              <option value="rating">Course Rating</option>
              <option value="popularity">Popularity</option>
            </select>
          </div>

        </div>
      </div>

      {/* LIST SECTION */}
      {isRefreshing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div 
              key={`skeleton-${idx}`} 
              className={`relative h-96 rounded-2xl border overflow-hidden animate-pulse ${
                isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}
            >
              <div className="h-24 bg-slate-300 dark:bg-slate-800" />
              <div className="p-5 space-y-4">
                <div className="h-4 bg-slate-300 dark:bg-slate-800 w-1/3 rounded" />
                <div className="h-6 bg-slate-300 dark:bg-slate-800 w-3/4 rounded" />
                <div className="h-10 bg-slate-300 dark:bg-slate-800 rounded" />
                <div className="h-8 bg-slate-300 dark:bg-slate-800 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredAndSortedItems.length === 0 ? (
        <div className={`p-12 text-center rounded-2xl border border-dashed ${
          isDarkMode ? 'border-slate-800 text-slate-500 bg-slate-950/30' : 'border-slate-200 text-slate-400 bg-slate-50'
        }`}>
          <Compass className="w-12 h-12 mx-auto mb-3 opacity-60 text-slate-400 animate-bounce" />
          <h4 className="font-bold text-base mb-1">No recommendation matches found</h4>
          <p className="text-xs max-w-sm mx-auto">Try widening your filters, searching for alternate keywords, or tweaking your preferences in the profile catalog!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <p className="text-xs font-bold text-slate-400">
              Showing {filteredAndSortedItems.length} personalized predictions
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedItems.map((item) => (
              <RecommendationCard
                key={item.id}
                item={item}
                isSaved={userPreferences.savedItemIds.includes(item.id)}
                isDarkMode={isDarkMode}
                onToggleSave={onToggleSave}
                onViewDetails={onViewItem}
                onEnroll={handleCourseEnroll}
                userInterests={userPreferences.selectedInterests}
                isEnrolled={userPreferences.viewedItemIds.includes(item.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

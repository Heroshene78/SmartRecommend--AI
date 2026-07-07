export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  difficulty: DifficultyLevel;
  rating: number;
  duration: string;
  gradient: string; // Tailwind gradient classes for a beautiful card background
  enrolledCount: number;
}

export interface UserPreferences {
  name: string;
  selectedInterests: string[];
  savedItemIds: string[];
  viewedItemIds: string[];
}

export interface RecommendationResult extends RecommendationItem {
  score: number;
  matchPercentage: number;
  explanation: string;
}

export type TabType = 'dashboard' | 'interests' | 'saved' | 'analytics' | 'profile';

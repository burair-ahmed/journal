/**
 * TypeScript types for the Notebook system
 * Matches the Supabase database schema
 */

// ============================================
// TRADING NOTES
// ============================================
export type NoteType = 
  | 'observation' 
  | 'analysis' 
  | 'review' 
  | 'strategy' 
  | 'lesson' 
  | 'idea' 
  | 'market' 
  | 'psychology' 
  | 'goal' 
  | 'research';

export interface TradingNote {
  id: string;
  user_id: string;
  account_id?: number | null;
  title: string;
  content?: string | null;
  note_type: NoteType;
  tags: string[];
  symbols: string[];
  is_pinned: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteInput {
  title: string;
  content?: string;
  note_type: NoteType;
  tags?: string[];
  symbols?: string[];
  account_id?: number;
}

// ============================================
// TRADE IDEAS
// ============================================
export type IdeaStatus = 'idea' | 'watching' | 'executed' | 'closed' | 'cancelled';
export type TradeDirection = 'long' | 'short' | 'neutral';
export type TradeOutcome = 'win' | 'loss' | 'breakeven' | null;

export interface TradeIdea {
  id: string;
  user_id: string;
  account_id?: number | null;
  symbol: string;
  timeframe?: string | null;
  direction?: TradeDirection | null;
  entry_price?: number | null;
  stop_loss?: number | null;
  take_profit?: number | null;
  risk_reward_ratio?: number | null;
  setup_description?: string | null;
  confluence_factors: string[];
  chart_screenshot_url?: string | null;
  status: IdeaStatus;
  executed_trade_id?: number | null;
  outcome?: TradeOutcome;
  actual_profit?: number | null;
  created_at: string;
  updated_at: string;
  executed_at?: string | null;
  closed_at?: string | null;
}

export interface CreateTradeIdeaInput {
  symbol: string;
  timeframe?: string;
  direction?: TradeDirection;
  entry_price?: number;
  stop_loss?: number;
  take_profit?: number;
  setup_description?: string;
  confluence_factors?: string[];
  account_id?: number;
}

// ============================================
// TRADING STRATEGIES
// ============================================
export interface TradingStrategy {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  version: number;
  entry_rules?: string | null;
  exit_rules?: string | null;
  risk_management_rules?: string | null;
  market_conditions: string[];
  timeframes: string[];
  symbols: string[];
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate?: number | null;
  avg_profit?: number | null;
  avg_loss?: number | null;
  expectancy?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateStrategyInput {
  name: string;
  description?: string;
  entry_rules?: string;
  exit_rules?: string;
  risk_management_rules?: string;
  market_conditions?: string[];
  timeframes?: string[];
  symbols?: string[];
}

// ============================================
// LESSONS LEARNED
// ============================================
export type LessonCategory = 
  | 'emotional' 
  | 'technical' 
  | 'risk_management' 
  | 'strategy_violation' 
  | 'market_analysis' 
  | 'other';

export type LessonSeverity = 'minor' | 'major' | 'critical';
export type LessonStatus = 'learning' | 'improving' | 'mastered';

export interface LessonLearned {
  id: string;
  user_id: string;
  trade_id?: number | null;
  title: string;
  description?: string | null;
  category: LessonCategory;
  severity: LessonSeverity;
  what_went_wrong?: string | null;
  what_to_do_differently?: string | null;
  status: LessonStatus;
  recurrence_count: number;
  created_at: string;
  updated_at: string;
  mastered_at?: string | null;
}

export interface CreateLessonInput {
  title: string;
  description?: string;
  category: LessonCategory;
  severity?: LessonSeverity;
  what_went_wrong?: string;
  what_to_do_differently?: string;
  trade_id?: number;
}

// ============================================
// MARKET JOURNAL
// ============================================
export type MarketEventType = 
  | 'economic_data' 
  | 'central_bank' 
  | 'geopolitical' 
  | 'earnings' 
  | 'sector_rotation' 
  | 'market_regime' 
  | 'other';

export type ImpactLevel = 'low' | 'medium' | 'high';

export interface MarketJournalEntry {
  id: string;
  user_id: string;
  event_date: string;
  event_type?: MarketEventType | null;
  title: string;
  description?: string | null;
  impact_level?: ImpactLevel | null;
  affected_symbols: string[];
  market_reaction?: string | null;
  trading_implications?: string | null;
  lessons?: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// PSYCHOLOGY LOG
// ============================================
export interface PsychologyLog {
  id: string;
  user_id: string;
  log_date: string;
  mood_rating?: number | null;
  confidence_level?: number | null;
  stress_level?: number | null;
  emotional_triggers: string[];
  trigger_description?: string | null;
  sleep_quality?: number | null;
  sleep_hours?: number | null;
  exercise_minutes?: number | null;
  meditation_minutes?: number | null;
  trading_performance_notes?: string | null;
  emotional_trades: string[];
  affirmations: string[];
  created_at: string;
  updated_at: string;
}

// ============================================
// CHART LIBRARY
// ============================================
export type ChartType = 'entry' | 'exit' | 'analysis' | 'pattern' | 'setup' | 'other';

export interface ChartLibraryItem {
  id: string;
  user_id: string;
  trade_id?: number | null;
  trade_idea_id?: string | null;
  title?: string | null;
  description?: string | null;
  symbol?: string | null;
  timeframe?: string | null;
  image_url: string;
  thumbnail_url?: string | null;
  patterns: string[];
  annotations?: string | null;
  chart_type?: ChartType | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// ============================================
// VOICE NOTES
// ============================================
export type TranscriptionStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface VoiceNote {
  id: string;
  user_id: string;
  trade_id?: number | null;
  title?: string | null;
  audio_url: string;
  duration_seconds?: number | null;
  transcription?: string | null;
  transcription_status: TranscriptionStatus;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// ============================================
// RESEARCH CLIPPINGS
// ============================================
export type ContentType = 'article' | 'video' | 'tweet' | 'pdf' | 'other';
export type ReadingStatus = 'to_read' | 'reading' | 'completed';

export interface ResearchClipping {
  id: string;
  user_id: string;
  title: string;
  url?: string | null;
  content?: string | null;
  excerpt?: string | null;
  source?: string | null;
  content_type?: ContentType | null;
  category?: string | null;
  tags: string[];
  highlights: string[];
  notes?: string | null;
  reading_status: ReadingStatus;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  read_at?: string | null;
}

// ============================================
// TRADING GOALS
// ============================================
export type GoalType = 'profit' | 'win_rate' | 'consistency' | 'risk_management' | 'learning' | 'other';
export type GoalStatus = 'active' | 'completed' | 'failed' | 'cancelled';

export interface TradingGoal {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  goal_type?: GoalType | null;
  target_value?: number | null;
  target_unit?: string | null;
  start_date: string;
  target_date: string;
  current_value: number;
  progress_percentage: number;
  milestones?: any; // JSONB
  status: GoalStatus;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
}

// ============================================
// NOTE ATTACHMENTS
// ============================================
export type AttachmentType = 'trade' | 'strategy' | 'trade_idea' | 'chart' | 'goal';

export interface NoteAttachment {
  id: string;
  note_id: string;
  attachment_type: AttachmentType;
  trade_id?: number | null;
  strategy_id?: string | null;
  trade_idea_id?: string | null;
  chart_id?: string | null;
  goal_id?: string | null;
  created_at: string;
}

// ============================================
// FILTER & SEARCH TYPES
// ============================================
export interface NoteFilters {
  note_type?: NoteType;
  tags?: string[];
  symbols?: string[];
  search?: string;
  is_pinned?: boolean;
  is_archived?: boolean;
  date_from?: string;
  date_to?: string;
}

export interface IdeaFilters {
  status?: IdeaStatus;
  symbol?: string;
  direction?: TradeDirection;
  date_from?: string;
  date_to?: string;
}

export interface LessonFilters {
  category?: LessonCategory;
  severity?: LessonSeverity;
  status?: LessonStatus;
  date_from?: string;
  date_to?: string;
}

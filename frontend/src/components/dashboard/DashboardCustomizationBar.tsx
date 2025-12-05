// components/dashboard/DashboardCustomizationBar.tsx
/**
 * Toolbar for dashboard customization
 * Preset layouts, reset, and customization mode toggle
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { 
  Settings, 
  LayoutGrid, 
  RotateCcw, 
  Check, 
  Sparkles,
  TrendingUp,
  Clock,
  BarChart3,
  Grid3x3 
} from 'lucide-react';
import { PresetLayout } from '@/hooks/useDashboardPreferences';
import { cn } from '@/lib/utils';
import { LayoutBuilder } from './LayoutBuilder';

interface DashboardCustomizationBarProps {
  isCustomizing: boolean;
  activePreset: PresetLayout;
  onToggleCustomizing: () => void;
  onApplyPreset: (preset: PresetLayout) => void;
  onReset: () => void;
  onSaveCustomLayout?: (layout: any) => void; // Optional for now
}

const PRESET_INFO = {
  default: {
    label: 'Default',
    icon: LayoutGrid,
    description: 'Balanced layout for all traders',
  },
  beginner: {
    label: 'Beginner',
    icon: Sparkles,
    description: 'Simple view with essential widgets',
  },
  advanced: {
    label: 'Advanced',
    icon: BarChart3,
    description: 'Comprehensive analytics dashboard',
  },
  day_trader: {
    label: 'Day Trader',
    icon: Clock,
    description: 'Focus on timing and quick decisions',
  },
  swing_trader: {
    label: 'Swing Trader',
    icon: TrendingUp,
    description: 'Long-term trend analysis',
  },
};

export const DashboardCustomizationBar = ({
  isCustomizing,
  activePreset,
  onToggleCustomizing,
  onApplyPreset,
  onReset,
  onSaveCustomLayout,
}: DashboardCustomizationBarProps) => {
  // Available widgets for layout builder
  const availableWidgets = [
    { id: 'account_balance', name: 'Account Balance' },
    { id: 'profit_factor', name: 'Profit Factor' },
    { id: 'trade_win', name: 'Win Rate' },
    { id: 'symbol_distribution', name: 'Symbol Distribution' },
    { id: 'calendar', name: 'Trading Calendar' },
    { id: 'time_heatmap', name: 'Time Heatmap' },
    { id: 'charts_grid', name: 'Performance Charts' },
  ];

  return (
    <div className="flex items-center justify-between mb-6 p-4 bg-card rounded-lg border">
      <div className="flex items-center gap-3">
        {/* Customization Toggle */}
        <Button
          variant={isCustomizing ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleCustomizing}
          className={cn(
            'transition-all',
            isCustomizing && 'bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700'
          )}
        >
          <Settings className="h-4 w-4 mr-2" />
          {isCustomizing ? 'Done Customizing' : 'Customize Dashboard'}
        </Button>

        {/* Active Preset Indicator */}
        <div className="text-sm text-muted-foreground">
          Active: <span className="font-medium text-foreground">{PRESET_INFO[activePreset].label}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Layout Builder */}
        {onSaveCustomLayout && (
          <LayoutBuilder
            availableWidgets={availableWidgets}
            onSaveLayout={onSaveCustomLayout}
          />
        )}

        {/* Preset Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Preset Layouts
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Choose a Layout</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.entries(PRESET_INFO).map(([key, info]) => {
              const Icon = info.icon;
              const isActive = key === activePreset;

              return (
                <DropdownMenuItem
                  key={key}
                  onClick={() => onApplyPreset(key as PresetLayout)}
                  className={cn(
                    'cursor-pointer',
                    isActive && 'bg-primary/10'
                  )}
                >
                  <div className="flex items-start gap-3 w-full">
                    <Icon className={cn(
                      'h-5 w-5 mt-0.5',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{info.label}</span>
                        {isActive && <Check className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {info.description}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Reset Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Customization Help Banner */}
      <AnimatePresence>
        {isCustomizing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute left-0 right-0 top-full mt-2 mx-4"
          >
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
              <p className="text-sm text-foreground">
                <strong>Customization Mode:</strong> Drag widgets to reorder, click 👁️ to show/hide, click ↕️ to resize.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// hooks/useDashboardPreferences.ts
/**
 * Custom hook for managing user dashboard preferences
 * Handles layout, visibility, and widget customization
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export type WidgetSize = 'compact' | 'normal' | 'expanded';
export type PresetLayout = 'default' | 'beginner' | 'advanced' | 'day_trader' | 'swing_trader';

export interface DashboardWidget {
  id: string;
  order: number;
  visible: boolean;
  size: WidgetSize;
}

export interface DashboardPreferences {
  layout: DashboardWidget[];
  widgetVisibility: Record<string, boolean>;
  widgetSizes: Record<string, WidgetSize>;
  activePreset: PresetLayout;
}

// Default widget configuration
export const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: 'account_balance', order: 0, visible: true, size: 'normal' },
  { id: 'profit_factor', order: 1, visible: true, size: 'normal' },
  { id: 'trade_win', order: 2, visible: true, size: 'normal' },
  { id: 'symbol_distribution', order: 3, visible: true, size: 'normal' },
  { id: 'calendar', order: 4, visible: true, size: 'expanded' },
  { id: 'time_heatmap', order: 5, visible: true, size: 'normal' },
  { id: 'charts_grid', order: 6, visible: true, size: 'expanded' },
];

// Preset layouts
export const PRESET_LAYOUTS: Record<PresetLayout, DashboardWidget[]> = {
  default: DEFAULT_WIDGETS,
  beginner: [
    { id: 'account_balance', order: 0, visible: true, size: 'expanded' },
    { id: 'trade_win', order: 1, visible: true, size: 'expanded' },
    { id: 'calendar', order: 2, visible: true, size: 'expanded' },
    { id: 'profit_factor', order: 3, visible: false, size: 'compact' },
    { id: 'symbol_distribution', order: 4, visible: false, size: 'compact' },
    { id: 'time_heatmap', order: 5, visible: false, size: 'compact' },
    { id: 'charts_grid', order: 6, visible: false, size: 'compact' },
  ],
  advanced: [
    { id: 'account_balance', order: 0, visible: true, size: 'compact' },
    { id: 'profit_factor', order: 1, visible: true, size: 'compact' },
    { id: 'trade_win', order: 2, visible: true, size: 'compact' },
    { id: 'symbol_distribution', order: 3, visible: true, size: 'normal' },
    { id: 'time_heatmap', order: 4, visible: true, size: 'normal' },
    { id: 'calendar', order: 5, visible: true, size: 'normal' },
    { id: 'charts_grid', order: 6, visible: true, size: 'expanded' },
  ],
  day_trader: [
    { id: 'account_balance', order: 0, visible: true, size: 'compact' },
    { id: 'trade_win', order: 1, visible: true, size: 'compact' },
    { id: 'time_heatmap', order: 2, visible: true, size: 'expanded' },
    { id: 'calendar', order: 3, visible: true, size: 'normal' },
    { id: 'charts_grid', order: 4, visible: true, size: 'expanded' },
    { id: 'profit_factor', order: 5, visible: true, size: 'compact' },
    { id: 'symbol_distribution', order: 6, visible: false, size: 'compact' },
  ],
  swing_trader: [
    { id: 'account_balance', order: 0, visible: true, size: 'normal' },
    { id: 'profit_factor', order: 1, visible: true, size: 'normal' },
    { id: 'calendar', order: 2, visible: true, size: 'expanded' },
    { id: 'symbol_distribution', order: 3, visible: true, size: 'normal' },
    { id: 'charts_grid', order: 4, visible: true, size: 'expanded' },
    { id: 'trade_win', order: 5, visible: true, size: 'compact' },
    { id: 'time_heatmap', order: 6, visible: false, size: 'compact' },
  ],
};

/**
 * Fetch user's dashboard preferences
 */
export const useDashboardPreferences = () => {
  const { user } = useAuth();

  return useQuery<DashboardPreferences>({
    queryKey: ['dashboard-preferences', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If no preferences exist, return defaults
        if (error.code === 'PGRST116') {
          return {
            layout: DEFAULT_WIDGETS,
            widgetVisibility: Object.fromEntries(
              DEFAULT_WIDGETS.map(w => [w.id, w.visible])
            ),
            widgetSizes: Object.fromEntries(
              DEFAULT_WIDGETS.map(w => [w.id, w.size])
            ),
            activePreset: 'default',
          };
        }
        throw error;
      }

      return {
        layout: data.dashboard_layout as DashboardWidget[] || DEFAULT_WIDGETS,
        widgetVisibility: data.widget_visibility as Record<string, boolean> || {},
        widgetSizes: data.widget_sizes as Record<string, WidgetSize> || {},
        activePreset: data.active_preset as PresetLayout || 'default',
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Update dashboard layout with optimistic update (drag-drop reorder)
 */
export const useUpdateDashboardLayout = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (layout: DashboardWidget[]) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          dashboard_layout: layout,
        });

      if (error) throw error;
    },
    // ✨ Optimistic update for instant drag feedback
    onMutate: async (newLayout) => {
      await queryClient.cancelQueries({ queryKey: ['dashboard-preferences', user?.id] });

      const previousPreferences = queryClient.getQueryData<DashboardPreferences>(['dashboard-preferences', user?.id]);

      if (previousPreferences) {
        queryClient.setQueryData<DashboardPreferences>(['dashboard-preferences', user?.id], {
          ...previousPreferences,
          layout: newLayout,
        });
      }

      return { previousPreferences };
    },
    onError: (error: any, variables, context) => {
      if (context?.previousPreferences) {
        queryClient.setQueryData(['dashboard-preferences', user?.id], context.previousPreferences);
      }
      toast.error(`Failed to update layout: ${error.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-preferences', user?.id] });
    },
  });
};

/**
 * Toggle widget visibility with optimistic update
 */
export const useToggleWidgetVisibility = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ widgetId, visible }: { widgetId: string; visible: boolean }) => {
      if (!user) throw new Error('Not authenticated');

      // Get current preferences
      const { data } = await supabase
        .from('user_preferences')
        .select('widget_visibility, dashboard_layout')
        .eq('user_id', user.id)
        .single();

      const currentVisibility = data?.widget_visibility || {};
      const currentLayout = data?.dashboard_layout as DashboardWidget[] || DEFAULT_WIDGETS;

      // Update visibility in both places
      const newVisibility = { ...currentVisibility, [widgetId]: visible };
      const newLayout = currentLayout.map(w =>
        w.id === widgetId ? { ...w, visible } : w
      );

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          widget_visibility: newVisibility,
          dashboard_layout: newLayout,
        });

      if (error) throw error;
    },
    // ✨ Optimistic update for instant UI feedback
    onMutate: async ({ widgetId, visible }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['dashboard-preferences', user?.id] });

      // Snapshot previous value
      const previousPreferences = queryClient.getQueryData<DashboardPreferences>(['dashboard-preferences', user?.id]);

      // Optimistically update
      if (previousPreferences) {
        queryClient.setQueryData<DashboardPreferences>(['dashboard-preferences', user?.id], {
          ...previousPreferences,
          layout: previousPreferences.layout.map(w =>
            w.id === widgetId ? { ...w, visible } : w
          ),
          widgetVisibility: { ...previousPreferences.widgetVisibility, [widgetId]: visible },
        });
      }

      return { previousPreferences };
    },
    onError: (error: any, variables, context) => {
      // Rollback on error
      if (context?.previousPreferences) {
        queryClient.setQueryData(['dashboard-preferences', user?.id], context.previousPreferences);
      }
      toast.error(`Failed to toggle widget: ${error.message}`);
    },
    onSettled: () => {
      // Refetch to ensure sync
      queryClient.invalidateQueries({ queryKey: ['dashboard-preferences', user?.id] });
    },
  });
};

/**
 * Update widget size with optimistic update
 */
export const useUpdateWidgetSize = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ widgetId, size }: { widgetId: string; size: WidgetSize }) => {
      if (!user) throw new Error('Not authenticated');

      const { data } = await supabase
        .from('user_preferences')
        .select('widget_sizes, dashboard_layout')
        .eq('user_id', user.id)
        .single();

      const currentSizes = data?.widget_sizes || {};
      const currentLayout = data?.dashboard_layout as DashboardWidget[] || DEFAULT_WIDGETS;

      const newSizes = { ...currentSizes, [widgetId]: size };
      const newLayout = currentLayout.map(w =>
        w.id === widgetId ? { ...w, size } : w
      );

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          widget_sizes: newSizes,
          dashboard_layout: newLayout,
        });

      if (error) throw error;
    },
    // ✨ Optimistic update for instant resize
    onMutate: async ({ widgetId, size }) => {
      await queryClient.cancelQueries({ queryKey: ['dashboard-preferences', user?.id] });

      const previousPreferences = queryClient.getQueryData<DashboardPreferences>(['dashboard-preferences', user?.id]);

      if (previousPreferences) {
        queryClient.setQueryData<DashboardPreferences>(['dashboard-preferences', user?.id], {
          ...previousPreferences,
          layout: previousPreferences.layout.map(w =>
            w.id === widgetId ? { ...w, size } : w
          ),
          widgetSizes: { ...previousPreferences.widgetSizes, [widgetId]: size },
        });
      }

      return { previousPreferences };
    },
    onError: (error: any, variables, context) => {
      if (context?.previousPreferences) {
        queryClient.setQueryData(['dashboard-preferences', user?.id], context.previousPreferences);
      }
      toast.error(`Failed to update widget size: ${error.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-preferences', user?.id] });
    },
  });
};

/**
 * Apply preset layout
 */
export const useApplyPresetLayout = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (preset: PresetLayout) => {
      if (!user) throw new Error('Not authenticated');

      const presetLayout = PRESET_LAYOUTS[preset];
      const widgetVisibility = Object.fromEntries(
        presetLayout.map(w => [w.id, w.visible])
      );
      const widgetSizes = Object.fromEntries(
        presetLayout.map(w => [w.id, w.size])
      );

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          dashboard_layout: presetLayout,
          widget_visibility: widgetVisibility,
          widget_sizes: widgetSizes,
          active_preset: preset,
        });

      if (error) throw error;
    },
    onSuccess: (_, preset) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-preferences'] });
      toast.success(`${preset} layout applied`);
    },
    onError: (error: any) => {
      toast.error(`Failed to apply preset: ${error.message}`);
    },
  });
};

/**
 * Reset to default layout
 */
export const useResetDashboardLayout = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          dashboard_layout: DEFAULT_WIDGETS,
          widget_visibility: Object.fromEntries(
            DEFAULT_WIDGETS.map(w => [w.id, w.visible])
          ),
          widget_sizes: Object.fromEntries(
            DEFAULT_WIDGETS.map(w => [w.id, w.size])
          ),
          active_preset: 'default',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-preferences'] });
      toast.success('Dashboard reset to defaults');
    },
    onError: (error: any) => {
      toast.error(`Failed to reset dashboard: ${error.message}`);
    },
  });
};

// views/admin/SystemSettings.tsx
/**
 * System Settings View
 * Manage global platform settings like maintenance mode, registration, etc.
 */

import { useSystemSettings, useUpdateSystemSetting } from '@/hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Settings, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export const SystemSettings = () => {
  const { data: settings, isLoading } = useSystemSettings();
  const updateSetting = useUpdateSystemSetting();
  const [localSettings, setLocalSettings] = useState<Record<string, any>>({});

  // Sync local state with fetched data
  useEffect(() => {
    if (settings) {
      const initial: Record<string, any> = {};
      settings.forEach(s => {
        initial[s.key] = s.value;
      });
      setLocalSettings(initial);
    }
  }, [settings]);

  const handleToggle = (key: string, checked: boolean) => {
    setLocalSettings(prev => ({ ...prev, [key]: checked }));
    updateSetting.mutate({ key, value: checked });
  };

  const handleInputChange = (key: string, value: string) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveInput = (key: string) => {
    updateSetting.mutate({ key, value: localSettings[key] });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 to-pink-600">
          System Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage global platform configuration and feature flags
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* General Settings */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              General Configuration
            </CardTitle>
            <CardDescription>
              Basic platform settings and metadata
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="platform_name">Platform Name</Label>
              <div className="flex gap-2">
                <Input 
                  id="platform_name" 
                  value={localSettings['platform_name'] || ''} 
                  onChange={(e) => handleInputChange('platform_name', e.target.value)}
                />
                <Button 
                  size="icon" 
                  variant="outline"
                  onClick={() => handleSaveInput('platform_name')}
                  disabled={updateSetting.isPending}
                >
                  <Save className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Displayed in emails and browser title
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="support_email">Support Email</Label>
              <div className="flex gap-2">
                <Input 
                  id="support_email" 
                  value={localSettings['support_email'] || ''} 
                  onChange={(e) => handleInputChange('support_email', e.target.value)}
                />
                <Button 
                  size="icon" 
                  variant="outline"
                  onClick={() => handleSaveInput('support_email')}
                  disabled={updateSetting.isPending}
                >
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </div>

             <div className="space-y-2">
              <Label htmlFor="max_upload_size_mb">Max Upload Size (MB)</Label>
              <div className="flex gap-2">
                <Input 
                  id="max_upload_size_mb" 
                  type="number"
                  value={localSettings['max_upload_size_mb'] || ''} 
                  onChange={(e) => handleInputChange('max_upload_size_mb', e.target.value)}
                />
                <Button 
                  size="icon" 
                  variant="outline"
                  onClick={() => handleSaveInput('max_upload_size_mb')}
                  disabled={updateSetting.isPending}
                >
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Flags & Controls */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Critical Controls
            </CardTitle>
            <CardDescription>
              Feature flags and access control
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="space-y-0.5">
                <Label className="text-base">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Disable access for all non-admin users
                </p>
              </div>
              <Switch 
                checked={localSettings['maintenance_mode'] === true}
                onCheckedChange={(checked) => handleToggle('maintenance_mode', checked)}
                disabled={updateSetting.isPending}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="space-y-0.5">
                <Label className="text-base">Allow Registration</Label>
                <p className="text-sm text-muted-foreground">
                  Enable new user sign-ups
                </p>
              </div>
              <Switch 
                checked={localSettings['allow_registration'] === true}
                onCheckedChange={(checked) => handleToggle('allow_registration', checked)}
                disabled={updateSetting.isPending}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
// import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Database, 
  Shield, 
  Mail, 
  Palette,
  Server,
  Globe,
  Save,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    adminEmail: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
  };
  security: {
    twoFactorRequired: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
  };
  appearance: {
    primaryColor: string;
    secondaryColor: string;
    darkMode: boolean;
    customCSS: string;
  };
  performance: {
    cacheEnabled: boolean;
    cacheDuration: number;
    compressionEnabled: boolean;
    cdnEnabled: boolean;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch('/api/admin/settings');
        if (response.ok) {
          const settingsData = await response.json();
          setSettings(settingsData);
        } else {
          console.error('Failed to fetch settings');
          // Set default settings on error
          setSettings({
            general: {
              siteName: 'DarkByte',
              siteDescription: 'Premium Discord server management platform',
              adminEmail: 'admin@darkbyte.in',
              maintenanceMode: false,
              registrationEnabled: true
            },
            security: {
              twoFactorRequired: false,
              sessionTimeout: 24,
              maxLoginAttempts: 5,
              passwordMinLength: 8
            },
            email: {
              smtpHost: '',
              smtpPort: 587,
              smtpUser: '',
              smtpPassword: '',
              fromEmail: 'noreply@darkbyte.in',
              fromName: 'DarkByte'
            },
            appearance: {
              primaryColor: '#3B82F6',
              secondaryColor: '#8B5CF6',
              darkMode: true,
              customCSS: ''
            },
            performance: {
              cacheEnabled: true,
              cacheDuration: 3600,
              compressionEnabled: true,
              cdnEnabled: false
            }
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        setSettings({
          general: {
            siteName: 'DarkByte',
            siteDescription: 'Premium Discord server management platform',
            adminEmail: 'admin@darkbyte.in',
            maintenanceMode: false,
            registrationEnabled: true
          },
          security: {
            twoFactorRequired: false,
            sessionTimeout: 24,
            maxLoginAttempts: 5,
            passwordMinLength: 8
          },
          email: {
            smtpHost: '',
            smtpPort: 587,
            smtpUser: '',
            smtpPassword: '',
            fromEmail: 'noreply@darkbyte.in',
            fromName: 'DarkByte'
          },
          appearance: {
            primaryColor: '#3B82F6',
            secondaryColor: '#8B5CF6',
            darkMode: true,
            customCSS: ''
          },
          performance: {
            cacheEnabled: true,
            cacheDuration: 3600,
            compressionEnabled: true,
            cdnEnabled: false
          }
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (section: keyof SystemSettings) => {
    if (!settings) return;
    
    setIsSaving(true);
    
    try {
      const response = await fetch(`/api/admin/settings/${section}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings[section]),
      });

      if (response.ok) {
        toast.success(`${section} settings saved successfully!`);
      } else {
        const errorData = await response.json();
        toast.error(`Failed to save ${section} settings: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`Error saving ${section} settings:`, error);
      toast.error(`Failed to save ${section} settings. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!settings) return;
    
    toast.info('Sending test email...');
    
    try {
      const response = await fetch('/api/admin/settings/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings.email),
      });

      if (response.ok) {
        toast.success('Test email sent successfully!');
      } else {
        const errorData = await response.json();
        toast.error(`Failed to send test email: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Failed to send test email. Please check your email configuration.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">System Settings</h1>
        <p className="text-gray-400">Configure system-wide settings and preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="general" className="data-[state=active]:bg-blue-600">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-blue-600">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="email" className="data-[state=active]:bg-blue-600">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-blue-600">
            <Palette className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-blue-600">
            <Server className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">General Settings</CardTitle>
              <CardDescription>Basic site configuration and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName" className="text-white">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.general.siteName}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, siteName: e.target.value }
                    })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail" className="text-white">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.general.adminEmail}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, adminEmail: e.target.value }
                    })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="siteDescription" className="text-white">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.general.siteDescription}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, siteDescription: e.target.value }
                  })}
                  className="bg-gray-700 border-gray-600 text-white"
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Maintenance Mode</Label>
                    <p className="text-sm text-gray-400">Enable to put the site in maintenance mode</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.general.maintenanceMode}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, maintenanceMode: e.target.checked }
                    })}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">User Registration</Label>
                    <p className="text-sm text-gray-400">Allow new users to register</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.general.registrationEnabled}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, registrationEnabled: e.target.checked }
                    })}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                </div>
              </div>

              <Button 
                onClick={() => handleSave('general')} 
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Security Settings</CardTitle>
              <CardDescription>Configure security policies and authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout" className="text-white">Session Timeout (hours)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                    })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts" className="text-white">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, maxLoginAttempts: parseInt(e.target.value) }
                    })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Require Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-400">Force all users to enable 2FA</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.security.twoFactorRequired}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, twoFactorRequired: e.target.checked }
                    })}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                </div>
              </div>

              <Button 
                onClick={() => handleSave('security')} 
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Email Configuration</CardTitle>
              <CardDescription>Configure SMTP settings for email delivery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost" className="text-white">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={settings.email.smtpHost}
                    onChange={(e) => setSettings({
                      ...settings,
                      email: { ...settings.email, smtpHost: e.target.value }
                    })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort" className="text-white">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={settings.email.smtpPort}
                    onChange={(e) => setSettings({
                      ...settings,
                      email: { ...settings.email, smtpPort: parseInt(e.target.value) }
                    })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fromEmail" className="text-white">From Email</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={settings.email.fromEmail}
                    onChange={(e) => setSettings({
                      ...settings,
                      email: { ...settings.email, fromEmail: e.target.value }
                    })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromName" className="text-white">From Name</Label>
                  <Input
                    id="fromName"
                    value={settings.email.fromName}
                    onChange={(e) => setSettings({
                      ...settings,
                      email: { ...settings.email, fromName: e.target.value }
                    })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={() => handleSave('email')} 
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Email Settings
                </Button>
                <Button 
                  onClick={handleTestEmail}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Test Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel of the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor" className="text-white">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={settings.appearance.primaryColor}
                      onChange={(e) => setSettings({
                        ...settings,
                        appearance: { ...settings.appearance, primaryColor: e.target.value }
                      })}
                      className="w-16 h-10 bg-gray-700 border-gray-600"
                    />
                    <Input
                      value={settings.appearance.primaryColor}
                      onChange={(e) => setSettings({
                        ...settings,
                        appearance: { ...settings.appearance, primaryColor: e.target.value }
                      })}
                      className="flex-1 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor" className="text-white">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={settings.appearance.secondaryColor}
                      onChange={(e) => setSettings({
                        ...settings,
                        appearance: { ...settings.appearance, secondaryColor: e.target.value }
                      })}
                      className="w-16 h-10 bg-gray-700 border-gray-600"
                    />
                    <Input
                      value={settings.appearance.secondaryColor}
                      onChange={(e) => setSettings({
                        ...settings,
                        appearance: { ...settings.appearance, secondaryColor: e.target.value }
                      })}
                      className="flex-1 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customCSS" className="text-white">Custom CSS</Label>
                <Textarea
                  id="customCSS"
                  value={settings.appearance.customCSS}
                  onChange={(e) => setSettings({
                    ...settings,
                    appearance: { ...settings.appearance, customCSS: e.target.value }
                  })}
                  className="bg-gray-700 border-gray-600 text-white font-mono"
                  rows={8}
                  placeholder="/* Add your custom CSS here */"
                />
              </div>

              <Button 
                onClick={() => handleSave('appearance')} 
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Appearance Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Settings */}
        <TabsContent value="performance">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Performance Settings</CardTitle>
              <CardDescription>Optimize system performance and caching</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Enable Caching</Label>
                    <p className="text-sm text-gray-400">Cache frequently accessed data</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.performance.cacheEnabled}
                    onChange={(e) => setSettings({
                      ...settings,
                      performance: { ...settings.performance, cacheEnabled: e.target.checked }
                    })}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Enable Compression</Label>
                    <p className="text-sm text-gray-400">Compress responses to reduce bandwidth</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.performance.compressionEnabled}
                    onChange={(e) => setSettings({
                      ...settings,
                      performance: { ...settings.performance, compressionEnabled: e.target.checked }
                    })}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">CDN Integration</Label>
                    <p className="text-sm text-gray-400">Use CDN for static assets</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.performance.cdnEnabled}
                    onChange={(e) => setSettings({
                      ...settings,
                      performance: { ...settings.performance, cdnEnabled: e.target.checked }
                    })}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                </div>
              </div>

              <Button 
                onClick={() => handleSave('performance')} 
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Performance Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

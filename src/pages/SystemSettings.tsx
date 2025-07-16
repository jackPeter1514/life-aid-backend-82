import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Save, Database, Bell, Shield, Mail, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BackButton from "@/components/BackButton";

interface SystemConfig {
  siteName: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  maxAppointmentsPerDay: number;
  appointmentCancellationDeadline: number;
  defaultTimeZone: string;
}

const SystemSettings = () => {
  const [config, setConfig] = useState<SystemConfig>({
    siteName: "Healthcare Management System",
    maintenanceMode: false,
    allowRegistration: true,
    emailNotifications: true,
    smsNotifications: false,
    maxAppointmentsPerDay: 50,
    appointmentCancellationDeadline: 24,
    defaultTimeZone: "UTC",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSystemConfig();
  }, []);

  const fetchSystemConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/system-config', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConfig({ ...config, ...data });
      }
    } catch (error) {
      console.error('Failed to fetch system config:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/system-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "System settings updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update system settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (field: keyof SystemConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Settings className="h-8 w-8" />
              System Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure system-wide settings and preferences
            </p>
          </div>
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  General Settings
                </CardTitle>
                <CardDescription>
                  Basic system configuration and site preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={config.siteName}
                    onChange={(e) => updateConfig('siteName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Default Time Zone</Label>
                  <Input
                    id="timezone"
                    value={config.defaultTimeZone}
                    onChange={(e) => updateConfig('defaultTimeZone', e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Put the system in maintenance mode to prevent user access
                    </p>
                  </div>
                  <Switch
                    checked={config.maintenanceMode}
                    onCheckedChange={(checked) => updateConfig('maintenanceMode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Registration</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow new users to register accounts
                    </p>
                  </div>
                  <Switch
                    checked={config.allowRegistration}
                    onCheckedChange={(checked) => updateConfig('allowRegistration', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Configure how the system sends notifications to users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send email notifications for appointments and updates
                    </p>
                  </div>
                  <Switch
                    checked={config.emailNotifications}
                    onCheckedChange={(checked) => updateConfig('emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send SMS notifications for important updates
                    </p>
                  </div>
                  <Switch
                    checked={config.smsNotifications}
                    onCheckedChange={(checked) => updateConfig('smsNotifications', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Appointment Settings
                </CardTitle>
                <CardDescription>
                  Configure appointment booking rules and limits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="maxAppointments">Maximum Appointments Per Day</Label>
                  <Input
                    id="maxAppointments"
                    type="number"
                    value={config.maxAppointmentsPerDay}
                    onChange={(e) => updateConfig('maxAppointmentsPerDay', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cancellationDeadline">Cancellation Deadline (Hours)</Label>
                  <Input
                    id="cancellationDeadline"
                    type="number"
                    value={config.appointmentCancellationDeadline}
                    onChange={(e) => updateConfig('appointmentCancellationDeadline', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Minimum hours before appointment to allow cancellation
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Security and access control configurations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Password Policy</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Minimum 6 characters required</li>
                    <li>• Must contain at least one number</li>
                    <li>• Must contain at least one special character</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Session Management</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Sessions expire after 24 hours of inactivity</li>
                    <li>• Users are automatically logged out on browser close</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Access Control</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Role-based permissions system</li>
                    <li>• Admin actions are logged and audited</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SystemSettings;
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Building2, Calendar, TestTube, Activity, Settings, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BackButton from "@/components/BackButton";

interface DashboardStats {
  totalUsers: number;
  totalCenters: number;
  totalAppointments: number;
  totalTests: number;
  recentAppointments: Array<{
    _id: string;
    patient: { name: string };
    center: { name: string };
    test: { name: string };
    appointmentDate: string;
    status: string;
  }>;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching dashboard stats...');
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Dashboard response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard API response:', data);
        
        // The API returns data wrapped in a stats object
        if (data.success && data.stats) {
          setStats({
            totalUsers: data.stats.totalUsers,
            totalCenters: data.stats.totalCenters,
            totalAppointments: data.stats.totalAppointments,
            totalTests: data.stats.totalTests,
            recentAppointments: data.stats.recentAppointments || []
          });
        } else {
          console.error('Unexpected API response structure:', data);
          setStats(null);
        }
      } else {
        const errorText = await response.text();
        console.error('Dashboard API error:', errorText);
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              {user?.role === 'super_admin' ? 'Super Admin Panel' : 
               user?.role === 'diagnostic_center_admin' ? 'Center Management Dashboard' : 
               'Admin Panel'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {user?.role === 'super_admin' ? 'Complete system administration and oversight' :
               user?.role === 'diagnostic_center_admin' ? 'Manage your diagnostic center operations' :
               'Administrative dashboard and center management'}
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {user?.role?.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Diagnostic Centers</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCenters}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAppointments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Tests</CardTitle>
              <TestTube className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTests}</div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tools */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {(user?.role === 'super_admin' || user?.role === 'admin') && (
            <>
              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/admin/users')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Management
                  </CardTitle>
                  <CardDescription>Manage users, roles, and permissions</CardDescription>
                </CardHeader>
              </Card>
              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/admin/centers')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Center Management
                  </CardTitle>
                  <CardDescription>Oversee diagnostic centers and operations</CardDescription>
                </CardHeader>
              </Card>
            </>
          )}
          
          {user?.role === 'diagnostic_center_admin' && (
            <>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    Test Management
                  </CardTitle>
                  <CardDescription>Manage available diagnostic tests</CardDescription>
                </CardHeader>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Appointment Management
                  </CardTitle>
                  <CardDescription>View and manage appointments</CardDescription>
                </CardHeader>
              </Card>
            </>
          )}
          
          {user?.role === 'super_admin' && (
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/admin/settings')}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Settings
                </CardTitle>
                <CardDescription>Configure system-wide settings</CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>

        {/* Recent Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
            <CardDescription>
              {user?.role === 'diagnostic_center_admin' 
                ? 'Latest appointments for your center'
                : 'Latest appointment bookings in the system'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentAppointments?.length > 0 ? stats.recentAppointments.map((appointment) => (
                <div key={appointment._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">{appointment.patient.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {appointment.test.name} at {appointment.center.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(appointment.appointmentDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                    {appointment.status}
                  </Badge>
                </div>
              )) : (
                <p className="text-muted-foreground text-center py-4">No recent appointments found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

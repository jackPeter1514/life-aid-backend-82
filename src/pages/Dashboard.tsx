
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Building2, TestTube, User, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Appointment {
  _id: string;
  center: {
    name: string;
  };
  test: {
    name: string;
  };
  appointmentDate: string;
  status: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(userData));
    fetchAppointments(token);
  }, [navigate]);

  const fetchAppointments = async (token: string) => {
    try {
      const response = await fetch('/api/appointments/my-appointments', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
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
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary">HealthCare System</Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{user?.name}</span>
              <Badge variant="secondary">{user?.role}</Badge>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Calendar className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Book Appointment</CardTitle>
              <CardDescription>Schedule a new diagnostic appointment</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/appointments/book">
                <Button className="w-full">Book Now</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Building2 className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Find Centers</CardTitle>
              <CardDescription>Browse diagnostic centers near you</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/centers">
                <Button className="w-full" variant="outline">Browse</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <TestTube className="h-8 w-8 text-primary mb-2" />
              <CardTitle>View Tests</CardTitle>
              <CardDescription>Explore available diagnostic tests</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/tests">
                <Button className="w-full" variant="outline">View Tests</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
            <CardDescription>Your latest appointment bookings</CardDescription>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No appointments found. <Link to="/appointments/book" className="text-primary hover:underline">Book your first appointment</Link>
              </p>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{appointment.test.name}</h4>
                      <p className="text-sm text-muted-foreground">{appointment.center.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(appointment.appointmentDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

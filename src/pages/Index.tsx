
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Building2, TestTube, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Synechron Health care</h1>
          <div className="flex gap-2">
            <Link to="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link to="/register">
              <Button>Register</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl font-bold mb-4">Welcome to Synechron Health care</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Your comprehensive healthcare management platform. Book appointments, manage diagnostic centers, and access healthcare services all in one place.
        </p>
        <Link to="/login">
          <Button size="lg" className="mr-4">Dive In</Button>
        </Link>
        <Link to="/centers">
          <Button variant="outline" size="lg">Browse Centers</Button>
        </Link>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Our Services</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Calendar className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Book Appointments</CardTitle>
              <CardDescription>
                Schedule appointments with diagnostic centers easily
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/login">
                <Button variant="outline" className="w-full">Get Started</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Building2 className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Diagnostic Centers</CardTitle>
              <CardDescription>
                Find and connect with certified diagnostic centers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/login">
                <Button variant="outline" className="w-full">Explore</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <TestTube className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Diagnostic Tests</CardTitle>
              <CardDescription>
                Comprehensive range of diagnostic tests available
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/login">
                <Button variant="outline" className="w-full">View Tests</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Patient Portal</CardTitle>
              <CardDescription>
                Manage your health records and appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/login">
                <Button variant="outline" className="w-full">Access Portal</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2024 Synechron Health care. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

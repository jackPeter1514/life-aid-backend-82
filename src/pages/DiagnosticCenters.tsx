import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Phone, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import BackButton from "@/components/BackButton";

interface DiagnosticCenter {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  operatingHours: {
    open: string;
    close: string;
  };
  isActive: boolean;
}

const DiagnosticCenters = () => {
  const [centers, setCenters] = useState<DiagnosticCenter[]>([]);
  const [filteredCenters, setFilteredCenters] = useState<DiagnosticCenter[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCenters();
  }, []);

  useEffect(() => {
    const filtered = centers.filter(center =>
      center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.state.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCenters(filtered);
  }, [centers, searchTerm]);

  const fetchCenters = async () => {
    try {
      const response = await fetch('/api/diagnostic-centers');
      if (response.ok) {
        const data = await response.json();
        setCenters(data.centers);
        setFilteredCenters(data.centers);
      }
    } catch (error) {
      console.error('Error fetching centers:', error);
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Diagnostic Centers</h1>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search centers by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCenters.map((center) => (
            <Card key={center._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{center.name}</CardTitle>
                  <Badge variant={center.isActive ? "default" : "secondary"}>
                    {center.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <CardDescription>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <span>{center.address}, {center.city}, {center.state} - {center.pincode}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{center.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{center.operatingHours.open} - {center.operatingHours.close}</span>
                    </div>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Link to={`/centers/${center._id}`} className="flex-1">
                    <Button variant="outline" className="w-full">View Details</Button>
                  </Link>
                  <Link to="/appointments/book" className="flex-1">
                    <Button className="w-full">Book Appointment</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCenters.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No diagnostic centers found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosticCenters;

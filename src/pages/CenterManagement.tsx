import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Search, Plus, MapPin, Phone, Mail, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BackButton from "@/components/BackButton";

interface DiagnosticCenter {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
  services: string[];
  createdAt: string;
}

const CenterManagement = () => {
  const [centers, setCenters] = useState<DiagnosticCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/centers', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCenters(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load centers",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch centers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCenters = centers.filter(center =>
    center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    center.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    center.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <Building2 className="h-8 w-8" />
              Center Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Oversee diagnostic centers and operations
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Center
          </Button>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Centers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, address, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Centers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCenters.map((center) => (
            <Card key={center._id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{center.name}</CardTitle>
                  <Badge variant={center.isActive ? 'default' : 'secondary'}>
                    {center.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                    <p className="text-sm">{center.address}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{center.phone}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{center.email}</p>
                  </div>

                  {center.services && center.services.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Services:</p>
                      <div className="flex flex-wrap gap-1">
                        {center.services.slice(0, 3).map((service, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                        {center.services.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{center.services.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Added {new Date(center.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Settings className="h-4 w-4 mr-1" />
                    Manage
                  </Button>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCenters.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No centers found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search criteria' : 'No diagnostic centers available'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CenterManagement;
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import BackButton from "@/components/BackButton";

interface DiagnosticCenter {
  _id: string;
  name: string;
  address: string;
}

interface DiagnosticTest {
  _id: string;
  name: string;
  price: number;
  center: string;
}

const BookAppointment = () => {
  const [centers, setCenters] = useState<DiagnosticCenter[]>([]);
  const [tests, setTests] = useState<DiagnosticTest[]>([]);
  const [selectedCenter, setSelectedCenter] = useState("");
  const [selectedTest, setSelectedTest] = useState("");
  const [date, setDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCenters();
  }, []);

  useEffect(() => {
    if (selectedCenter) {
      fetchTestsByCenter(selectedCenter);
    }
  }, [selectedCenter]);

  const fetchCenters = async () => {
    try {
      const response = await fetch('/api/diagnostic-centers');
      if (response.ok) {
        const data = await response.json();
        setCenters(data.centers);
      }
    } catch (error) {
      console.error('Error fetching centers:', error);
    }
  };

  const fetchTestsByCenter = async (centerId: string) => {
    try {
      const response = await fetch(`/api/diagnostic-tests/center/${centerId}`);
      if (response.ok) {
        const data = await response.json();
        setTests(data.tests);
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCenter || !selectedTest || !date) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          center: selectedCenter,
          test: selectedTest,
          appointmentDate: date.toISOString(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Appointment Booked",
          description: "Your appointment has been successfully booked!",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Booking Failed",
          description: data.message || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <BackButton />
          <Card>
            <CardHeader>
              <CardTitle>Book Appointment</CardTitle>
              <CardDescription>Schedule your diagnostic test appointment</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="center">Diagnostic Center</Label>
                  <Select onValueChange={setSelectedCenter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a diagnostic center" />
                    </SelectTrigger>
                    <SelectContent>
                      {centers.map((center) => (
                        <SelectItem key={center._id} value={center._id}>
                          {center.name} - {center.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCenter && (
                  <div className="space-y-2">
                    <Label htmlFor="test">Diagnostic Test</Label>
                    <Select onValueChange={setSelectedTest}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a diagnostic test" />
                      </SelectTrigger>
                      <SelectContent>
                        {tests.map((test) => (
                          <SelectItem key={test._id} value={test._id}>
                            {test.name} - ₹{test.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Appointment Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Booking..." : "Book Appointment"}
                </Button>
              </CardContent>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;

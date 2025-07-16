import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, TestTube, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import BackButton from "@/components/BackButton";

interface DiagnosticTest {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  preparationInstructions: string;
  center: {
    _id: string;
    name: string;
  };
}

const DiagnosticTests = () => {
  const [tests, setTests] = useState<DiagnosticTest[]>([]);
  const [filteredTests, setFilteredTests] = useState<DiagnosticTest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();
  }, []);

  useEffect(() => {
    let filtered = tests.filter(test =>
      test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedCategory) {
      filtered = filtered.filter(test => test.category === selectedCategory);
    }

    setFilteredTests(filtered);
  }, [tests, searchTerm, selectedCategory]);

  const fetchTests = async () => {
    try {
      const response = await fetch('/api/diagnostic-tests');
      if (response.ok) {
        const data = await response.json();
        setTests(data.tests);
        setFilteredTests(data.tests);
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(tests.map(test => test.category))];

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
          <h1 className="text-3xl font-bold mb-4">Diagnostic Tests</h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === "" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("")}
              >
                All Categories
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => (
            <Card key={test._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    {test.name}
                  </CardTitle>
                  <Badge variant="secondary">{test.category}</Badge>
                </div>
                <CardDescription>{test.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">₹{test.price}</span>
                  </div>
                  <Badge variant="outline">{test.center.name}</Badge>
                </div>
                
                {test.preparationInstructions && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Preparation:</h4>
                    <p className="text-sm text-muted-foreground">{test.preparationInstructions}</p>
                  </div>
                )}
                
                <Link to="/appointments/book">
                  <Button className="w-full">Book This Test</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No diagnostic tests found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosticTests;

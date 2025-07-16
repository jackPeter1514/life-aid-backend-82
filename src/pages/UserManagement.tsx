import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, UserPlus, Settings, Shield, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BackButton from "@/components/BackButton";
import AddUserDialog from "@/components/AddUserDialog";
import EditUserDialog from "@/components/EditUserDialog";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token);
      console.log('Making request to /api/admin/users');
      
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('API response data:', data);
        console.log('Is array:', Array.isArray(data));
        // Check if data has users array or is direct array
        const usersArray = data.users || data;
        setUsers(Array.isArray(usersArray) ? usersArray : []);
      } else {
        const errorText = await response.text();
        console.log('API error response:', errorText);
        setUsers([]);
        toast({
          title: "Error",
          description: `Failed to load users: ${response.status}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setUsers([]);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    console.log('Delete user clicked for userId:', userId);
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('token');
      console.log('Making delete request for user:', userId);
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Delete response status:', response.status);
      console.log('Delete response ok:', response.ok);

      if (response.ok) {
        console.log('Delete successful, removing user from state');
        console.log('Current users before filter:', users.length);
        // Remove user from local state immediately for better UX
        setUsers(prevUsers => {
          const filteredUsers = prevUsers.filter(user => user._id !== userId);
          console.log('Users after filter:', filteredUsers.length);
          return filteredUsers;
        });
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
      } else {
        const errorText = await response.text();
        console.log('Delete failed with response:', errorText);
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin': return 'destructive';
      case 'admin': return 'default';
      case 'diagnostic_center_admin': return 'secondary';
      case 'patient': return 'outline';
      default: return 'outline';
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
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8" />
              User Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage users, roles, and permissions
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add New User
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <div className="grid gap-4">
          {filteredUsers.map((user) => (
            <Card key={user._id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      <Shield className="h-3 w-3 mr-1" />
                      {user.role.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                      <Settings className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteUser(user._id)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No users found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search criteria' : 'No users available'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <AddUserDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onUserAdded={fetchUsers}
      />
      
      <EditUserDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUserUpdated={fetchUsers}
        user={selectedUser}
      />
    </div>
  );
};

export default UserManagement;
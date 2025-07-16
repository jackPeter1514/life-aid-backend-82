import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Settings } from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface EditUserForm extends Partial<User> {
  password?: string;
}

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void | Promise<void>;
  user: User | null;
}

const EditUserDialog = ({ open, onOpenChange, onUserUpdated, user }: EditUserDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [editedUser, setEditedUser] = useState<EditUserForm>({});
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setEditedUser({
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editedUser),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "User updated successfully",
        });
        onUserUpdated();
        onOpenChange(false);
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to update user",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Edit User
          </DialogTitle>
          <DialogDescription>
            Update user information and role permissions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                type="text"
                value={editedUser.name || ""}
                onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editedUser.email || ""}
                onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select value={editedUser.role || ""} onValueChange={(value) => setEditedUser({ ...editedUser, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="diagnostic_center_admin">Diagnostic Center Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-password">Password (Optional)</Label>
              <Input
                id="edit-password"
                type="password"
                placeholder="Leave blank to keep current password"
                value={editedUser.password || ""}
                onChange={(e) => setEditedUser({ ...editedUser, password: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                Password must be at least 6 characters long
              </p>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-active">Active Status</Label>
              <Switch
                id="edit-active"
                checked={editedUser.isActive || false}
                onCheckedChange={(checked) => setEditedUser({ ...editedUser, isActive: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
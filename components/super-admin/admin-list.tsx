"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreVertical, Search, Eye, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Admin = {
  id: string;
  clerkId: string;
  name: string;
  email: string;
  role: string;
  lastActive: string;
};

type AdminListProps = {
  onSelectAdmin: (adminId: string | null) => void;
};

export function AdminList({ onSelectAdmin }: AdminListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/super-admin/get-admin");
        if (!res.ok) throw new Error("Failed to fetch admins");
        const data = await res.json();
        setAdmins(data.admins);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  const handleDeleteAdmin = (admin: Admin) => {
    setAdminToDelete(admin);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (adminToDelete) {
      try {
        const response = await fetch("/api/super-admin/get-admin", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: adminToDelete.id,
            clerkId: adminToDelete.clerkId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to delete admin");
        }

        setAdmins(admins.filter((admin) => admin.id !== adminToDelete.id));
      } catch (err: any) {
        setError(err.message || "Failed to delete admin");
      } finally {
        setDeleteDialogOpen(false);
        setAdminToDelete(null);
      }
    }
  };

  const filteredAdmins = admins.filter(
    (admin) =>
      (admin.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (admin.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search admins..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground">
            Loading admins...
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmins.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-6 text-muted-foreground"
                  >
                    No admins found matching your filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredAdmins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      {admin.lastActive &&
                      !isNaN(new Date(admin.lastActive).getTime())
                        ? formatDistanceToNow(new Date(admin.lastActive), {
                            addSuffix: true,
                          })
                        : "Never Active"}
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => onSelectAdmin(admin.id)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Activities
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteAdmin(admin)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Admin
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              admin account and remove their data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
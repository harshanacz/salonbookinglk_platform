"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminList } from "@/components/super-admin/admin-list";
import { ActivityLogs } from "@/components/super-admin/activity-logs";
import { AddAdminForm } from "@/components/super-admin/add-admin-form";
import { UserCog, Activity, UserPlus, LogOut } from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SuperAdminDashboard() {
  const [selectedAdmin, setSelectedAdmin] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="container w-full mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Super Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage admins and monitor their activities
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <SignOutButton redirectUrl="/">
            <Button
              variant="outline"
              className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
            >
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
          </SignOutButton>
        </div>
      </div>

      <Tabs defaultValue="admins" className="space-y-4">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 md:grid-cols-3">
          <TabsTrigger value="admins" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            <span className="hidden sm:inline">Admins</span>
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Activities</span>
          </TabsTrigger>
          <TabsTrigger value="add-admin" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Admin</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="admins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Admin Management</CardTitle>
              <CardDescription>
                View and manage all administrators in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminList onSelectAdmin={setSelectedAdmin} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>
                {selectedAdmin
                  ? `Viewing activities for selected admin`
                  : `View detailed activity logs for all admins`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityLogs adminId={selectedAdmin} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-admin" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Admin</CardTitle>
              <CardDescription>
                Create a new administrator account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddAdminForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

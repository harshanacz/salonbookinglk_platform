"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [deactivatePassword, setDeactivatePassword] = useState("");

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle password change logic here
    console.log("Password change submitted");
  };

  const handleDeactivate = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle deactivation logic here
    console.log("Account deactivation requested for:", email);
  };

  return (
    <div className="min-h-screen w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="password" className="w-full max-w-2xl">
        <TabsList>
          <TabsTrigger value="password">Change Password</TabsTrigger>
          <TabsTrigger value="deactivate">Deactivate Account</TabsTrigger>
        </TabsList>

        <TabsContent value="password">
          <div className="mt-6">
            <form onSubmit={handlePasswordChange}>
              <div className="space-y-4">
                <div className="grid grid-cols-3 items-center gap-4">
                  <label htmlFor="current-password" className="text-sm">
                    Current Password
                  </label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="col-span-2"
                  />
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <label htmlFor="new-password" className="text-sm">
                    New Password
                  </label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="col-span-2"
                  />
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <label htmlFor="confirm-password" className="text-sm">
                    Confirm Password
                  </label>
                  <div className="col-span-2">
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      8 characters or longer. Combine upper and lowercase
                      letters and numbers.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="deactivate">
          <div className="mt-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-red-600 font-medium mb-2">Warning</h3>
              <p className="text-sm text-red-600">
                Deactivating your account will remove your profile and all
                associated data. This action cannot be undone immediately. You
                will have 30 days to reactivate your account by logging in
                again.
              </p>
            </div>

            <form onSubmit={handleDeactivate}>
              <div className="space-y-4">
                <div className="grid grid-cols-3 items-center gap-4">
                  <label htmlFor="email" className="text-sm">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="col-span-2"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <label htmlFor="deactivate-password" className="text-sm">
                    Password
                  </label>
                  <Input
                    id="deactivate-password"
                    type="password"
                    value={deactivatePassword}
                    onChange={(e) => setDeactivatePassword(e.target.value)}
                    className="col-span-2"
                    required
                  />
                </div>

                <div className="flex justify-end mt-6">
                  <Button
                    type="submit"
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
                  >
                    Deactivate Account
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

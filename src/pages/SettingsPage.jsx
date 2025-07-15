"use client";

import { Badge } from "../components/ui/badge";

import { useState, useEffect } from "react";
import { Bell, CreditCard, Lock, User } from "lucide-react";

import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";
import { DashboardLayout } from "../components/Sidebar";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("account");
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?._id) return;
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/users/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch (err) {
        setError(
          err.response?.data?.error || "Failed to fetch profile information."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  // Helper to split name into first and last (first word and last word)
  const getFirstLast = (name = "") => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return ["", ""];
    if (parts.length === 1) return [parts[0], ""];
    return [parts[0], parts[parts.length - 1]];
  };

  // For form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [company, setCompany] = useState("");
  const [address, setAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
    country: "ng",
  });

  // Populate form fields when profile loads
  useEffect(() => {
    if (profile) {
      if (profile.name) {
        const [f, l] = getFirstLast(profile.name);
        setFirstName(f);
        setLastName(l);
      }
      setEmail(profile.email || "");
      setBio(profile.bio || "");
      setCompany(profile.company || "");
      setAddress({
        line1: profile.address?.line1 || "",
        line2: profile.address?.line2 || "",
        city: profile.address?.city || "",
        state: profile.address?.state || "",
        zip: profile.address?.zip || "",
        country: profile.address?.country || "ng",
      });
    }
  }, [profile]);

  const handleAddressChange = (field, value) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const name = [firstName, lastName].filter(Boolean).join(" ");
      const payload = {
        name,
        email,
        bio,
        company,
        address,
      };
      await axios.put(`/users/${user._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile((prev) => ({ ...prev, ...payload }));
      setUser((prev) => ({ ...prev, ...payload })); // Update AuthContext
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to update profile information."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <DashboardLayout>
        <div className="p-6">Loading...</div>
      </DashboardLayout>
    );
  if (error)
    return (
      <DashboardLayout>
        <div className="p-6 text-red-500">{error}</div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs
          defaultValue="account"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-64 flex-shrink-0">
              <TabsList className="flex flex-col h-auto p-0 bg-transparent">
                <TabsTrigger
                  value="account"
                  className={`justify-start px-4 py-2 ${
                    activeTab === "account" ? "bg-gray-100" : "hover:bg-gray-50"
                  }`}
                >
                  <User className="mr-2 h-4 w-4" />
                  Account
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className={`justify-start px-4 py-2 ${
                    activeTab === "notifications"
                      ? "bg-gray-100"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger
                  value="billing"
                  className={`justify-start px-4 py-2 ${
                    activeTab === "billing" ? "bg-gray-100" : "hover:bg-gray-50"
                  }`}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className={`justify-start px-4 py-2 ${
                    activeTab === "security"
                      ? "bg-gray-100"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Security
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1">
              <TabsContent value="account" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>
                      Update your account details and profile information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="space-y-2 flex-1">
                          <Label htmlFor="first-name">First name</Label>
                          <Input
                            id="first-name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2 flex-1">
                          <Label htmlFor="last-name">Last name</Label>
                          <Input
                            id="last-name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company">Company (optional)</Label>
                        <Input
                          id="company"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell us about yourself"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="min-h-32"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select defaultValue="africa-lagos">
                          <SelectTrigger id="timezone">
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="africa-lagos">
                              West Africa Time (Nigeria)
                            </SelectItem>
                            <SelectItem value="america-los_angeles">
                              Pacific Time (US & Canada)
                            </SelectItem>
                            <SelectItem value="america-new_york">
                              Eastern Time (US & Canada)
                            </SelectItem>
                            <SelectItem value="america-chicago">
                              Central Time (US & Canada)
                            </SelectItem>
                            <SelectItem value="europe-london">
                              London
                            </SelectItem>
                            <SelectItem value="europe-paris">Paris</SelectItem>
                            <SelectItem value="asia-tokyo">Tokyo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button
                      className="bg-cyan-500 hover:bg-cyan-600"
                      onClick={handleSave}
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Profile Picture</CardTitle>
                    <CardDescription>
                      Upload a profile picture for your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row items-start gap-6">
                      <div className="flex-shrink-0">
                        <div className="relative h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border">
                          <span className="text-2xl font-medium text-gray-600">
                            JD
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="profile-picture">
                            Upload new picture
                          </Label>
                          <Input id="profile-picture" type="file" />
                        </div>
                        <p className="text-xs text-gray-500">
                          Recommended: Square image, at least 300x300px. Max
                          file size: 2MB.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <div className="flex gap-2">
                      <Button variant="outline">Remove</Button>
                      <Button className="bg-cyan-500 hover:bg-cyan-600">
                        Upload
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Choose how and when you want to be notified
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Email Notifications
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-base">Event Reminders</Label>
                            <p className="text-sm text-gray-500">
                              Receive reminders about upcoming events
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-base">Ticket Sales</Label>
                            <p className="text-sm text-gray-500">
                              Get notified when tickets are sold
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-base">Event Updates</Label>
                            <p className="text-sm text-gray-500">
                              Receive updates about events you're managing
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-base">Marketing</Label>
                            <p className="text-sm text-gray-500">
                              Receive marketing emails and newsletters
                            </p>
                          </div>
                          <Switch />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Push Notifications
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-base">Event Reminders</Label>
                            <p className="text-sm text-gray-500">
                              Receive push notifications for upcoming events
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-base">Ticket Sales</Label>
                            <p className="text-sm text-gray-500">
                              Get push notifications for ticket sales
                            </p>
                          </div>
                          <Switch />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Notification Frequency
                      </h3>
                      <RadioGroup defaultValue="daily">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="realtime" id="realtime" />
                          <Label htmlFor="realtime">Real-time</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="daily" id="daily" />
                          <Label htmlFor="daily">Daily digest</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="weekly" id="weekly" />
                          <Label htmlFor="weekly">Weekly digest</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button className="bg-cyan-500 hover:bg-cyan-600">
                      Save Preferences
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="billing" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Billing Information</CardTitle>
                    <CardDescription>
                      Manage your billing details and payment methods
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Current Plan</h3>
                      <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Professional Plan</p>
                            <p className="text-sm text-gray-500">
                              ₦74,985/month
                            </p>
                          </div>
                          <Badge className="bg-cyan-100 text-cyan-800 hover:bg-cyan-100">
                            Active
                          </Badge>
                        </div>
                        <div className="mt-4">
                          <p className="text-sm text-gray-500">
                            Next billing date: July 1, 2025
                          </p>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button variant="outline" size="sm">
                            Change Plan
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            Cancel Subscription
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Payment Methods</h3>
                        <Button variant="outline" size="sm">
                          Add Payment Method
                        </Button>
                      </div>
                      <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-16 items-center justify-center rounded-md border bg-white">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-6 w-6 text-blue-600"
                              >
                                <rect
                                  width="20"
                                  height="14"
                                  x="2"
                                  y="5"
                                  rx="2"
                                />
                                <line x1="2" x2="22" y1="10" y2="10" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium">Visa ending in 4242</p>
                              <p className="text-sm text-gray-500">
                                Expires 12/2026
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Billing Address</h3>
                      <div className="space-y-2">
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="space-y-2 flex-1">
                            <Label htmlFor="address-line1">
                              Address Line 1
                            </Label>
                            <Input
                              id="address-line1"
                              value={address.line1}
                              onChange={(e) =>
                                handleAddressChange("line1", e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-2 flex-1">
                            <Label htmlFor="address-line2">
                              Address Line 2
                            </Label>
                            <Input
                              id="address-line2"
                              value={address.line2}
                              onChange={(e) =>
                                handleAddressChange("line2", e.target.value)
                              }
                            />
                          </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="space-y-2 flex-1">
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              value={address.city}
                              onChange={(e) =>
                                handleAddressChange("city", e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-2 flex-1">
                            <Label htmlFor="state">State</Label>
                            <Input
                              id="state"
                              value={address.state}
                              onChange={(e) =>
                                handleAddressChange("state", e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-2 flex-1">
                            <Label htmlFor="zip">ZIP Code</Label>
                            <Input
                              id="zip"
                              value={address.zip}
                              onChange={(e) =>
                                handleAddressChange("zip", e.target.value)
                              }
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Select
                            value={address.country}
                            onValueChange={(v) =>
                              handleAddressChange("country", v)
                            }
                          >
                            <SelectTrigger id="country">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ng">Nigeria</SelectItem>
                              <SelectItem value="us">United States</SelectItem>
                              <SelectItem value="ca">Canada</SelectItem>
                              <SelectItem value="uk">United Kingdom</SelectItem>
                              <SelectItem value="au">Australia</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button className="bg-cyan-500 hover:bg-cyan-600">
                      Save Billing Information
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Manage your account security and authentication
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Change Password</h3>
                      <div className="space-y-2">
                        <Label htmlFor="current-password">
                          Current Password
                        </Label>
                        <Input id="current-password" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">
                          Confirm New Password
                        </Label>
                        <Input id="confirm-password" type="password" />
                      </div>
                      <Button className="bg-cyan-500 hover:bg-cyan-600">
                        Update Password
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">
                          Two-Factor Authentication
                        </h3>
                        <Switch />
                      </div>
                      <p className="text-sm text-gray-500">
                        Add an extra layer of security to your account by
                        requiring a verification code in addition to your
                        password when you sign in.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Login Sessions</h3>
                      <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Current Session</p>
                            <p className="text-sm text-gray-500">
                              Lagos, Nigeria • Chrome on macOS
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Started: June 4, 2025, 5:30 PM
                            </p>
                          </div>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Active
                          </Badge>
                        </div>
                      </div>
                      <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Previous Session</p>
                            <p className="text-sm text-gray-500">
                              Abuja, Nigeria • Safari on iOS
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Last active: June 2, 2025, 10:15 AM
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                          >
                            Revoke
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Account Deletion</h3>
                      <p className="text-sm text-gray-500">
                        Permanently delete your account and all associated data.
                        This action cannot be undone.
                      </p>
                      <Button
                        variant="outline"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </div>
        </Tabs>
        {error && <div className="text-red-600 mb-2">{error}</div>}
      </div>
    </DashboardLayout>
  );
}

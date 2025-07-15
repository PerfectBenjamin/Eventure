import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Eye, EyeOff, Mail, User, Lock } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { cn } from "../utils/cn";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userRole, setUserRole] = useState("attendee");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "attendee",
    organizationName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // const [success, setSuccess] = useState(""); // removed unused variable

  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleRoleChange = (role) => {
    setUserRole(role);
    setForm({ ...form, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    // setSuccess(""); // removed unused variable
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.role === "organizer" && !form.organizationName.trim()) {
      setError("Organization Name is required for organizers");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      };
      if (form.role === "organizer") {
        payload.organizationName = form.organizationName;
      }
      await axios.post("/users", payload);
      // Automatically sign in after successful sign up
      const loginRes = await axios.post("/users/login", {
        email: form.email,
        password: form.password,
      });
      localStorage.setItem("token", loginRes.data.token);
      setUser(loginRes.data.user);
      // Redirect based on role
      const role = loginRes.data.user.role;
      if (role === "organizer") navigate("/");
      else if (role === "attendee") navigate("/browse-events");
      else if (role === "admin") navigate("/admin");
      else navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          (err.response?.data?.errors
            ? err.response.data.errors[0].msg
            : "Sign up failed")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-row">
      {/* Left side - Illustration */}
      <div className="hidden md:flex md:w-1/2 h-screen bg-gradient-to-br from-cyan-500 to-blue-600 items-center justify-center p-10">
        <div className="max-w-md text-center">
          <div className="flex justify-center mb-8">
            <div className="rounded-full bg-white/10 p-6 backdrop-blur-sm">
              <Calendar className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-6">
            Welcome to Eventure
          </h1>
          <p className="text-white/90 text-lg mb-8">
            Join our platform to discover, create, and manage events that matter
            to you.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-medium text-white mb-1">Discover Events</h3>
              <p className="text-white/80 text-sm">
                Find events that match your interests
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-medium text-white mb-1">Create Events</h3>
              <p className="text-white/80 text-sm">
                Host and manage your own events
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-medium text-white mb-1">Track Tickets</h3>
              <p className="text-white/80 text-sm">
                Manage all your tickets in one place
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-medium text-white mb-1">Analytics</h3>
              <p className="text-white/80 text-sm">
                Get insights on your event performance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex flex-1 md:w-1/2 h-screen items-center justify-center p-6 md:p-10 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500 mr-2">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">Eventure</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/sign-in"
                className="font-medium text-cyan-600 hover:text-cyan-500"
              >
                Sign in
              </Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="name"
                    placeholder="John Doe"
                    className="pl-10"
                    required
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className="pl-10"
                    required
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10"
                    required
                    value={form.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10"
                    required
                    value={form.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <Label>I want to join as</Label>
                <RadioGroup
                  defaultValue="attendee"
                  value={userRole}
                  onValueChange={handleRoleChange}
                  className="grid grid-cols-3 gap-4"
                >
                  <div>
                    <RadioGroupItem
                      value="attendee"
                      id="attendee"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="attendee"
                      className={cn(
                        "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-cyan-500 [&:has([data-state=checked])]:border-cyan-500 cursor-pointer",
                        userRole === "attendee" && "border-cyan-500"
                      )}
                    >
                      <User className="mb-2 h-5 w-5" />
                      <span className="text-sm font-medium">Attendee</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value="organizer"
                      id="organizer"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="organizer"
                      className={cn(
                        "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-cyan-500 [&:has([data-state=checked])]:border-cyan-500 cursor-pointer",
                        userRole === "organizer" && "border-cyan-500"
                      )}
                    >
                      <Calendar className="mb-2 h-5 w-5" />
                      <span className="text-sm font-medium">Organizer</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              {/* After the role selection, show Organization Name input if role is organizer */}
              {userRole === "organizer" && (
                <div className="space-y-2">
                  <Label htmlFor="organizationName">Organization Name</Label>
                  <div className="relative">
                    <Input
                      id="organizationName"
                      placeholder="Your Organization"
                      className="pl-4"
                      required
                      value={form.organizationName}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}
            </div>
            {/* Error/Success messages */}
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                  required
                />
                <label
                  htmlFor="terms"
                  className="ml-2 block text-sm text-gray-600"
                >
                  I agree to the{" "}
                  <button
                    type="button"
                    className="font-medium text-cyan-600 hover:text-cyan-500 underline"
                    onClick={() => alert("Show Terms of Service")}
                  >
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    className="font-medium text-cyan-600 hover:text-cyan-500 underline"
                    onClick={() => alert("Show Privacy Policy")}
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-cyan-500 hover:bg-cyan-600"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </div>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="w-full">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
            <Button variant="outline" className="w-full">
              <svg
                className="mr-2 h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
              Facebook
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

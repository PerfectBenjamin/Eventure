"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Eye,
  EyeOff,
  Mail,
  Lock,
  BarChart3,
  Ticket,
  Globe,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("/users/login", {
        email: form.email,
        password: form.password,
      });
      localStorage.setItem("token", res.data.token);
      setUser({ ...res.data.user, token: res.data.token }); // update context with token
      // Redirect based on role
      const role = res.data.user.role;
      if (role === "organizer") navigate("/");
      else if (role === "attendee") navigate("/browse-events");
      else if (role === "admin") navigate("/admin");
      else navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          (err.response?.data?.errors
            ? err.response.data.errors[0].msg
            : "Sign in failed")
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
          <h1 className="text-3xl font-bold text-white mb-6">Welcome Back</h1>
          <p className="text-white/90 text-lg mb-8">
            Sign in to continue managing your events and discovering new
            experiences.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Globe className="h-6 w-6 text-white mb-2 mx-auto" />
              <h3 className="font-medium text-white mb-1">Discover</h3>
              <p className="text-white/80 text-sm">Browse amazing events</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Calendar className="h-6 w-6 text-white mb-2 mx-auto" />
              <h3 className="font-medium text-white mb-1">Manage</h3>
              <p className="text-white/80 text-sm">Control your events</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Ticket className="h-6 w-6 text-white mb-2 mx-auto" />
              <h3 className="font-medium text-white mb-1">Tickets</h3>
              <p className="text-white/80 text-sm">Access all your tickets</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <BarChart3 className="h-6 w-6 text-white mb-2 mx-auto" />
              <h3 className="font-medium text-white mb-1">Analytics</h3>
              <p className="text-white/80 text-sm">Track performance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex flex-1 md:w-1/2 h-screen items-center justify-center p-6 md:p-10 bg-white overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500 mr-2">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">Eventure</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/sign-up"
                className="font-medium text-cyan-600 hover:text-cyan-500"
              >
                Sign up
              </Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-cyan-600 hover:text-cyan-500"
                  >
                    Forgot password?
                  </Link>
                </div>
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
            </div>
            {/* Error/Success messages */}
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-600"
              >
                Remember me
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-600"
              disabled={loading}
            >
              {loading ? "Logging In..." : "Log In"}
            </Button>
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

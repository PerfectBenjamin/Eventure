import React, { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import axios from "../api/axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await axios.post("/users/forgot-password", { email });
      setMessage(
        "If an account with that email exists, a password reset link has been sent."
      );
    } catch (err) {
      setError(
        err.response?.data?.error ||
          (err.response?.data?.errors
            ? err.response.data.errors[0].msg
            : "Something went wrong.")
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
              <Mail className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-6">
            Forgot your password?
          </h1>
          <p className="text-white/90 text-lg mb-8">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>
      </div>
      {/* Right side - Form */}
      <div className="flex flex-1 md:w-1/2 h-screen items-center justify-center p-6 md:p-10 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500 mr-2">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">Eventure</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Forgot Password
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email to receive a password reset link.
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {message && <div className="text-green-600 text-sm">{message}</div>}
            <Button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-600"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

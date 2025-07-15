import React, { useState } from "react";
import {
  Bell,
  Calendar,
  ChevronDown,
  Home,
  LineChart,
  LogOut,
  Plus,
  Search,
  Settings,
  Shield,
  Ticket,
  Users,
  BarChart3,
  Menu,
  X,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "../utils/cn";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "./ui/sidebar";
import { useAuth } from "../context/AuthContext";

// User role type
const UserRole = {
  ATTENDEE: "attendee",
  ORGANIZER: "organizer",
  ADMIN: "admin",
};

// Sidebar items based on user role
const getSidebarItems = (role) => {
  switch (role) {
    case UserRole.ATTENDEE:
      return [
        { icon: Home, label: "Events", href: "/browse-events" },
        { icon: Ticket, label: "My Tickets", href: "/my-tickets" },
        { icon: Settings, label: "Settings", href: "/settings" }, // Added settings for attendee
      ];
    case UserRole.ORGANIZER:
      return [
        { icon: Home, label: "Events", href: "/" },
        { icon: Calendar, label: "My Events", href: "/my-events" },
        { icon: Plus, label: "Create Event", href: "/create-event" },
        { icon: Ticket, label: "Tickets", href: "/tickets" },
        { icon: LineChart, label: "Analytics", href: "/analytics" },
        { icon: Settings, label: "Settings", href: "/settings" },
      ];
    case UserRole.ADMIN:
      return [
        { icon: Shield, label: "Admin Panel", href: "/admin" },
        { icon: Users, label: "Manage Users", href: "/admin/users" },
        {
          icon: BarChart3,
          label: "System Analytics",
          href: "/admin/analytics",
        },
        { icon: Settings, label: "Settings", href: "/settings" },
      ];
    default:
      return [];
  }
};

// Role badge styling
const getRoleBadge = (role) => {
  switch (role) {
    case UserRole.ATTENDEE:
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          Attendee
        </Badge>
      );
    case UserRole.ORGANIZER:
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          Organizer
        </Badge>
      );
    case UserRole.ADMIN:
      return (
        <Badge
          variant="outline"
          className="bg-purple-50 text-purple-700 border-purple-200"
        >
          Admin
        </Badge>
      );
    default:
      return null;
  }
};

// Mobile close button component
const MobileCloseButton = () => {
  const { setIsOpen } = useSidebar();

  return (
    <button
      className="md:hidden p-1 rounded-md hover:bg-gray-100"
      onClick={() => setIsOpen(false)}
    >
      <X className="h-5 w-5" />
    </button>
  );
};

// Mobile menu item component that closes sidebar on click
const MobileMenuItem = ({ item, isActive, location }) => {
  const { setIsOpen } = useSidebar();

  const handleClick = () => {
    // Close sidebar on mobile when clicking a menu item
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} onClick={handleClick}>
        <Link to={item.href}>
          <item.icon
            className={cn(
              "h-5 w-5",
              isActive ? "text-cyan-700" : "text-gray-700"
            )}
          />
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export function DashboardLayout({ children }) {
  const location = useLocation();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const currentUserRole = user?.role || UserRole.ORGANIZER;

  const currentUser = {
    name: user?.name || "",
    email: user?.email || "",
    role: currentUserRole,
    avatar: user?.profilePicture || "/placeholder.svg?height=32&width=32",
  };

  const sidebarItems = getSidebarItems(currentUser.role);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    navigate("/sign-in");
  };

  // Only show FAB on dashboard page
  const showFab =
    location.pathname === "/" && currentUser.role === UserRole.ORGANIZER;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <Sidebar className="border-r">
          <SidebarHeader className="border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">
                  Eventure
                </span>
              </div>
              {/* Close button for mobile */}
              <MobileCloseButton />
            </div>
          </SidebarHeader>

          <SidebarContent className="px-4 py-6">
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <MobileMenuItem
                  key={item.label}
                  item={item}
                  isActive={location.pathname === item.href}
                  location={location}
                />
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-cyan-100 text-cyan-700">
                  {currentUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentUser.name}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500 truncate">
                    {currentUser.email}
                  </p>
                  {getRoleBadge(currentUser.role)}
                </div>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <SidebarInset className="flex-1 md:ml-64 overflow-x-hidden">
          {/* Top Navigation */}
          <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-16 items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden">
                  <Menu className="h-5 w-5" />
                </SidebarTrigger>

                {/* Search Bar */}
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search events..."
                      className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Right side items */}
              <div className="flex items-center gap-3">
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500 flex items-center justify-center">
                    3
                  </Badge>
                </Button>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 px-3"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={currentUser.avatar || "/placeholder.svg"}
                        />
                        <AvatarFallback className="bg-cyan-100 text-cyan-700">
                          {currentUser.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {currentUser.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {currentUser.email}
                        </p>
                        <div className="pt-1">
                          {getRoleBadge(currentUser.role)}
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main Dashboard Content */}
          <main className="flex-1 p-6">{children}</main>
        </SidebarInset>

        {/* Floating Action Button - only show for organizers on dashboard */}
        {showFab && (
          <Button
            size="icon"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-cyan-500 hover:bg-cyan-600 shadow-lg hover:shadow-xl transition-all md:hidden"
            onClick={() => navigate("/create-event")}
          >
            <Plus className="h-6 w-6" />
          </Button>
        )}
      </div>
    </SidebarProvider>
  );
}

export default DashboardLayout;

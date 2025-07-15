"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";
import {
  Calendar,
  Download,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  Users,
  Ticket,
  BarChart3,
} from "lucide-react";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import DashboardLayout from "../features/dashboard/DashboardLayout";

// Sample event data
const events = [
  {
    id: 1,
    title: "Tech Innovation Summit 2025",
    date: "March 15, 2025",
    time: "9:00 AM - 6:00 PM",
    location: "Eko Convention Centre, Lagos",
    attendees: 1250,
    status: "upcoming",
    ticketsSold: 980,
    revenue: "₦73,500,000",
  },
  {
    id: 2,
    title: "Product Launch Celebration",
    date: "March 22, 2025",
    time: "7:00 PM - 10:00 PM",
    location: "The Grand Ballroom, Abuja",
    attendees: 350,
    status: "upcoming",
    ticketsSold: 320,
    revenue: "₦24,000,000",
  },
  {
    id: 3,
    title: "Annual Charity Gala",
    date: "April 5, 2025",
    time: "6:30 PM - 11:00 PM",
    location: "Riverside Gardens, Port Harcourt",
    attendees: 500,
    status: "upcoming",
    ticketsSold: 450,
    revenue: "₦33,750,000",
  },
  {
    id: 4,
    title: "Digital Marketing Workshop",
    date: "April 12, 2025",
    time: "10:00 AM - 4:00 PM",
    location: "Business Hub, Kano",
    attendees: 85,
    status: "upcoming",
    ticketsSold: 75,
    revenue: "₦11,250,000",
  },
  {
    id: 5,
    title: "Summer Music Festival",
    date: "June 20-22, 2025",
    time: "All Day Event",
    location: "Central Park, Calabar",
    attendees: 5000,
    status: "upcoming",
    ticketsSold: 3200,
    revenue: "₦240,000,000",
  },
  {
    id: 6,
    title: "Networking Mixer",
    date: "April 28, 2025",
    time: "6:00 PM - 9:00 PM",
    location: "Rooftop Lounge, Enugu",
    attendees: 120,
    status: "upcoming",
    ticketsSold: 110,
    revenue: "₦8,250,000",
  },
  {
    id: 7,
    title: "Web Development Conference",
    date: "February 15, 2025",
    time: "9:00 AM - 5:00 PM",
    location: "Tech Center, Ibadan",
    attendees: 450,
    status: "past",
    ticketsSold: 430,
    revenue: "₦32,250,000",
  },
  {
    id: 8,
    title: "Leadership Summit",
    date: "January 28, 2025",
    time: "10:00 AM - 4:00 PM",
    location: "Executive Center, Kaduna",
    attendees: 200,
    status: "past",
    ticketsSold: 195,
    revenue: "₦29,250,000",
  },
  {
    id: 9,
    title: "Design Workshop",
    date: "January 10, 2025",
    time: "9:00 AM - 3:00 PM",
    location: "Creative Studio, Jos",
    attendees: 75,
    status: "past",
    ticketsSold: 72,
    revenue: "₦10,800,000",
  },
];

export default function MyEventsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("/api/events/");
        setEvents(res.data);
      } catch (err) {
        setError("Failed to load events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Filter events to only those organized by the signed-in user
  const myEvents = events.filter((event) => event.organizer === user?._id);

  // Filter events based on active tab and search query
  const filteredEvents = myEvents.filter((event) => {
    const matchesTab = activeTab === "all" || event.status === activeTab;
    const matchesSearch = event.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

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
          <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
          <p className="text-gray-600">
            Manage and track all your events in one place
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Events
              </CardTitle>
              <Calendar className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-gray-500 mt-1">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Attendees
              </CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7,305</div>
              <p className="text-xs text-gray-500 mt-1">
                +8.2% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Tickets Sold
              </CardTitle>
              <Ticket className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,429</div>
              <p className="text-xs text-gray-500 mt-1">
                +15.3% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Revenue
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦134,130,000</div>
              <p className="text-xs text-gray-500 mt-1">
                +18.7% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          {/* Filters and Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 z-10" />
                <Input
                  placeholder="Search events..."
                  className="pl-10 border-gray-200 bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filter Events</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <p className="mb-2 text-xs font-medium text-gray-500">
                      Event Type
                    </p>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="conference">Conference</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="networking">Networking</SelectItem>
                        <SelectItem value="concert">Concert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-2">
                    <p className="mb-2 text-xs font-medium text-gray-500">
                      Date Range
                    </p>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="quarter">This Quarter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DropdownMenuSeparator />
                  <div className="p-2 flex justify-between">
                    <Button variant="outline" size="sm">
                      Reset
                    </Button>
                    <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600">
                      Apply
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Date (Newest First)</DropdownMenuItem>
                  <DropdownMenuItem>Date (Oldest First)</DropdownMenuItem>
                  <DropdownMenuItem>Title (A-Z)</DropdownMenuItem>
                  <DropdownMenuItem>Attendees (High-Low)</DropdownMenuItem>
                  <DropdownMenuItem>Revenue (High-Low)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600">
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            defaultValue="all"
            className="w-full"
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
              <TabsTrigger value="all">All Events</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
            <Separator className="my-4" />

            <TabsContent value="all" className="mt-0">
              <EventsList events={filteredEvents} />
            </TabsContent>
            <TabsContent value="upcoming" className="mt-0">
              <EventsList events={filteredEvents} />
            </TabsContent>
            <TabsContent value="past" className="mt-0">
              <EventsList events={filteredEvents} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}

function EventsList({ events }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
          <Calendar className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No events found</h3>
          <p className="text-gray-500 mt-1">
            Try adjusting your search or filter to find what you're looking for.
          </p>
        </div>
      ) : (
        events.map((event) => {
          // Helper to format date
          let dateStr = "";
          if (typeof event.date === "string") {
            dateStr = event.date;
          } else if (event.date && event.date.startDate) {
            const start = new Date(event.date.startDate);
            dateStr = start.toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            if (
              event.date.endDate &&
              event.date.endDate !== event.date.startDate
            ) {
              const end = new Date(event.date.endDate);
              dateStr +=
                " - " +
                end.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });
            }
          }
          // Helper to format location
          let locationStr = "";
          if (typeof event.location === "string") {
            locationStr = event.location;
          } else if (event.location && typeof event.location === "object") {
            locationStr = event.location.venue || "";
            if (event.location.address) {
              const addr = event.location.address;
              const addrParts = [
                addr.street,
                addr.city,
                addr.state,
                addr.zipCode,
                addr.country ? addr.country.toUpperCase() : undefined,
              ].filter(Boolean);
              if (addrParts.length) {
                locationStr += (locationStr ? ", " : "") + addrParts.join(", ");
              }
            }
          }
          // Helper to format time
          let timeStr = "";
          if (event.time) {
            timeStr = event.time;
          } else if (event.startTime && event.endTime) {
            timeStr = `${event.startTime} - ${event.endTime}`;
          } else if (event.date && event.date.startDate) {
            const start = new Date(event.date.startDate);
            const end = event.date.endDate
              ? new Date(event.date.endDate)
              : null;
            if (end && start.getTime() === end.getTime()) {
              // Same start and end
              if (start.getHours() === 0 && start.getMinutes() === 0) {
                timeStr = "All Day Event";
              } else {
                timeStr = start.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
              }
            } else if (end) {
              // Range
              const startTime = start.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              const endTime = end.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              timeStr = `${startTime} - ${endTime}`;
            } else {
              // Only start
              if (start.getHours() === 0 && start.getMinutes() === 0) {
                timeStr = "All Day Event";
              } else {
                timeStr = start.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
              }
            }
          }
          return (
            <Card
              key={event.id || event._id}
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {event.title}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Calendar className="mr-1 h-3 w-3" />
                      {dateStr}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit Event</DropdownMenuItem>
                      <DropdownMenuItem>View Attendees</DropdownMenuItem>
                      <DropdownMenuItem>Manage Tickets</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        Cancel Event
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2 text-gray-400">🕐</span>
                    <span>{timeStr}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2 text-gray-400">📍</span>
                    <span className="line-clamp-1">{locationStr}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="rounded-md bg-gray-50 p-2">
                      <p className="text-xs text-gray-500">Tickets Sold</p>
                      <p className="text-sm font-medium">{event.ticketsSold}</p>
                    </div>
                    <div className="rounded-md bg-gray-50 p-2">
                      <p className="text-xs text-gray-500">Revenue</p>
                      <p className="text-sm font-medium">{event.revenue}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Badge
                  variant={
                    event.status === "upcoming" ? "default" : "secondary"
                  }
                  className="capitalize"
                >
                  {event.status}
                </Badge>
                <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600">
                  Manage
                </Button>
              </CardFooter>
            </Card>
          );
        })
      )}
    </div>
  );
}

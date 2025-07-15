"use client";

import { useState, useEffect } from "react";
import { Calendar, Filter, MapPin, Search, Users } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
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
import DashboardLayoutWrapper from "../components/dashboard-layout";
import axios from "../api/axios";

export default function BrowseEventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (typeof event.location === "string"
        ? event.location.toLowerCase().includes(searchQuery.toLowerCase())
        : "");
    const matchesCategory =
      selectedCategory === "all" ||
      (event.category && event.category.toLowerCase() === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div className="p-8 text-center">Loading events...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  // Helper to format date
  function formatEventDate(event) {
    if (event.date && event.date.startDate) {
      const start = new Date(event.date.startDate);
      if (event.date.endDate) {
        const end = new Date(event.date.endDate);
        if (start.toDateString() === end.toDateString()) {
          // Single day event
          return start.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        } else {
          // Multi-day event
          return `${start.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })} - ${end.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}`;
        }
      }
      return start.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    return event.date || "-";
  }
  // Helper to format time
  function formatEventTime(event) {
    if (event.time) return event.time;
    if (event.startTime && event.endTime)
      return `${event.startTime} - ${event.endTime}`;
    if (event.date && event.date.startDate) {
      const start = new Date(event.date.startDate);
      if (event.date.endDate) {
        const end = new Date(event.date.endDate);
        // All day event if both times are midnight
        if (
          start.getHours() === 0 &&
          start.getMinutes() === 0 &&
          end.getHours() === 0 &&
          end.getMinutes() === 0 &&
          start.getTime() !== end.getTime()
        ) {
          return "All Day Event";
        }
        // If same start and end
        if (start.getTime() === end.getTime()) {
          if (start.getHours() === 0 && start.getMinutes() === 0)
            return "All Day Event";
          return start.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
        }
        // Otherwise, show time range
        return `${start.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })} - ${end.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      }
      // Only startDate
      if (start.getHours() === 0 && start.getMinutes() === 0)
        return "All Day Event";
      return start.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return "-";
  }

  return (
    <DashboardLayoutWrapper>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600">Discover exciting events</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search events..."
                className="pl-10 bg-gray-50 border-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="networking">Networking</SelectItem>
                <SelectItem value="charity">Charity</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Date (Soonest First)</DropdownMenuItem>
                <DropdownMenuItem>Price (Low to High)</DropdownMenuItem>
                <DropdownMenuItem>Price (High to Low)</DropdownMenuItem>
                <DropdownMenuItem>Most Popular</DropdownMenuItem>
                <DropdownMenuItem>Highest Rated</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Link
              key={event._id || event.id}
              to={`/events/${event._id || event.id}`}
              className="block group"
              style={{ textDecoration: "none" }}
            >
              <Card className="overflow-hidden shadow-sm hover:shadow-lg transition-shadow rounded-lg flex flex-col h-full group-hover:ring-2 group-hover:ring-cyan-400 group-hover:ring-offset-2 cursor-pointer">
                {/* Banner Image */}
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={event.bannerImage || event.image || "/placeholder.svg"}
                    alt={event.title}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://placehold.co/600x200?text=Event+Image";
                    }}
                  />
                  {/* Fade effect overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to bottom, rgba(255,255,255,0) 60%, #fff 100%)",
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-white/90 text-gray-800 hover:bg-white/90">
                      {event.category}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col flex-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {event.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                      <span>{formatEventDate(event)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2 text-gray-400">🕐</span>
                      <span>{formatEventTime(event)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                      <span className="line-clamp-1">
                        {event.location && typeof event.location === "object"
                          ? [
                              event.location.venue,
                              event.location.address?.street,
                              event.location.address?.city,
                              event.location.address?.state,
                              event.location.address?.country,
                            ]
                              .filter(Boolean)
                              .join(", ")
                          : event.location || "-"}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 flex items-center justify-between mt-auto">
                    <div className="flex items-center text-gray-600 text-sm">
                      <Users className="mr-2 h-4 w-4 text-gray-400" />
                      <span>
                        {typeof event.capacity === "number"
                          ? event.capacity.toLocaleString()
                          : event.availableTickets &&
                            typeof event.availableTickets.total === "number"
                          ? event.availableTickets.total.toLocaleString()
                          : "0"}{" "}
                        capacity
                      </span>
                    </div>
                    <div className="text-lg font-bold text-cyan-600">
                      {(() => {
                        if (event.price && typeof event.price === "object") {
                          if (event.price.amount === 0) return "Free";
                          if (event.price.amount)
                            return `${event.price.currency || "₦"}${Number(
                              event.price.amount
                            ).toLocaleString()}`;
                          return "-";
                        }
                        if (typeof event.price === "string") return event.price;
                        return "-";
                      })()}
                    </div>
                  </CardFooter>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              No events found
            </h3>
            <p className="text-gray-500 mt-1">
              Try adjusting your search or filter to find what you're looking
              for.
            </p>
          </div>
        )}
      </div>
    </DashboardLayoutWrapper>
  );
}

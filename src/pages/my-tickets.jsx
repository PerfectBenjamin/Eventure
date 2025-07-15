"use client";

import { useState, useEffect } from "react";
import { Calendar, Download, QrCode, Search, MapPin } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import DashboardLayout from "../components/dashboard-layout";
import { QRCodeSVG } from "qrcode.react";
import { X } from "lucide-react";

export default function MyTickets() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await axios.get("/api/tickets");
        // Only show tickets belonging to the current user
        const myTickets = res.data.filter(
          (ticket) => ticket.user === user?._id
        );
        setTickets(myTickets);
      } catch (err) {
        setError("Failed to load tickets");
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) fetchTickets();
  }, [user]);

  // Map backend ticket data to UI format
  const mappedTickets = tickets.map((ticket) => ({
    id: ticket.ticketNumber,
    eventTitle: ticket.event?.title || ticket.eventTitle || "Event",
    // Use event.date.startDate for eventDate
    eventDate: ticket.event?.date?.startDate
      ? new Date(ticket.event.date.startDate).toLocaleString()
      : "",
    eventTime: ticket.event?.time || "",
    location: ticket.event?.location?.venue || ticket.event?.location || "",
    ticketType: ticket.ticketType,
    price: ticket.totalPrice?.amount
      ? `₦${ticket.totalPrice.amount.toLocaleString()}`
      : "Free",
    status: ticket.status,
    qrCode: ticket.ticketCode,
    // Use event.image for bannerImage
    bannerImage: ticket.event?.image || "",
    eventEndDate: ticket.event?.date?.endDate
      ? new Date(ticket.event.date.endDate)
      : null,
  }));

  const now = new Date();
  const filteredTickets = mappedTickets.filter((ticket) => {
    const matchesSearch =
      ticket.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.location.toLowerCase().includes(searchQuery.toLowerCase());

    const isUpcoming = ticket.eventEndDate ? ticket.eventEndDate > now : false;
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "upcoming" &&
        isUpcoming &&
        ticket.status === "confirmed") ||
      (activeTab === "past" && (!isUpcoming || ticket.status === "attended"));

    return matchesSearch && matchesTab;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">Loading...</div>
      </DashboardLayout>
    );
  }
  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6 text-red-500">{error}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
          <p className="text-gray-600">View and manage your event tickets</p>
        </div>

        {/* Search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search tickets..."
              className="pl-10 bg-gray-50 border-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="hidden sm:flex">
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
        </div>

        {/* Tabs */}
        <Tabs
          defaultValue="upcoming"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past Events</TabsTrigger>
            <TabsTrigger value="all">All Tickets</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            <TicketsList tickets={filteredTickets} />
          </TabsContent>
          <TabsContent value="past" className="mt-6">
            <TicketsList tickets={filteredTickets} />
          </TabsContent>
          <TabsContent value="all" className="mt-6">
            <TicketsList tickets={filteredTickets} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function TicketsList({ tickets }) {
  const [qrModal, setQrModal] = useState({ open: false, code: null });

  return (
    <>
      {qrModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 relative w-full max-w-xs flex flex-col items-center">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setQrModal({ open: false, code: null })}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold mb-4">Your Ticket QR Code</h2>
            <QRCodeSVG value={qrModal.code || ""} size={180} />
            <p className="mt-4 text-xs text-gray-500 break-all text-center">
              Ticket Code: {qrModal.code}
            </p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tickets.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <QrCode className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              No tickets found
            </h3>
            <p className="text-gray-500 mt-1">
              Try adjusting your search or browse events to find tickets.
            </p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Banner Image */}
              <div className="relative h-32 w-full overflow-hidden">
                <img
                  src={
                    ticket.bannerImage ||
                    ticket.image ||
                    "https://placehold.co/600x200?text=Event+Image"
                  }
                  alt={ticket.eventTitle}
                  className="h-full w-full object-cover"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/600x200?text=Event+Image";
                  }}
                />
                <div className="absolute top-3 right-3">
                  <Badge
                    variant={
                      ticket.status === "confirmed" ? "default" : "secondary"
                    }
                    className={
                      ticket.status === "confirmed"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                    }
                  >
                    {ticket.status === "confirmed" ? "Confirmed" : "Attended"}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {ticket.eventTitle}
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      Ticket ID: {ticket.id}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                  <span>
                    {ticket.eventDate} • {ticket.eventTime}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                  <span className="line-clamp-1">{ticket.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-gray-500">Type: </span>
                    <span className="font-medium">{ticket.ticketType}</span>
                  </div>
                  <div className="text-lg font-bold text-cyan-600">
                    {ticket.price}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() =>
                    setQrModal({ open: true, code: ticket.qrCode })
                  }
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  Show QR
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </>
  );
}

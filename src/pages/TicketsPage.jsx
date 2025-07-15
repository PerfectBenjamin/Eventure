"use client";

import { useState, useEffect, useContext } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";
import {
  BarChart3,
  Calendar,
  Download,
  Filter,
  MoreHorizontal,
  QrCode,
  Search,
  SlidersHorizontal,
  Ticket,
  TicketCheck,
} from "lucide-react";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import DashboardLayout from "../features/dashboard/DashboardLayout";
import { useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function TicketsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const [scanModalOpen, setScanModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [eventsRes, ticketsRes] = await Promise.all([
          axios.get("/api/events/"),
          axios.get("/api/tickets"),
        ]);
        setEvents(eventsRes.data);
        // Only tickets for events organized by this user
        const myEventIds = eventsRes.data
          .filter((event) => event.organizer === user?._id)
          .map((event) => event._id);
        const myTickets = ticketsRes.data.filter(
          (ticket) => ticket.event && myEventIds.includes(ticket.event._id)
        );
        setTickets(myTickets);
      } catch (err) {
        setError("Failed to load tickets or events");
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) fetchData();
  }, [user]);

  // Map backend ticket data to UI format
  const mappedTickets = tickets.map((ticket) => ({
    id: ticket.ticketNumber,
    eventName: ticket.event?.title || "Event",
    eventDate: ticket.event?.date?.startDate
      ? new Date(ticket.event.date.startDate).toLocaleDateString()
      : "",
    ticketType: ticket.ticketType,
    purchaseDate: ticket.purchaseDate
      ? new Date(ticket.purchaseDate).toLocaleDateString()
      : "",
    attendeeName: ticket.user?.name || ticket.attendeeName || "",
    attendeeEmail: ticket.user?.email || ticket.attendeeEmail || "",
    price: ticket.totalPrice?.amount
      ? `₦${ticket.totalPrice.amount.toLocaleString()}`
      : "Free",
    status:
      ticket.status === "confirmed"
        ? "valid"
        : ticket.status === "refunded"
        ? "refunded"
        : ticket.status === "cancelled"
        ? "cancelled"
        : ticket.status,
  }));

  // Filter tickets based on active tab and search query
  const filteredTickets = mappedTickets.filter((ticket) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "valid" && ticket.status === "valid") ||
      (activeTab === "refunded" && ticket.status === "refunded") ||
      (activeTab === "cancelled" && ticket.status === "cancelled");

    const matchesSearch =
      ticket.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.eventName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.attendeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.attendeeEmail?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
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
          <h1 className="text-3xl font-bold text-gray-900">Tickets</h1>
          <p className="text-gray-600">
            Manage and track tickets for all your events
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Tickets
              </CardTitle>
              <Ticket className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,429</div>
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
              <TicketCheck className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,245</div>
              <p className="text-xs text-gray-500 mt-1">
                +12.5% from last month
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
                +15.3% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Avg. Ticket Price
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-gray-500"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦107,730</div>
              <p className="text-xs text-gray-500 mt-1">
                +2.4% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          {/* Filters and Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search tickets..."
                  className="pl-10 bg-gray-50 border-gray-200"
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
                  <DropdownMenuLabel>Filter Tickets</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <p className="mb-2 text-xs font-medium text-gray-500">
                      Event
                    </p>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select event" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Events</SelectItem>
                        <SelectItem value="tech-summit">
                          Tech Innovation Summit
                        </SelectItem>
                        <SelectItem value="product-launch">
                          Product Launch
                        </SelectItem>
                        <SelectItem value="charity-gala">
                          Charity Gala
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-2">
                    <p className="mb-2 text-xs font-medium text-gray-500">
                      Ticket Type
                    </p>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="early-bird">Early Bird</SelectItem>
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
                  <DropdownMenuItem>
                    Purchase Date (Newest First)
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Purchase Date (Oldest First)
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Event Date (Soonest First)
                  </DropdownMenuItem>
                  <DropdownMenuItem>Price (High-Low)</DropdownMenuItem>
                  <DropdownMenuItem>Price (Low-High)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              {user?.role === "organizer" && (
                <Button
                  size="sm"
                  className="bg-cyan-500 hover:bg-cyan-600"
                  onClick={() => setScanModalOpen(true)}
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  Scan Ticket
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            defaultValue="all"
            className="w-full"
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Tickets</TabsTrigger>
              <TabsTrigger value="valid">Valid</TabsTrigger>
              <TabsTrigger value="refunded">Refunded</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
            <Separator className="my-4" />

            <TabsContent value="all" className="mt-0">
              <TicketsTable tickets={filteredTickets} />
            </TabsContent>
            <TabsContent value="valid" className="mt-0">
              <TicketsTable tickets={filteredTickets} />
            </TabsContent>
            <TabsContent value="refunded" className="mt-0">
              <TicketsTable tickets={filteredTickets} />
            </TabsContent>
            <TabsContent value="cancelled" className="mt-0">
              <TicketsTable tickets={filteredTickets} />
            </TabsContent>
          </Tabs>
        </div>
        <ScanTicketModal
          open={scanModalOpen}
          onClose={() => setScanModalOpen(false)}
          events={events
            .filter((event) => event.organizer === user?._id)
            .sort((a, b) => {
              const aDate = new Date(a.date?.startDate || a.date);
              const bDate = new Date(b.date?.startDate || b.date);
              return aDate - bDate;
            })}
        />
      </div>
    </DashboardLayout>
  );
}

function TicketsTable({ tickets }) {
  return (
    <div className="w-full max-w-full overflow-x-auto rounded-md border">
      <Table className="min-w-[600px] max-w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Ticket ID</TableHead>
            <TableHead>Event</TableHead>
            <TableHead className="hidden md:table-cell">Attendee</TableHead>
            <TableHead className="hidden md:table-cell">
              Purchase Date
            </TableHead>
            <TableHead className="hidden md:table-cell">Type</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No tickets found.
              </TableCell>
            </TableRow>
          ) : (
            tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell className="font-medium">{ticket.id}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium truncate max-w-[180px]">
                      {ticket.eventName}
                    </span>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="mr-1 h-3 w-3" />
                      {ticket.eventDate}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex flex-col">
                    <span>{ticket.attendeeName}</span>
                    <span className="text-xs text-gray-500">
                      {ticket.attendeeEmail}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {ticket.purchaseDate}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {ticket.ticketType}
                </TableCell>
                <TableCell>{ticket.price}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      ticket.status === "valid"
                        ? "default"
                        : ticket.status === "refunded"
                        ? "outline"
                        : "secondary"
                    }
                    className={
                      ticket.status === "valid"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : ticket.status === "refunded"
                        ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                    }
                  >
                    {ticket.status.charAt(0).toUpperCase() +
                      ticket.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Download PDF</DropdownMenuItem>
                      <DropdownMenuItem>Send to Email</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {ticket.status === "valid" && (
                        <>
                          <DropdownMenuItem>Refund Ticket</DropdownMenuItem>
                          <DropdownMenuItem>Cancel Ticket</DropdownMenuItem>
                        </>
                      )}
                      {ticket.status === "refunded" && (
                        <DropdownMenuItem>View Refund Details</DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function ScanTicketModal({ open, onClose, onResult, events = [] }) {
  const scannerRef = useRef();
  const html5QrCodeRef = useRef(null);
  const isRunningRef = useRef(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState("");

  // Reset state when modal is closed
  useEffect(() => {
    if (!open) {
      setError("");
      setResult(null);
      setSelectedEventId("");
    }
  }, [open]);

  useEffect(() => {
    if (open && scannerRef.current) {
      setError("");
      setResult(null);
      const html5QrCode = new Html5Qrcode(scannerRef.current.id);
      html5QrCodeRef.current = html5QrCode;
      isRunningRef.current = false;
      html5QrCode
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          async (decodedText) => {
            if (!isRunningRef.current) return;
            isRunningRef.current = false;
            try {
              await html5QrCode.stop();
            } catch (e) {
              // ignore stop errors
            }
            if (!selectedEventId) {
              setError("Please select an event before scanning.");
              setResult(null);
              return;
            }
            try {
              const res = await axios.post("/api/tickets/validate", {
                code: decodedText,
                eventId: selectedEventId,
              });
              setResult({
                ...res.data.ticket,
                wasCheckedIn: res.data.wasCheckedIn,
              });
              setError("");
              if (onResult) onResult(res.data.ticket);
            } catch (err) {
              setError(
                err.response?.data?.error || "Invalid or already used ticket."
              );
              setResult(null);
            }
          },
          (err) => {
            // ignore scan errors
          }
        )
        .then(() => {
          isRunningRef.current = true;
        })
        .catch((e) => {
          setError("Camera error: " + e.message);
        });
    }
    // Cleanup: stop scanner when modal closes
    return () => {
      if (html5QrCodeRef.current && isRunningRef.current) {
        html5QrCodeRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            html5QrCodeRef.current = null;
            isRunningRef.current = false;
          });
      } else {
        html5QrCodeRef.current = null;
        isRunningRef.current = false;
      }
    };
  }, [open, onResult, selectedEventId]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xs flex flex-col items-center relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-lg font-bold mb-4">Scan Ticket QR Code</h2>
        <div className="mb-4 w-full">
          <label className="block text-sm font-medium mb-1">Select Event</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            <option value="">-- Choose an event --</option>
            {events.map((event) => (
              <option key={event._id} value={event._id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>
        {!result && (
          <div
            id="qr-reader"
            ref={scannerRef}
            style={{ width: 250, height: 250 }}
          />
        )}
        {error && <div className="text-red-500 mt-2">{error}</div>}
        {result && (
          <div className="mt-4 text-center">
            {result.wasCheckedIn ? (
              <div className="text-red-600 font-bold mb-2">
                Ticket Already Checked In!
              </div>
            ) : (
              <div className="text-green-600 font-bold mb-2">Ticket Valid!</div>
            )}
            <div className="text-sm">
              Attendee: {result.user?.name || result.user?.email || "-"}
            </div>
            <div className="text-sm">Event: {result.event?.title || "-"}</div>
            <div className="text-sm">Ticket Code: {result.ticketCode}</div>
            <div className="text-sm">
              Checked In: {result.checkedIn ? "Yes" : "No"}
            </div>
          </div>
        )}
        <Button onClick={onClose} className="mt-4">
          Close
        </Button>
      </div>
    </div>
  );
}

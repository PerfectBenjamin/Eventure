import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Calendar, MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import DashboardLayoutWrapper from "../components/dashboard-layout";
import axios from "../api/axios";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import {
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Users as UsersIcon,
  Eye,
  Heart,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function EventDetailsPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`/api/events/${id}`);
        setEvent(res.data);
      } catch (err) {
        setError("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayoutWrapper>
        <div className="flex justify-center items-center h-96">
          <span className="text-gray-500 text-lg">
            Loading event details...
          </span>
        </div>
      </DashboardLayoutWrapper>
    );
  }

  if (error) {
    return (
      <DashboardLayoutWrapper>
        <div className="flex justify-center items-center h-96">
          <span className="text-red-500 text-lg">{error}</span>
        </div>
      </DashboardLayoutWrapper>
    );
  }

  if (!event) return null;

  // Format date and time
  let dateStr = "";
  if (event.date && event.date.startDate) {
    const start = new Date(event.date.startDate);
    dateStr = start.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (event.date.endDate && event.date.endDate !== event.date.startDate) {
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
  let timeStr = "";
  if (event.startTime && event.endTime) {
    timeStr = `${event.startTime} - ${event.endTime}`;
  }

  // Format location
  let locationStr = "";
  if (event.location) {
    if (typeof event.location === "string") {
      locationStr = event.location;
    } else if (typeof event.location === "object") {
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
  }

  // Attendees
  const attendees =
    event.attendees ||
    (event.availableTickets && event.availableTickets.sold) ||
    0;

  // Paystack payment handler
  const handlePaystackPayment = () => {
    if (!user?.email || !event?.price?.amount) return;
    const handler =
      window.PaystackPop &&
      window.PaystackPop.setup({
        key: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: event.price.amount * 100, // Paystack expects amount in kobo
        currency: event.price.currency || "NGN",
        ref: `${event._id}-${Date.now()}`,
        callback: function (response) {
          // Call backend to verify and issue ticket
          axios
            .post(
              "/api/payments/verify",
              {
                reference: response.reference,
                eventId: event._id,
              },
              {
                headers: { Authorization: `Bearer ${user.token}` },
              }
            )
            .then((res) => {
              alert("Payment verified! Your ticket is issued.");
              // Optionally redirect to My Tickets or show ticket info
            })
            .catch((err) => {
              alert("Payment verification failed. Please contact support.");
            });
        },
        onClose: function () {
          alert("Payment window closed.");
        },
      });
    if (handler) handler.openIframe();
  };

  // Add handler for free ticket
  const handleGetFreeTicket = async () => {
    try {
      await axios.post(
        "/api/tickets/free",
        { eventId: event._id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      navigate("/my-tickets");
    } catch (err) {
      alert(
        err.response?.data?.error ||
          "Failed to get free ticket. Please try again."
      );
    }
  };

  return (
    <DashboardLayoutWrapper>
      <div className="max-w-3xl mx-auto mt-8 space-y-8">
        <Card className="overflow-hidden shadow-lg">
          {/* Image Gallery */}
          {event.images && event.images.length > 0 ? (
            <div className="relative w-full flex overflow-x-auto gap-2 bg-gray-50 p-2">
              {event.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={event.title + " image " + (idx + 1)}
                  className="h-48 w-auto rounded object-cover border"
                  onError={(e) =>
                    (e.target.src =
                      "https://placehold.co/600x200?text=Event+Image")
                  }
                />
              ))}
            </div>
          ) : (
            event.image && (
              <div className="relative h-64 w-full overflow-hidden">
                <img
                  src={
                    event.image.startsWith("http")
                      ? event.image
                      : `/api/events/${event._id}/image`
                  }
                  alt={event.title}
                  className="h-full w-full object-cover"
                  onError={(e) =>
                    (e.target.src =
                      "https://placehold.co/600x200?text=Event+Image")
                  }
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(255,255,255,0) 60%, #fff 100%)",
                  }}
                />
              </div>
            )
          )}
          <CardHeader>
            <div className="flex flex-wrap gap-2 items-center mb-2">
              {event.category && <Badge>{event.category}</Badge>}
              {event.subCategory && (
                <Badge variant="secondary">{event.subCategory}</Badge>
              )}
              {event.status && (
                <Badge variant="outline" className="capitalize">
                  {event.status}
                </Badge>
              )}
              {event.isFeatured && (
                <Badge
                  variant="outline"
                  className="bg-yellow-100 text-yellow-800"
                >
                  Featured
                </Badge>
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {event.title}
            </CardTitle>
            <div className="flex flex-wrap gap-2 mt-2">
              {event.tags &&
                event.tags.map((tag, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="bg-cyan-50 text-cyan-700 border-cyan-200"
                  >
                    #{tag}
                  </Badge>
                ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 text-gray-600">
              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                <span>{dateStr}</span>
              </div>
              {timeStr && (
                <div className="flex items-center text-sm">
                  <span className="mr-2 text-gray-400">🕐</span>
                  <span>{timeStr}</span>
                </div>
              )}
              <div className="flex items-center text-sm">
                <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                <span>{locationStr}</span>
              </div>
              <div className="flex items-center text-sm">
                <UsersIcon className="mr-2 h-4 w-4 text-gray-400" />
                <span>{attendees} attendees</span>
              </div>
              {event.capacity && (
                <div className="flex items-center text-sm">
                  <span className="mr-2 text-gray-400">🎟️</span>
                  <span>Capacity: {event.capacity}</span>
                </div>
              )}
              {event.ageRestriction &&
                (event.ageRestriction.minimumAge ||
                  event.ageRestriction.maximumAge) && (
                  <div className="flex items-center text-sm">
                    <span className="mr-2 text-gray-400">🔞</span>
                    <span>
                      Age: {event.ageRestriction.minimumAge || "-"} -{" "}
                      {event.ageRestriction.maximumAge || "-"}
                    </span>
                  </div>
                )}
              {event.views !== undefined && (
                <div className="flex items-center text-sm">
                  <Eye className="mr-2 h-4 w-4 text-gray-400" />
                  <span>{event.views} views</span>
                </div>
              )}
              {event.likes !== undefined && (
                <div className="flex items-center text-sm">
                  <Heart className="mr-2 h-4 w-4 text-gray-400" />
                  <span>{event.likes} likes</span>
                </div>
              )}
            </div>
            <Separator />
            {/* Price Section */}
            {event.price && (
              <div>
                <h3 className="text-lg font-semibold mb-1">Pricing</h3>
                <div className="flex flex-col gap-2">
                  {/* Regular Price */}
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cyan-600">
                      {event.price.currency?.toUpperCase() === "NGN"
                        ? "₦"
                        : event.price.currency?.toUpperCase() || ""}
                      {event.price.amount ?? (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </span>
                    <span className="text-xs text-gray-500">Regular</span>
                    <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">
                      Available
                    </span>
                  </div>
                  {/* Early Bird Price */}
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        event.price.earlyBirdPrice
                          ? "font-bold text-green-600"
                          : "font-bold text-gray-400 line-through"
                      }
                    >
                      {event.price.currency?.toUpperCase() === "NGN"
                        ? "₦"
                        : event.price.currency?.toUpperCase() || ""}
                      {event.price.earlyBirdPrice ?? (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </span>
                    <span className="text-xs text-gray-500">Early Bird</span>
                    {event.price.earlyBirdPrice ? (
                      event.price.earlyBirdEndDate &&
                      new Date() <= new Date(event.price.earlyBirdEndDate) ? (
                        <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">
                          Available until{" "}
                          {new Date(
                            event.price.earlyBirdEndDate
                          ).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-gray-200 text-gray-500">
                          Expired
                        </span>
                      )
                    ) : (
                      <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-gray-200 text-gray-400">
                        Unavailable
                      </span>
                    )}
                  </div>
                  {/* VIP Price */}
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        event.price.vipPrice
                          ? "font-bold text-purple-600"
                          : "font-bold text-gray-400 line-through"
                      }
                    >
                      {event.price.currency?.toUpperCase() === "NGN"
                        ? "₦"
                        : event.price.currency?.toUpperCase() || ""}
                      {event.price.vipPrice ?? (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </span>
                    <span className="text-xs text-gray-500">VIP</span>
                    {event.price.vipPrice ? (
                      <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">
                        Available
                      </span>
                    ) : (
                      <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-gray-200 text-gray-400">
                        Unavailable
                      </span>
                    )}
                  </div>
                </div>
                {event.price.earlyBirdEndDate && (
                  <div className="text-xs text-gray-500 mt-1">
                    Early bird ends:{" "}
                    {new Date(
                      event.price.earlyBirdEndDate
                    ).toLocaleDateString()}
                  </div>
                )}
                {/* Buy Ticket Button for Attendees */}
                {user?.role === "attendee" && event.price?.amount === 0 && (
                  <button
                    className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-md px-4 py-2 mt-4"
                    onClick={handleGetFreeTicket}
                  >
                    Get Free Ticket
                  </button>
                )}
                {user?.role === "attendee" && event.price?.amount > 0 && (
                  <button
                    className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-md px-4 py-2 mt-4"
                    onClick={handlePaystackPayment}
                  >
                    Buy Ticket
                  </button>
                )}
              </div>
            )}
            {/* Description */}
            {event.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            )}
            {/* Requirements */}
            {event.requirements && event.requirements.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                <ul className="list-disc list-inside text-gray-700">
                  {event.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
            {/* Schedule */}
            {event.schedule && event.schedule.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Schedule</h3>
                <ul className="space-y-2">
                  {event.schedule.map((item, idx) => (
                    <li key={idx} className="border rounded p-2 bg-gray-50">
                      <div className="font-semibold">{item.activity}</div>
                      <div className="text-xs text-gray-500">
                        {item.time && new Date(item.time).toLocaleString()}
                        <br />
                        {item.description}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Social Links */}
            {event.socialLinks && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Connect</h3>
                <div className="flex gap-4 items-center">
                  {event.socialLinks.website && (
                    <a
                      href={event.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 flex items-center gap-1"
                    >
                      <Globe className="h-4 w-4" /> Website
                    </a>
                  )}
                  {event.socialLinks.facebook && (
                    <a
                      href={event.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 flex items-center gap-1"
                    >
                      <Facebook className="h-4 w-4" /> Facebook
                    </a>
                  )}
                  {event.socialLinks.twitter && (
                    <a
                      href={event.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 flex items-center gap-1"
                    >
                      <Twitter className="h-4 w-4" /> Twitter
                    </a>
                  )}
                  {event.socialLinks.instagram && (
                    <a
                      href={event.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-500 flex items-center gap-1"
                    >
                      <Instagram className="h-4 w-4" /> Instagram
                    </a>
                  )}
                </div>
              </div>
            )}
            {/* Policies */}
            {(event.cancellationPolicy || event.refundPolicy) && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Policies</h3>
                {event.cancellationPolicy && (
                  <div className="mb-1">
                    <span className="font-semibold">Cancellation: </span>
                    <span className="text-gray-700">
                      {event.cancellationPolicy}
                    </span>
                  </div>
                )}
                {event.refundPolicy && (
                  <div>
                    <span className="font-semibold">Refund: </span>
                    <span className="text-gray-700">{event.refundPolicy}</span>
                  </div>
                )}
              </div>
            )}
            {/* Organizer */}
            {event.organizer && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Organizer</h3>
                <p className="text-gray-700">
                  {event.organizer.organizationName ||
                    event.organizer.name ||
                    event.organizer}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayoutWrapper>
  );
}

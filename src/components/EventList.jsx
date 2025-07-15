import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import EventCard from "./EventCard";

const EventList = () => {
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

  // Filter out events that have already ended
  const now = new Date();
  const upcomingEvents = events.filter((event) => {
    if (event.date && event.date.endDate) {
      return new Date(event.date.endDate) >= now;
    }
    // If no endDate, fallback to startDate
    if (event.date && event.date.startDate) {
      return new Date(event.date.startDate) >= now;
    }
    return true; // If no date info, show by default
  });

  if (loading) return <div>Loading events...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-xl font-normal mb-4 text-gray-500">
        Browse All Events
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {upcomingEvents.length === 0 ? (
          <div>No events found.</div>
        ) : (
          upcomingEvents.map((event) => {
            // Format date string for display
            let dateStr = "";
            if (event.date && event.date.startDate) {
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
            // Format time string for display if you have time fields
            let timeStr = "";
            if (event.startTime && event.endTime) {
              timeStr = `${event.startTime} - ${event.endTime}`;
            } else if (
              event.date &&
              event.date.startDate &&
              event.date.endDate
            ) {
              const start = new Date(event.date.startDate);
              const end = new Date(event.date.endDate);
              const startTime = start.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              const endTime = end.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              timeStr = `${startTime} - ${endTime}`;
            }
            // Format location string for display
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
                    locationStr +=
                      (locationStr ? ", " : "") + addrParts.join(", ");
                  }
                }
              }
            }
            // Capacity: use event.capacity if present, else fallback to availableTickets.total
            const capacity =
              typeof event.capacity === "number"
                ? event.capacity
                : event.availableTickets &&
                  typeof event.availableTickets.total === "number"
                ? event.availableTickets.total
                : 0;
            return (
              <EventCard
                key={event._id || event.title}
                title={event.title}
                date={dateStr}
                time={timeStr}
                location={locationStr}
                capacity={capacity}
                image={event.image}
                _id={event._id}
                ticketsSold={event.ticketsSold}
                revenue={event.revenue}
                status={event.status}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default EventList;

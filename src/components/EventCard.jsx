import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Users } from "lucide-react";

const EventCard = ({
  title,
  date,
  time,
  location,
  attendees,
  image,
  _id,
  capacity,
  price,
}) => {
  let imgSrc = image;
  if (image && image.startsWith("http")) {
    imgSrc = image; // Use the static URL if present
  } else if (_id) {
    imgSrc = `/api/events/${_id}/image?${Date.now()}`; // Try to load from backend
  }
  const [img, setImg] = useState(imgSrc);
  const navigate = useNavigate();
  return (
    <div
      className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow flex flex-col h-full cursor-pointer group-hover:ring-2 group-hover:ring-cyan-400 group-hover:ring-offset-2"
      onClick={() => navigate(`/events/${_id}`)}
    >
      {img && (
        <div className="relative w-full h-48 rounded-t-lg overflow-hidden">
          <img
            src={img}
            alt={title}
            className="w-full h-full object-cover transition-transform hover:scale-105"
            onError={() =>
              setImg("https://placehold.co/600x200?text=Event+Image")
            }
            crossOrigin="anonymous"
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0) 60%, #fff 100%)",
            }}
          />
        </div>
      )}
      <div className="flex flex-col flex-1 gap-1 p-4">
        <h3 className="font-semibold text-lg mb-2 text-gray-900 line-clamp-2">
          {title}
        </h3>
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="mr-2 h-4 w-4 text-gray-400" /> {date}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2 text-gray-400">🕐</span> {time}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="mr-2 h-4 w-4 text-gray-400" /> {location}
        </div>
        <div className="flex items-center text-gray-600 text-sm mt-auto pt-2">
          <Users className="mr-2 h-4 w-4 text-gray-400" />
          <span>
            {typeof capacity === "number" ? capacity.toLocaleString() : "-"}{" "}
            capacity
          </span>
        </div>
      </div>
    </div>
  );
};

export default EventCard;

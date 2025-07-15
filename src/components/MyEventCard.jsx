import React from "react";

const MyEventCard = ({
  title,
  date,
  time,
  location,
  ticketsSold,
  revenue,
  status,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col justify-between h-full min-h-[200px]">
      <div className="flex-1">
        <h3 className="font-semibold text-lg mb-1">{title}</h3>
        <div className="text-gray-500 text-sm flex items-center mb-1">
          <span className="material-symbols-outlined mr-1">event</span> {date}
        </div>
        <div className="text-gray-500 text-sm flex items-center mb-1">
          <span className="material-symbols-outlined mr-1">schedule</span>{" "}
          {time}
        </div>
        <div className="text-gray-500 text-sm flex items-center mb-2">
          <span className="material-symbols-outlined mr-1">place</span>{" "}
          {location}
        </div>
        <div className="flex gap-4 mb-2">
          <div>
            <div className="text-xs text-gray-500">Tickets Sold</div>
            <div className="font-semibold">{ticketsSold}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Revenue</div>
            <div className="font-semibold">{revenue}</div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span
          className={`text-xs px-3 py-1 rounded-full font-semibold ${
            status === "Upcoming"
              ? "bg-black text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {status}
        </span>
        <button className="bg-cyan-500 text-white rounded px-4 py-1 font-semibold">
          Manage
        </button>
      </div>
    </div>
  );
};

export default MyEventCard;

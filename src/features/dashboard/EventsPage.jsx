import React from "react";
import EventList from "../../components/EventList";
import DashboardLayout from "./DashboardLayout";
import { useNavigate } from "react-router-dom";

const EventsPage = () => {
  const navigate = useNavigate();
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold">Events</h1>
        <button
          className="hidden md:flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-md px-4 py-2"
          onClick={() => navigate("/create-event")}
        >
          <span className="material-symbols-outlined align-middle mr-1">
            add
          </span>
          New Event
        </button>
      </div>
      {/* Removed stats cards here */}
      <EventList />
    </DashboardLayout>
  );
};

export default EventsPage;

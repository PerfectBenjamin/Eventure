import React, { useState } from "react";
import ProfileDropdown from "./ProfileDropdown";

const navLinks = [
  { label: "Events", icon: "dashboard", path: "/" },
  { label: "My Events", icon: "event", path: "/my-events" },
  { label: "Create Event", icon: "add_circle", path: "/create-event" },
  { label: "Tickets", icon: "confirmation_number", path: "/tickets" },
  { label: "Analytics", icon: "bar_chart", path: "/analytics" },
  { label: "Settings", icon: "settings", path: "/settings" },
];

const Topbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-30 transition-opacity duration-200"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <aside className="relative z-50 w-64 h-full bg-white shadow-lg flex flex-col animate-slide-in-left">
            <div className="flex items-center gap-2 px-6 py-4 text-2xl font-bold border-b">
              <span className="material-symbols-outlined text-cyan-500">
                event
              </span>
              Eventure
              <button
                className="ml-auto text-gray-400 hover:text-gray-700"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <nav className="flex-1 px-2 py-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.path}
                  className="flex items-center gap-3 px-4 py-2 rounded hover:bg-cyan-50 text-gray-700 mb-1"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="material-symbols-outlined text-xl">
                    {link.icon}
                  </span>
                  {link.label}
                </a>
              ))}
            </nav>
          </aside>
        </div>
      )}
      {/* Mobile search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-30 transition-opacity duration-200 md:hidden">
          <div className="w-full max-w-md mx-auto mt-8 bg-white rounded-lg shadow-lg flex items-center px-4 py-2 relative animate-fade-in">
            <span className="material-symbols-outlined text-gray-400 mr-2">
              search
            </span>
            <input
              autoFocus
              type="text"
              placeholder="Search events..."
              className="flex-1 px-2 py-2 bg-transparent outline-none text-lg"
            />
            <button
              className="ml-2 text-gray-400 hover:text-gray-700"
              onClick={() => setSearchOpen(false)}
              aria-label="Close search"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
      )}
      {/* Mobile Topbar */}
      <header className="flex items-center justify-between px-4 py-4 bg-white border-b shadow-sm sticky top-0 z-10 md:hidden">
        {/* Left: Menu button and logo (mobile) */}
        <div className="flex items-center flex-1 min-w-0">
          <button
            className="mr-2 p-2 mt-2 rounded hover:bg-gray-100 focus:outline-none"
            aria-label="Open sidebar"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
          <span className="flex items-center gap-1 text-2xl font-bold text-cyan-500 whitespace-nowrap">
            <span className="material-symbols-outlined">event</span>
            <span className="text-black">Eventure</span>
          </span>
        </div>
        {/* Center: (empty for spacing) */}
        <div className="flex-1 flex justify-center min-w-0"></div>
        {/* Right: Search icon, notifications, profile */}
        <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
          <button
            className="p-2 -mr-2 mt-2 rounded hover:bg-gray-100 focus:outline-none"
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
          >
            <span className="material-symbols-outlined text-gray-400 text-2xl">
              search
            </span>
          </button>
          <button className="relative">
            <span className="material-symbols-outlined text-gray-500 text-2xl">
              notifications
            </span>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1 flex items-center justify-center min-w-[1.25rem] h-5">
              3
            </span>
          </button>
          <ProfileDropdown />
        </div>
      </header>
      {/* Desktop Topbar (original) */}
      <header className="hidden md:flex items-center justify-between px-6 py-4 bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2 w-full max-w-md">
          <span className="material-symbols-outlined text-gray-400">
            search
          </span>
          <input
            type="text"
            placeholder="Search events..."
            className="w-full px-2 py-1 bg-transparent outline-none"
          />
        </div>
        <div className="flex items-center gap-6">
          <button className="relative">
            <span className="material-symbols-outlined text-gray-500 text-2xl">
              notifications
            </span>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1 flex items-center justify-center min-w-[1.25rem] h-5">
              3
            </span>
          </button>
          <ProfileDropdown />
        </div>
      </header>
      {/* Simple slide-in animation for drawer and fade for search */}
      <style>{`
        @keyframes slide-in-left {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.2s ease;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease;
        }
      `}</style>
    </>
  );
};

export default Topbar;

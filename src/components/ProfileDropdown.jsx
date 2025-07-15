import React, { useState, useRef, useEffect } from "react";

const ProfileDropdown = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        className="flex items-center gap-1 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open profile menu"
      >
        {/* Avatar (placeholder) */}
        <span className="w-9 h-9 rounded-full border border-gray-300 bg-gray-100 flex items-center justify-center text-gray-400 text-2xl">
          <span className="material-symbols-outlined">account_circle</span>
        </span>
        <span className="material-symbols-outlined text-gray-500 text-lg">
          expand_more
        </span>
      </button>
      {open && (
        <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl border z-50 p-0.5 transition-all duration-200 animate-fade-in">
          <div className="p-4 pb-2 border-b">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-10 h-10 rounded-full border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-400 text-2xl">
                <span className="material-symbols-outlined">
                  account_circle
                </span>
              </span>
              <div>
                <div className="font-semibold leading-tight">John Doe</div>
                <div className="text-xs text-gray-500 leading-tight">
                  john@eventure.com
                </div>
                <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                  Organizer
                </span>
              </div>
            </div>
          </div>
          <div className="py-2">
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm"
            >
              <span className="material-symbols-outlined text-lg">person</span>{" "}
              Profile
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm"
            >
              <span className="material-symbols-outlined text-lg">
                settings
              </span>{" "}
              Settings
            </a>
          </div>
          <div className="border-t">
            <button className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-sm">
              <span className="material-symbols-outlined text-lg">logout</span>{" "}
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;

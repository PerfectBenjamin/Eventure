import React, { useState } from "react";
import { format } from "date-fns";
import {
  CalendarIcon,
  Check,
  ChevronRight,
  Clock,
  MapPin,
  Upload,
} from "lucide-react";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Calendar } from "../components/ui/calendar";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";
import { cn } from "../utils/cn";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function CreateEventPage() {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const { user } = useAuth();

  // Collect all form data in a single state object
  const [form, setForm] = useState({
    title: "",
    type: "",
    description: "",
    image: null,
    date: null,
    startTime: "09:00",
    endTime: "17:00",
    duration: 8,
    multiDay: false,
    multiDayStart: null,
    multiDayEnd: null,
    locationType: "in-person",
    venue: "",
    address: "",
    city: "",
    postalCode: "",
    state: "",
    country: "",
    platform: "",
    meetingLink: "",
    meetingId: "",
    meetingPassword: "",
    ticketType: "paid",
    price: "",
    currency: "ngn",
    maxAttendees: "",
    registrationDeadline: null,
    addTax: false,
    addServiceFee: false,
    enablePromoCodes: false,
    publishOption: "publish-now",
    visibility: "public",
    ticketTiers: [
      // Example default tier
      // { name: "Regular", price: "", quantity: "", startDate: null, endDate: null }
    ],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handlers for each field (example for a few fields, add as needed)
  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  // Example for Selects
  const handleSelectChange = (id, value) => {
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  // Example for Date pickers
  // const handleDateChange = (date) => {
  //   setForm((prev) => ({ ...prev, date }));
  // };

  // Example for file/image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      // 5MB limit
      setError("Image size must be 5MB or less.");
      return;
    }
    setForm((prev) => ({ ...prev, image: file }));
  };

  // Helper to update a tier
  const updateTier = (idx, field, value) => {
    setForm((prev) => {
      const tiers = [...prev.ticketTiers];
      tiers[idx][field] = value;
      // Update main price to lowest
      const lowest = tiers.reduce((min, t) => {
        const p = parseFloat(t.price);
        return !isNaN(p) && (min === null || p < min) ? p : min;
      }, null);
      return { ...prev, ticketTiers: tiers, price: lowest ?? "" };
    });
  };

  // Helper to add a tier
  const addTier = () => {
    setForm((prev) => ({
      ...prev,
      ticketTiers: [
        ...prev.ticketTiers,
        { name: "", price: "", quantity: "", startDate: null, endDate: null },
      ],
    }));
  };

  // Helper to remove a tier
  const removeTier = (idx) => {
    setForm((prev) => {
      const tiers = prev.ticketTiers.filter((_, i) => i !== idx);
      // Update main price to lowest
      const lowest = tiers.reduce((min, t) => {
        const p = parseFloat(t.price);
        return !isNaN(p) && (min === null || p < min) ? p : min;
      }, null);
      return { ...prev, ticketTiers: tiers, price: lowest ?? "" };
    });
  };

  // Publish Event handler
  const handlePublish = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    // Validate required fields before sending
    if (!form.title || !form.type || !form.date) {
      setError(
        "Please fill in all required fields: title, category, and date."
      );
      setLoading(false);
      return;
    }
    try {
      // Build price object for backend (legacy fields for compatibility)
      let priceObj = {
        amount: form.price,
        currency: form.currency.toUpperCase(),
      };
      // Map known tiers to legacy fields
      form.ticketTiers.forEach((tier) => {
        if (/early bird/i.test(tier.name)) {
          priceObj.earlyBirdPrice = tier.price;
          priceObj.earlyBirdEndDate = tier.endDate;
        } else if (/vip/i.test(tier.name)) {
          priceObj.vipPrice = tier.price;
        } else if (/regular/i.test(tier.name)) {
          priceObj.amount = tier.price;
        }
      });
      // Optionally, include all tiers for future-proofing
      // If no ticket tiers, event is free
      if (!form.ticketTiers || form.ticketTiers.length === 0) {
        priceObj.amount = 0;
        priceObj.tiers = [];
      } else {
        // Set price to 0 for any tier without a price
        priceObj.tiers = form.ticketTiers.map((tier) => ({
          ...tier,
          price: tier.price === undefined || tier.price === "" ? 0 : tier.price,
        }));
        // Set main price to lowest tier price or 0
        const lowest = priceObj.tiers.reduce((min, t) => {
          const p = parseFloat(t.price);
          return !isNaN(p) && (min === null || p < min) ? p : min;
        }, null);
        priceObj.amount = lowest ?? 0;
      }

      // Build event data for API
      // Combine date and time into a single Date object for startDate and endDate
      let startDate = "";
      let endDate = "";
      if (form.date && form.startTime && form.endTime) {
        // form.date is a Date object, form.startTime/endTime are 'HH:mm' strings
        const [startHour, startMinute] = form.startTime.split(":").map(Number);
        const [endHour, endMinute] = form.endTime.split(":").map(Number);
        const start = new Date(form.date);
        start.setHours(startHour, startMinute, 0, 0);
        const end = new Date(form.date);
        end.setHours(endHour, endMinute, 0, 0);
        startDate = start.toISOString();
        endDate = end.toISOString();
      } else if (form.date) {
        startDate = new Date(form.date).toISOString();
        endDate = new Date(form.date).toISOString();
      }
      // Calculate capacity as the sum of all ticket tier quantities
      let capacity = 0;
      if (form.ticketTiers && form.ticketTiers.length > 0) {
        capacity = form.ticketTiers.reduce((sum, tier) => {
          const qty = parseInt(tier.quantity, 10);
          return sum + (isNaN(qty) ? 0 : qty);
        }, 0);
      } else if (form.maxAttendees) {
        capacity = parseInt(form.maxAttendees, 10) || 0;
      }

      const eventData = {
        title: form.title,
        category: form.type,
        description: form.description,
        date: {
          startDate,
          endDate,
        },
        location: {
          venue: form.venue,
          address: {
            street: form.address,
            city: form.city,
            state: form.state,
            zipCode: form.postalCode,
            country: form.country,
          },
        },
        price: priceObj,
        availableTickets: {
          total: capacity || 100,
        },
        capacity, // <-- set calculated capacity here
        status: form.publishOption === "draft" ? "draft" : "published",
      };
      // If you need to upload an image, use FormData and multipart/form-data
      let config = {
        headers: {
          Authorization: user?.token ? `Bearer ${user.token}` : undefined,
        },
      };
      let response;
      if (form.image) {
        const formData = new FormData();
        // Flatten nested fields for FormData
        for (const [key, value] of Object.entries(eventData)) {
          if (
            typeof value === "object" &&
            value !== null &&
            !(value instanceof File)
          ) {
            for (const [subKey, subValue] of Object.entries(value)) {
              if (typeof subValue === "object" && subValue !== null) {
                for (const [deepKey, deepValue] of Object.entries(subValue)) {
                  formData.append(`${key}.${subKey}.${deepKey}`, deepValue);
                }
              } else {
                formData.append(`${key}.${subKey}`, subValue);
              }
            }
          } else if (value !== undefined && value !== null) {
            formData.append(key, value);
          }
        }
        formData.append("image", form.image);
        config.headers["Content-Type"] = "multipart/form-data";
        response = await axios.post("/api/events/", formData, config);
      } else {
        response = await axios.post("/api/events/", eventData, config);
      }
      setSuccess("Event created successfully!");
      // Optionally redirect or reset form
    } catch (err) {
      setError(
        err.response?.data?.error ||
          (err.response?.data?.errors
            ? err.response.data.errors.map((e) => e.msg).join(", ")
            : "Failed to create event")
      );
    } finally {
      setLoading(false);
    }
  };

  function getDuration(start, end) {
    if (!start || !end) return "";
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    let duration = endH + endM / 60 - (startH + startM / 60);
    if (duration < 0) duration += 24; // handle overnight events
    return Math.round(duration); // return integer hours
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Feedback messages */}
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-500 mb-2">{success}</div>}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">Create Event</h1>
        <p className="text-gray-600">
          Fill in the details to create a new event
        </p>
      </div>

      {/* Progress Steps */}
      <div className="hidden md:flex items-center gap-x-6 w-full mb-6">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div key={index} className="flex items-center">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border-2",
                step > index + 1
                  ? "border-cyan-500 bg-cyan-500 text-white"
                  : step === index + 1
                  ? "border-cyan-500 text-cyan-500"
                  : "border-gray-300 text-gray-300"
              )}
            >
              {step > index + 1 ? <Check className="h-5 w-5" /> : index + 1}
            </div>
            {index < totalSteps - 1 && (
              <div
                className={cn(
                  "h-1 w-12",
                  step > index + 1 ? "bg-cyan-500" : "bg-gray-200"
                )}
              />
            )}
          </div>
        ))}
      </div>

      <div className="md:hidden mb-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">
            Step {step} of {totalSteps}
          </p>
          <p className="text-sm font-medium text-cyan-500">
            {step === 1 && "Basic Info"}
            {step === 2 && "Date & Location"}
            {step === 3 && "Tickets & Pricing"}
            {step === 4 && "Preview & Publish"}
          </p>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-cyan-500 transition-all"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Steps */}
      <div className="space-y-6">
        {step === 1 && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Basic Information
                </h2>
                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter the title of your event"
                      className="w-full"
                      value={form.title}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Event Type</Label>
                    <Select
                      id="type"
                      value={form.type}
                      onValueChange={(value) =>
                        handleSelectChange("type", value)
                      }
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Music">Music</SelectItem>
                        <SelectItem value="Sports">Sports</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Food">Food</SelectItem>
                        <SelectItem value="Arts">Arts</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        <SelectItem value="Charity">Charity</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Entertainment">
                          Entertainment
                        </SelectItem>
                        <SelectItem value="Networking">Networking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Event Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your event"
                      className="min-h-32"
                      value={form.description}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Event Image</Label>
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="image"
                        className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-3 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            SVG, PNG, JPG or GIF (MAX. 2MB)
                          </p>
                        </div>
                        <input
                          id="image"
                          name="image"
                          type="file"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                    {form.image && (
                      <div className="flex justify-center mt-2 relative">
                        <img
                          src={URL.createObjectURL(form.image)}
                          alt="Event Preview"
                          className="max-h-40 rounded shadow"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({ ...prev, image: null }))
                          }
                          className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-1 shadow hover:bg-red-100"
                          title="Remove image"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-red-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Date & Location
                </h2>
                <Separator />

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Event Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            onClick={() =>
                              setForm((prev) => ({ ...prev, date: null }))
                            }
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {form.date ? (
                              format(form.date, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={form.date}
                            onSelect={(date) => {
                              setForm((prev) => ({ ...prev, date }));
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>Event Time</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <Input
                            id="startTime"
                            type="time"
                            className="pl-10"
                            value={form.startTime}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <Input
                            id="endTime"
                            type="time"
                            className="pl-10"
                            value={form.endTime}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Event Duration</Label>
                    <Tabs defaultValue="single-day">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="single-day">Single Day</TabsTrigger>
                        <TabsTrigger value="multi-day">Multi-Day</TabsTrigger>
                      </TabsList>
                      <TabsContent value="single-day" className="pt-4">
                        <div className="space-y-2">
                          <Label>Duration (hours)</Label>
                          <Input
                            id="duration"
                            type="number"
                            value={getDuration(form.startTime, form.endTime)}
                            readOnly
                          />
                        </div>
                      </TabsContent>
                      <TabsContent value="multi-day" className="pt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left font-normal"
                                  onClick={() =>
                                    setForm((prev) => ({
                                      ...prev,
                                      multiDayStart: null,
                                    }))
                                  }
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  <span>Pick a date</span>
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" initialFocus />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="space-y-2">
                            <Label>End Date</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left font-normal"
                                  onClick={() =>
                                    setForm((prev) => ({
                                      ...prev,
                                      multiDayEnd: null,
                                    }))
                                  }
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  <span>Pick a date</span>
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" initialFocus />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  <div className="space-y-2">
                    <Label>Location Type</Label>
                    <Tabs defaultValue="in-person">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="in-person">In Person</TabsTrigger>
                        <TabsTrigger value="virtual">Virtual</TabsTrigger>
                      </TabsList>
                      <TabsContent value="in-person" className="pt-4 space-y-4">
                        <div className="space-y-2">
                          <Label>Venue Name</Label>
                          <Input
                            id="venue"
                            placeholder="Enter venue name"
                            value={form.venue}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Address</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                              id="address"
                              placeholder="Enter address"
                              className="pl-10"
                              value={form.address}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>City</Label>
                            <Input
                              id="city"
                              placeholder="City"
                              value={form.city}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Postal Code</Label>
                            <Input
                              id="postalCode"
                              placeholder="Postal code"
                              value={form.postalCode}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>State/Province</Label>
                            <Input
                              id="state"
                              placeholder="State/Province"
                              value={form.state}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Country</Label>
                            <Select
                              id="country"
                              value={form.country}
                              onValueChange={(value) =>
                                handleSelectChange("country", value)
                              }
                            >
                              <SelectTrigger id="country">
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ng">Nigeria</SelectItem>
                                <SelectItem value="us">
                                  United States
                                </SelectItem>
                                <SelectItem value="ca">Canada</SelectItem>
                                <SelectItem value="uk">
                                  United Kingdom
                                </SelectItem>
                                <SelectItem value="au">Australia</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="virtual" className="pt-4">
                        <div className="space-y-2">
                          <Label>Platform</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="zoom">Zoom</SelectItem>
                              <SelectItem value="teams">
                                Microsoft Teams
                              </SelectItem>
                              <SelectItem value="meet">Google Meet</SelectItem>
                              <SelectItem value="webex">Cisco Webex</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Meeting Link</Label>
                          <Input placeholder="https://" />
                        </div>
                        <div className="space-y-2">
                          <Label>Meeting ID (optional)</Label>
                          <Input placeholder="Meeting ID" />
                        </div>
                        <div className="space-y-2">
                          <Label>Password (optional)</Label>
                          <Input placeholder="Password" type="password" />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Tickets & Pricing
                </h2>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Ticket Tiers</Label>
                    <Button variant="outline" size="sm" onClick={addTier}>
                      Add Tier
                    </Button>
                  </div>
                  {form.ticketTiers.length === 0 && (
                    <div className="text-gray-400 text-sm">
                      No ticket tiers added yet.
                    </div>
                  )}
                  {form.ticketTiers.map((tier, idx) => (
                    <Card key={idx} className="border border-gray-200 mb-2">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <Input
                            className="font-medium w-1/2"
                            placeholder="Tier Name (e.g. Early Bird, VIP)"
                            value={tier.name}
                            onChange={(e) =>
                              updateTier(idx, "name", e.target.value)
                            }
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => removeTier(idx)}
                          >
                            Remove
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Price</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                ₦
                              </span>
                              <Input
                                className="pl-8"
                                type="number"
                                min="0"
                                placeholder="0.00"
                                value={tier.price}
                                onChange={(e) =>
                                  updateTier(idx, "price", e.target.value)
                                }
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              min="0"
                              placeholder="Quantity"
                              value={tier.quantity}
                              onChange={(e) =>
                                updateTier(idx, "quantity", e.target.value)
                              }
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input
                              type="date"
                              value={tier.startDate || ""}
                              onChange={(e) =>
                                updateTier(idx, "startDate", e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input
                              type="date"
                              value={tier.endDate || ""}
                              onChange={(e) =>
                                updateTier(idx, "endDate", e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      id="addTax"
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={form.addTax}
                      onChange={handleInputChange}
                    />
                    <Label htmlFor="addTax" className="text-sm font-normal">
                      Add tax to ticket price
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      id="addServiceFee"
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={form.addServiceFee}
                      onChange={handleInputChange}
                    />
                    <Label
                      htmlFor="addServiceFee"
                      className="text-sm font-normal"
                    >
                      Add service fee to ticket price
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      id="enablePromoCodes"
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={form.enablePromoCodes}
                      onChange={handleInputChange}
                    />
                    <Label
                      htmlFor="enablePromoCodes"
                      className="text-sm font-normal"
                    >
                      Enable promotional codes
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Preview & Publish
                </h2>
                <Separator />

                <div className="space-y-6">
                  <div className="rounded-lg border overflow-hidden">
                    <div className="bg-gray-100 h-48 flex items-center justify-center">
                      {form.image ? (
                        <img
                          src={URL.createObjectURL(form.image)}
                          alt="Event Preview"
                          className="max-h-40 rounded shadow"
                        />
                      ) : (
                        <div className="text-gray-400">Event Image Preview</div>
                      )}
                    </div>
                    <div className="p-4 space-y-4">
                      <h3 className="text-xl font-semibold">
                        {form.title || "Event Title"}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.date
                          ? format(new Date(form.date), "PPP")
                          : "Event Date"}{" "}
                        • {form.startTime} - {form.endTime}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="mr-2 h-4 w-4" />
                        {form.venue}
                        {form.address && `, ${form.address}`}
                        {form.city && `, ${form.city}`}
                      </div>
                      <div className="flex items-center gap-2">
                        {form.type && <Badge>{form.type}</Badge>}
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-500">Starting from</p>
                          <p className="text-lg font-bold">
                            {form.currency?.toUpperCase() === "NGN" ? "₦" : ""}
                            {form.price}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 text-gray-700">
                        {form.description}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Publishing Options</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          id="publishOption"
                          type="radio"
                          name="publish-option"
                          value="publish-now"
                          checked={form.publishOption === "publish-now"}
                          onChange={handleInputChange}
                          className="rounded-full border-gray-300"
                        />
                        <Label
                          htmlFor="publishOption"
                          className="text-sm font-normal"
                        >
                          Publish now
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          id="publishOption"
                          type="radio"
                          name="publish-option"
                          value="schedule"
                          checked={form.publishOption === "schedule"}
                          onChange={handleInputChange}
                          className="rounded-full border-gray-300"
                        />
                        <Label
                          htmlFor="publishOption"
                          className="text-sm font-normal"
                        >
                          Schedule for later
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          id="publishOption"
                          type="radio"
                          name="publish-option"
                          value="draft"
                          checked={form.publishOption === "draft"}
                          onChange={handleInputChange}
                          className="rounded-full border-gray-300"
                        />
                        <Label
                          htmlFor="publishOption"
                          className="text-sm font-normal"
                        >
                          Save as draft
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Visibility</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          id="visibility"
                          type="radio"
                          name="visibility"
                          value="public"
                          checked={form.visibility === "public"}
                          onChange={handleInputChange}
                          className="rounded-full border-gray-300"
                        />
                        <Label
                          htmlFor="visibility"
                          className="text-sm font-normal"
                        >
                          Public - Anyone can find this event
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          id="visibility"
                          type="radio"
                          name="visibility"
                          value="private"
                          checked={form.visibility === "private"}
                          onChange={handleInputChange}
                          className="rounded-full border-gray-300"
                        />
                        <Label
                          htmlFor="visibility"
                          className="text-sm font-normal"
                        >
                          Private - Only people with the link can access
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={prevStep} disabled={step === 1}>
            Back
          </Button>
          {step < totalSteps ? (
            <Button
              onClick={nextStep}
              className="bg-cyan-500 hover:bg-cyan-600"
            >
              Continue
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              className="bg-cyan-500 hover:bg-cyan-600"
              onClick={handlePublish}
              disabled={loading}
            >
              {loading ? "Publishing..." : "Publish Event"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

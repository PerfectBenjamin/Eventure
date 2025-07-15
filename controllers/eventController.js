const Event = require("../models/Event");

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    // Set the organizer to the authenticated user's ID
    const eventData = {
      ...req.body,
      organizer: req.user.id,
    };
    // If an image file was uploaded, save the Cloudinary URL
    if (req.file && req.file.path) {
      eventData.image = req.file.path; // Cloudinary URL
    }
    const event = new Event(eventData);
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    // Exclude imageData from the result
    const events = await Event.find({}, "-imageData");
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "organizer",
      "organizationName name"
    );
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update an event by ID
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete an event by ID
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

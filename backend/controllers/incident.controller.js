const Incident = require("../models/Incident");
const getIncidentPriority = require("../utils/priorityEngine");
const User = require("../models/user");

// Create a new incident
const createIncident = async (req, res) => {
  try {
    const {
      category,
      description,
      location,
    } = req.body;

    // Validate required fields
    if (!category || !description || !location) {
      return res.status(400).json({
        message: "Category, description and location are required",
      });
    }

    // Calculate priority on the server
    const priority = getIncidentPriority(category, description);

    // Create incident
    const incident = await Incident.create({
      reportedBy: req.user.user_id,
      category,
      description,
      location,
      priority,
    });

    res.status(201).json({
      message: "Incident reported successfully",
      incident,
    });
  } catch (error) {
    console.error("Create incident error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Get incidents reported by the logged-in user
const getMyIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find({
      reportedBy: req.user.user_id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Incidents fetched successfully",
      incidents,
    });
  } catch (error) {
    console.error("Get incidents error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};


// Get incidents assigned to the logged-in responder
const getAssignedIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find({
      assignedResponder: req.user.user_id,
    })
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Assigned incidents fetched successfully",
      count: incidents.length,
      incidents,
    });
  } catch (error) {
    console.error("Get assigned incidents error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};


// Get all incidents (supervisor/admin only)
const getAllIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find()
      .populate("reportedBy", "name email")
      .populate("assignedResponder", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "All incidents fetched successfully",
      count: incidents.length,
      incidents,
    });
  } catch (error) {
    console.error("Get all incidents error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};


// Get a single incident by ID
const getIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findOne({
      _id: req.params.id,
      reportedBy: req.user.user_id,
    });

    if (!incident) {
      return res.status(404).json({
        message: "Incident not found",
      });
    }

    res.status(200).json({
      message: "Incident fetched successfully",
      incident,
    });
  } catch (error) {
    console.error("Get incident error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};


const updateIncidentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "TRIAGED",
      "ACKNOWLEDGED",
      "EN_ROUTE",
      "ON_SITE",
      "RESOLVED",
      "CLOSED",
      "ESCALATED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid incident status",
      });
    }

    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        message: "Incident not found",
      });
    }

    const isSupervisorOrAdmin = [
      "supervisor",
      "admin",
    ].includes(req.user.role);

    const isAssignedResponder =
      incident.assignedResponder &&
      incident.assignedResponder.toString() === req.user.user_id;

    if (!isSupervisorOrAdmin && !isAssignedResponder) {
      return res.status(403).json({
        message: "You are not authorized to update this incident",
      });
    }

    const transitions = {
      REPORTED: ["TRIAGED", "ESCALATED"],
      TRIAGED: ["ASSIGNED", "ESCALATED"],
      ASSIGNED: ["ACKNOWLEDGED", "ESCALATED"],
      ACKNOWLEDGED: ["EN_ROUTE", "ESCALATED"],
      EN_ROUTE: ["ON_SITE", "ESCALATED"],
      ON_SITE: ["RESOLVED", "ESCALATED"],
      RESOLVED: ["CLOSED"],
      ESCALATED: ["TRIAGED", "ASSIGNED"],
      CLOSED: [],
    };

    const permittedNextStatuses = transitions[incident.status] || [];

    if (!permittedNextStatuses.includes(status)) {
      return res.status(400).json({
        message: `Cannot change status from ${incident.status} to ${status}`,
      });
    }

    // Only supervisors/admins can perform escalation
    // or close a resolved incident.
    if (
      (status === "ESCALATED" || status === "CLOSED") &&
      !isSupervisorOrAdmin
    ) {
      return res.status(403).json({
        message: "Supervisor or admin authorization required",
      });
    }

    
const previousStatus = incident.status;

incident.status = status;
await incident.save();

// Notify the incident reporter
const io = req.app.get("io");

const statusUpdate = {
  message: "Incident status updated",
  incident: {
    _id: incident._id,
    category: incident.category,
    priority: incident.priority,
    status: incident.status,
  },
  previousStatus,
};

io.to(`user:${incident.reportedBy}`).emit(
  "incident:status_updated",
  statusUpdate
);

// Notify the assigned responder, if one exists
if (incident.assignedResponder) {
  io.to(`user:${incident.assignedResponder}`).emit(
    "incident:status_updated",
    statusUpdate
  );
}

return res.status(200).json({
  message: "Incident status updated successfully",
  incident,
});

  } catch (error) {
    console.error("Update incident status error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};


const assignIncident = async (req, res) => {
  try {
    // Only admins and supervisors can assign incidents
    if (!["admin", "supervisor"].includes(req.user.role)) {
      return res.status(403).json({
        message: "Only admins and supervisors can assign incidents",
      });
    }

    const { responderId } = req.body;

    if (!responderId) {
      return res.status(400).json({
        message: "Responder ID is required",
      });
    }

    // Find the incident
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        message: "Incident not found",
      });
    }

    // Only TRIAGED incidents can be assigned
    if (incident.status !== "TRIAGED") {
      return res.status(400).json({
        message: "Only TRIAGED incidents can be assigned",
      });
    }

    // Verify that the target user is a responder
    const responder = await User.findById(responderId);

    if (!responder || responder.role !== "responder") {
      return res.status(400).json({
        message: "Valid responder account not found",
      });
    }

    // Assign responder and update status
    incident.assignedResponder = responder._id;
    incident.status = "ASSIGNED";

    await incident.save();
    const io = req.app.get("io");

io.to(`user:${responder._id}`).emit("incident:assigned", {
  message: "A new incident has been assigned to you",
  incident: {
    _id: incident._id,
    category: incident.category,
    description: incident.description,
    priority: incident.priority,
    status: incident.status,
    location: incident.location,
  },
});

    return res.status(200).json({
      message: "Incident assigned successfully",
      incident,
    });
  } catch (error) {
    console.error("Assign incident error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};


module.exports = {
  createIncident,
  getMyIncidents,
  getAssignedIncidents,
  getAllIncidents,
  getIncidentById,
  updateIncidentStatus,
  assignIncident,
};


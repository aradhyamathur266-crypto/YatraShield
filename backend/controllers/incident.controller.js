const Incident = require("../models/incident");
const getIncidentPriority = require("../utils/priorityEngine");
const User = require("../models/user");

const ACK_TIMEOUT_MINUTES = Number(
  process.env.ACK_TIMEOUT_MINUTES || 5
);

// Create a new incident
const createIncident = async (req, res) => {
  try{
    const{category, description, location} = req.body;

    const allowedCategories = [
      "medical",
      "accident",
      "crime",
      "lost_person",
      "fire",
      "harassment",
      "natural_disaster",
      "other",
    ];

    if(
      typeof category !== "string" ||
      !allowedCategories.includes(category)
    ) {
      return res.status(400).json({
        message: "Invalid incident category",
      });
    }

    if(
      typeof description !== "string" ||
      description.trim().length < 5 ||
      description.trim().length > 2000
    ) {
      return res.status(400).json({
        message: "Description must be between 5 and 2000 characters",
      });
    }

    if(
      !location ||
      typeof location !== "object" ||
      Array.isArray(location) ||
      location.type !== "Point" ||
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2
    ) {
      return res.status(400).json({
        message: "Location must be a valid GeoJSON Point",
      });
    }

    const[longitude, latitude] = location.coordinates;

    if (
      typeof longitude !== "number" ||
      typeof latitude !== "number" ||
      !Number.isFinite(longitude) ||
      !Number.isFinite(latitude) ||
      longitude < -180 ||
      longitude > 180 ||
      latitude < -90 ||
      latitude > 90
    ) {
      return res.status(400).json({
        message: "Invalid longitude or latitude coordinates",
      });
    }

    const priority = getIncidentPriority(
      category,
      description.trim()
    );

    const incident = await Incident.create({
      reportedBy: req.user.user_id,
      category,
      description: description.trim(),
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      priority,
    });

    return res.status(201).json({
      message: "Incident reported successfully",
      incident,
    });

  } catch(error){
    console.error("Create incident error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};


// Get incidents reported by the logged-in user
const getMyIncidents = async (req, res) => {
  try{
    const incidents = await Incident.find({
      reportedBy: req.user.user_id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Incidents fetched successfully",
      incidents,
    });
  } catch(error){
    console.error("Get incidents error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};


// Get incidents assigned to the logged-in responder
const getAssignedIncidents = async (req, res) => {
  try{
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
  } catch(error){
    console.error("Get assigned incidents error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};


// Get all incidents (supervisor/admin only)
const getAllIncidents = async (req, res) => {
  try{
    const incidents = await Incident.find()
      .populate("reportedBy", "name email")
      .populate("assignedResponder", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "All incidents fetched successfully",
      count: incidents.length,
      incidents,
    });
  } catch(error){
    console.error("Get all incidents error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};


// Get a single incident by ID
// Access: owner, assigned responder, supervisor, or admin.
const getIncidentById = async (req, res) => {
  try{
    const incident = await Incident.findById(req.params.id)
      .populate("reportedBy", "name email")
      .populate("assignedResponder", "name email");

    if(!incident){
      return res.status(404).json({
        message: "Incident not found",
      });
    }

    const isOwner =
      incident.reportedBy?._id?.toString() === req.user.user_id;

    const isAssignedResponder =
      incident.assignedResponder?._id?.toString() === req.user.user_id;

    // Handle populated vs raw ObjectId shapes
    const isOwnerRaw =
      incident.reportedBy?.toString?.() === req.user.user_id;

    const isResponderRaw =
      incident.assignedResponder?.toString?.() === req.user.user_id;

    const isStaff = ["supervisor", "admin"].includes(req.user.role);

    if(
      !(
        isOwner ||
        isOwnerRaw ||
        isAssignedResponder ||
        isResponderRaw ||
        isStaff
      )
    ) {
      return res.status(403).json({
        message: "Not authorized to view this incident",
      });
    }

    return res.status(200).json({
      message: "Incident fetched successfully",
      incident,
    });
  } catch(error){
    console.error("Get incident error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};


// Update incident status
const updateIncidentStatus = async (req, res) => {
  try{
    const{status} = req.body;

    const allowedStatuses = [
      "TRIAGED",
      "ACKNOWLEDGED",
      "EN_ROUTE",
      "ON_SITE",
      "RESOLVED",
      "CLOSED",
      "ESCALATED",
    ];

    if(!allowedStatuses.includes(status)){
      return res.status(400).json({
        message: "Invalid incident status",
      });
    }

    const incident = await Incident.findById(req.params.id);

    if(!incident){
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

    if(!isSupervisorOrAdmin && !isAssignedResponder){
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

    if(!permittedNextStatuses.includes(status)){
      return res.status(400).json({
        message: `Cannot change status from ${incident.status} to ${status}`,
      });
    }

    // Only supervisors/admins can perform escalation
    // or close a resolved incident.
    if(
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
    if(incident.assignedResponder){
      io.to(`user:${incident.assignedResponder}`).emit(
        "incident:status_updated",
        statusUpdate
      );
    }

    return res.status(200).json({
      message: "Incident status updated successfully",
      incident,
    });

  } catch(error){
    console.error("Update incident status error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};


// Assign or reassign an incident
const assignIncident = async (req, res) => {
  try{
    // Only supervisors and admins can assign incidents
    if(!["admin", "supervisor"].includes(req.user.role)){
      return res.status(403).json({
        message: "Only admins and supervisors can assign incidents",
      });
    }

    const{responderId} = req.body;

    if(!responderId){
      return res.status(400).json({
        message: "Responder ID is required",
      });
    }

    const incident = await Incident.findById(req.params.id);

    if(!incident){
      return res.status(404).json({
        message: "Incident not found",
      });
    }

    if(!["TRIAGED", "ESCALATED"].includes(incident.status)){
      return res.status(400).json({
        message: "Only TRIAGED or ESCALATED incidents can be assigned",
      });
    }

    const responder = await User.findById(responderId);

    if(!responder || responder.role !== "responder"){
      return res.status(400).json({
        message: "Valid responder account not found",
      });
    }

    const previousResponder = incident.assignedResponder;
    const wasEscalated = incident.status === "ESCALATED";

    const assignedTime = new Date();

    incident.assignedResponder = responder._id;
    incident.status = "ASSIGNED";
    incident.assignedAt = assignedTime;

    incident.acknowledgementDueAt = new Date(
      assignedTime.getTime() + ACK_TIMEOUT_MINUTES * 60 * 1000
    );

    incident.escalatedAt = null;

    await incident.save();

    const io = req.app.get("io");

    const incidentDetails = {
      _id: incident._id,
      category: incident.category,
      description: incident.description,
      priority: incident.priority,
      status: incident.status,
      location: incident.location,
      assignedAt: incident.assignedAt,
      acknowledgementDueAt: incident.acknowledgementDueAt,
    };

    // Notify the newly assigned responder
    io.to(`user:${responder._id}`).emit(
      "incident:assigned",
      {
        message: wasEscalated
          ? "An escalated incident has been reassigned to you"
          : "A new incident has been assigned to you",
        incident: incidentDetails,
      }
    );

    if(wasEscalated){
      // Notify the tourist who reported the incident
      io.to(`user:${incident.reportedBy}`).emit(
        "incident:reassigned",
        {
          message: "Your incident has been reassigned to another responder",
          incident: incidentDetails,
        }
      );

      // Notify the previous responder, if different
      if (
        previousResponder &&
        previousResponder.toString() !== responder._id.toString()
      ) {
        io.to(`user:${previousResponder}`).emit(
          "incident:reassigned",
          {
            message: "This incident has been reassigned to another responder",
            incident: incidentDetails,
          }
        );
      }

      // Notify supervisors and admins
      // Notification lookup failure must not undo a successful assignment.
      try{
        const supervisors = await User.find({
          role: { $in: ["supervisor", "admin"] },
        }).select("_id");

        for(const supervisor of supervisors){
          io.to(`user:${supervisor._id}`).emit(
            "incident:reassigned",
            {
              message: "An escalated incident has been reassigned",
              incident: incidentDetails,
            }
          );
        }
      } catch(notificationError){
        console.error(
          "Supervisor notification error:",
          notificationError.message
        );
      }
    }

    return res.status(200).json({
      message: wasEscalated
        ? "Escalated incident reassigned successfully"
        : "Incident assigned successfully",
      incident,
    });

  } catch(error){
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

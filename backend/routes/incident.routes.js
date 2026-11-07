const express = require("express");
const protect = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");

const {
  createIncident,
  getMyIncidents,
  getAssignedIncidents,
  getAllIncidents,
  getIncidentById,
  updateIncidentStatus,
  assignIncident,
} = require("../controllers/incident.controller");

const router = express.Router();

// Create a new incident
router.post("/", protect, createIncident);

// Get incidents reported by the logged-in user
router.get("/", protect, getMyIncidents);

// Get incidents assigned to the logged-in responder
router.get("/assigned", protect, authorizeRoles("responder"), getAssignedIncidents);

// Get all incidents (supervisor/admin only)
router.get("/all", protect, authorizeRoles("supervisor", "admin"), getAllIncidents);

// Get a single incident owned by the logged-in user
router.get("/:id", protect, getIncidentById);

// Update the status of an incident
router.patch("/:id/status", protect, updateIncidentStatus);

// Assign an incident to a responder
router.patch("/:id/assign", protect, assignIncident);

module.exports = router;
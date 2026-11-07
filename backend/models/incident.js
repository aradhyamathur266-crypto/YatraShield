const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema(
  {
    // User who reported the incident
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Type of incident
    category: {
      type: String,
      enum: [
        "medical",
        "accident",
        "crime",
        "lost_person",
        "fire",
        "harassment",
        "natural_disaster",
        "other",
      ],
      required: true,
    },

    // Description provided by the tourist
    description: {
      type: String,
      required: true,
      trim: true,
    },

    // Incident location
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },

    // Incident priority
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    // Current incident status
    status: {
      type: String,
      enum: [
        "REPORTED",
        "TRIAGED",
        "ASSIGNED",
        "ACKNOWLEDGED",
        "EN_ROUTE",
        "ON_SITE",
        "RESOLVED",
        "CLOSED",
        "ESCALATED",
      ],
      default: "REPORTED",
    },

    // Responder assigned to the incident
    assignedResponder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Assignment and escalation tracking
    assignedAt: {
      type: Date,
      default: null,
    },

    acknowledgementDueAt: {
      type: Date,
      default: null,
    },

    escalatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }

);

// Geospatial index
incidentSchema.index({ location: "2dsphere" });

const Incident = mongoose.model("Incident", incidentSchema);

module.exports = Incident;

const Incident = require("../models/incident");

const checkOverdueIncidents = async (io) => {
  try {
    const now = new Date();

    // Find and atomically escalate overdue assignments.
    // This prevents repeated escalation by overlapping checks.
    let escalatedCount = 0;

    while (true) {
      const incident = await Incident.findOneAndUpdate(
        {
          status: "ASSIGNED",
          acknowledgementDueAt: { $lte: now },
          assignedResponder: { $ne: null },
        },
        {
          $set: {
            status: "ESCALATED",
            escalatedAt: now,
          },
        },
        { returnDocument: "after"  }
      );

      if (!incident) break;

      escalatedCount++;

      console.log(
        `Incident ${incident._id} automatically escalated`
      );

      const notification = {
        message: "Incident escalated due to acknowledgement timeout",
        incidentId: incident._id,
        status: "ESCALATED",
        escalatedAt: incident.escalatedAt,
      };

      // Notify the reporter and assigned responder.
      io.to(`user:${incident.reportedBy}`).emit(
        "incident:escalated",
        notification
      );

      io.to(`user:${incident.assignedResponder}`).emit(
        "incident:escalated",
        notification
      );

      // Supervisor notifications will be added next.
    }

    return escalatedCount;
  } catch (error) {
    console.error("Escalation checker error:", error.message);
    return 0;
  }
};

module.exports = checkOverdueIncidents;

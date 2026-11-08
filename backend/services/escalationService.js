const Incident = require("../models/incident");
const User = require("../models/user");

const checkOverdueIncidents = async (io) => {
  try {
    const now = new Date();

    // Find all supervisors and admins.
    const supervisors = await User.find({
      role: { $in: ["supervisor", "admin"] },
    }).select("_id");

    let escalatedCount = 0;

    // Find and atomically escalate overdue assignments.
    while(true){
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
        { returnDocument: "after" }
      );

      if(!incident) break;

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

      // Notify the tourist.
      io.to(`user:${incident.reportedBy}`).emit(
        "incident:escalated",
        notification
      );

      // Notify the assigned responder.
      io.to(`user:${incident.assignedResponder}`).emit(
        "incident:escalated",
        notification
      );

      // Notify all supervisors and admins.
      for(const supervisor of supervisors){
        io.to(`user:${supervisor._id}`).emit(
          "incident:escalated",
          notification
        );
      }

      console.log(
        `Escalation notifications sent for incident ${incident._id}`
      );
    }

    return escalatedCount;
  }catch(error){
    console.error("Escalation checker error:", error.message);
    return 0;
  }
};

module.exports = checkOverdueIncidents;

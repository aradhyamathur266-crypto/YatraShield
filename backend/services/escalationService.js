const Incident = require("../models/incident");
const User = require("../models/user");

const checkOverdueIncidents = async (io) => {
  let escalatedCount = 0;

  try{
    const now = new Date();

    // Atomically escalate overdue assignments.
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
      try{
        io.to(`user:${incident.reportedBy}`).emit(
          "incident:escalated",
          notification
        );

        // Notify the assigned responder.
        io.to(`user:${incident.assignedResponder}`).emit(
          "incident:escalated",
          notification
        );
      }catch(notificationError){
        console.error(
          `Incident notification error (${incident._id}):`,
          notificationError.message
        );
      }

      // Supervisor lookup and notifications are isolated.
      try{
        const supervisors = await User.find({
          role: { $in: ["supervisor", "admin"] },
        }).select("_id");

        for(const supervisor of supervisors){
          io.to(`user:${supervisor._id}`).emit(
            "incident:escalated",
            notification
          );
        }
      }catch(notificationError){
        console.error(
          `Supervisor notification error (${incident._id}):`,
          notificationError.message
        );
      }

      console.log(
        `Escalation notifications processed for incident ${incident._id}`
      );
    }

    return escalatedCount;

  }catch(error){
    console.error("Escalation checker error:", error.message);
    return escalatedCount;
  }
};

module.exports = checkOverdueIncidents;

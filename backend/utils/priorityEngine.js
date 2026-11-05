
const getIncidentPriority = (category, description = "") => {
  const text = description.toLowerCase();

  // Critical indicators: immediate danger or potentially life-threatening events.
  const criticalKeywords = [
    "unconscious",
    "not breathing",
    "life threatening",
    "life-threatening",
    "severe bleeding",
    "trapped",
    "fire spreading",
  ];

  // High indicators: serious harm or urgent safety concerns.
  const highKeywords = [
    "injured",
    "bleeding",
    "assault",
    "weapon",
    "threatened",
    "missing child",
    "stranded",
  ];

  if (criticalKeywords.some((keyword) => text.includes(keyword))) {
    return "critical";
  }

  if (highKeywords.some((keyword) => text.includes(keyword))) {
    return "high";
  }

  const categoryPriority = {
    medical: "high",
    accident: "high",
    crime: "high",
    lost_person: "high",
    fire: "critical",
    harassment: "medium",
    natural_disaster: "critical",
    other: "medium",
  };

  return categoryPriority[category] || "medium";
};

module.exports = getIncidentPriority;

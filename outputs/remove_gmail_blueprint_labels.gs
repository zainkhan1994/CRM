function removeMistakenBlueprintLabels() {
  const labelsToDelete = [
    "Blueprint/00 Action",
    "Blueprint/00 Action/Needs Reply",
    "Blueprint/00 Action/Waiting On",
    "Blueprint/01 Personal",
    "Blueprint/01 Personal/Finance",
    "Blueprint/01 Personal/Finance/Bills",
    "Blueprint/01 Personal/Finance/Banking Credit",
    "Blueprint/01 Personal/Health",
    "Blueprint/01 Personal/Legal Identity",
    "Blueprint/01 Personal/Travel",
    "Blueprint/01 Personal/Events",
    "Blueprint/01 Personal/Home Inventory",
    "Blueprint/02 Work",
    "Blueprint/02 Work/R-Cubed",
    "Blueprint/02 Work/Trulo Homes",
    "Blueprint/02 Work/Job Applications",
    "Blueprint/02 Work/Mechanic Advisor",
    "Blueprint/02 Work/Meetings",
    "Blueprint/03 Growth Learning",
    "Blueprint/03 Growth Learning/AI ML",
    "Blueprint/03 Growth Learning/Developer",
    "Blueprint/03 Growth Learning/GitHub",
    "Blueprint/03 Growth Learning/Courses",
    "Blueprint/04 Projects Community",
    "Blueprint/04 Projects Community/Google GDG",
    "Blueprint/04 Projects Community/NASA Space Apps",
    "Blueprint/04 Projects Community/Volunteer",
    "Blueprint/04 Projects Community/Hackathons",
    "Blueprint/05 Tools Systems",
    "Blueprint/05 Tools Systems/Security Auth",
    "Blueprint/05 Tools Systems/Automation Scripts",
    "Blueprint/05 Tools Systems/Data Exports",
    "Blueprint/06 Evidence",
    "Blueprint/06 Evidence/Receipts Orders",
    "Blueprint/06 Evidence/Support Disputes",
    "Blueprint/06 Evidence/Attachments Docs",
    "Blueprint/99 Archive",
    "Blueprint/99 Archive/Newsletters",
    "Blueprint/99 Archive/Noise"
  ];

  const deleted = [];
  const missing = [];

  labelsToDelete.forEach((labelName) => {
    if (!labelName.startsWith("Blueprint/")) {
      throw new Error("Safety stop: refusing to delete non-Blueprint label: " + labelName);
    }

    const label = GmailApp.getUserLabelByName(labelName);
    if (label) {
      label.deleteLabel();
      deleted.push(labelName);
    } else {
      missing.push(labelName);
    }
  });

  Logger.log("Deleted labels:\n" + deleted.join("\n"));
  Logger.log("Already missing:\n" + missing.join("\n"));
}

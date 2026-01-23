function pushStatusHistory(doc, status, changedBy) {
  doc.statusHistory = doc.statusHistory || [];
  doc.statusHistory.push({
    status,
    changedAt: new Date(),
    changedBy: changedBy || "system",
  });
}

function isDemoExpiringSoon(demoToDate, days = 2) {
  if (!demoToDate) return false;
  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const end = new Date(demoToDate);
  end.setHours(0, 0, 0, 0);

  const daysLeft = Math.ceil((end - today) / MS_PER_DAY);
  return daysLeft === days;
}

module.exports = { pushStatusHistory, isDemoExpiringSoon };
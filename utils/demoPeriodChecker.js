function isDemoExpiringSoon(demoToDate, daysBefore = 2) {
  if (!demoToDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const end = new Date(demoToDate);
  end.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((end - today) / (1000 * 60 * 60 * 24));

  // 🔴 ALERT when today, tomorrow, or day after tomorrow
  return diffDays >= 0 && diffDays <= daysBefore;
}

module.exports = { isDemoExpiringSoon };
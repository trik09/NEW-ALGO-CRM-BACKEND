function computeWarrantyStatus(invoiceDate, warrantyPeriodMonths) {
  if (!invoiceDate || !warrantyPeriodMonths || warrantyPeriodMonths <= 0) return undefined;

  const start = new Date(invoiceDate);
  if (isNaN(start.getTime())) return undefined;

  const expiry = new Date(start);
  expiry.setMonth(expiry.getMonth() + Number(warrantyPeriodMonths));

  return new Date() > expiry ? "out of warranty" : "active";
}

module.exports = { computeWarrantyStatus };
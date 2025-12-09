import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  dateOfVisit: String,
  month: String,
  customerName: String,
  state: String,
  location: String,
  callType: String,
  deviceType: String,
  deviceManufacturer: String,
  deviceModel: String,
  oldVehicleNo: String,
  newVehicleNo: String,
  oldImeiNo: String,
  simProvider: String,
  oldSimNo: String,
  newImeiNo: String,
  newSimNo: String,
  payrollOutsource: String,
  technicianName: String,
  additionalTechnician: String,
  cseName: String,
  issueFound: String,
  resolutionDone: String,
  remarks: String,
  completionStatus: String
});

export default mongoose.model("Customer", customerSchema);

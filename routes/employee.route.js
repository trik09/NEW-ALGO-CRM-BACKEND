const express = require("express");
const employeeController = require("../controllers/employee.controller");
const {
  uploadEmployeeDocuments,
  multerErrorHandler,
} = require("../middleware/upload.middleware");
const { isAuthenticated ,authorizeRoles} = require("../middleware/auth.middleware");

const router = express.Router();

// Get all employees
router.get(
  "/get-all-employees-without-qstClientUser",
  isAuthenticated,
  employeeController.getAllEmployee_Without_qstClient_contacts_user
);

// it is used for  only company employee data (Not super Admin and other like qstClient)
router.get(
  "/get-all-employee-except-superadmin",
  isAuthenticated,
  employeeController.getAllEmployeeExceptSuperAdmin
);

// Create new employee (basic)
router.post(
  "/create-employee",
  isAuthenticated,
 
  employeeController.createEmployee
);

// we export only company employee not employee created by qst client contacts
router.get(
  "/get-all-employee-except-superadmin-qstclient-export",
  isAuthenticated,
  employeeController.exportEmployeesWithoutQstContactEmployee
);
// create, update and delete Employee by superAdmin-------
router.post(
  "/create-employee-by-superAdmin",
  isAuthenticated,
  authorizeRoles('superAdmin','admin'),
  // uploadEmployeeDocuments,
  // multerErrorHandler,
  employeeController.createEmployeeBySuperAdmin
);

router.patch(
  "/update-employee-by-superAdmin/:id",
  isAuthenticated,
  authorizeRoles('superAdmin','admin'),
  uploadEmployeeDocuments,
  multerErrorHandler,
  employeeController.updateEmployeeBySuperAdmin
);

router.delete(
  "/delete-employees-by-superAdmin/:id",
  
  isAuthenticated,
  authorizeRoles('superAdmin','admin'),
  employeeController.deleteEmployeeBySuperAdmin
);

module.exports = router;

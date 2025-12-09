const Employee = require("../models/employee.model");
const bcrypt = require("bcrypt");
const AWS = require("aws-sdk");
const dayjs = require("dayjs");
const Ticket = require("../models/ticket.model");
const { default: mongoose } = require("mongoose");
const sendEmail = require("../utils/SendEmail");
//const State = require("../models/state.model")
const welcomeTemplateOfQSTClientsTemplate = require("../emailTemplates/QstClientEmployee");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

exports.createEmployee = async (req, res) => {
  // console.log("empl run");
  try {
    const {
      name,
      email,
      password,
      phoneNumber,
      location,
      employeeId,
      address,
      pincode,
      aadharNumber,
      panNumber,
      photo,
      aadharImage,
      panCardImage,
      role, // Now required
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Name, email, password, and role are required." });
    }

    const validRoles = ["cse", "admin", "superAdmin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Must be one of: cse, admin, superAdmin.",
      });
    }

    // Check if employee already exists
    const existing = await Employee.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Employee with this email already exists." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newEmployee = new Employee({
      name,
      email,
      password: hashedPassword,
      role,
      isEmailVerify: 0,
      phoneNumber,
      location,
      employeeId,
      address,
      pincode,
      aadharNumber,
      panNumber,
      photo,
      aadharImage,
      panCardImage,
      resetPasswordToken: {
        token: null,
        expires: null,
      },
    });

    await newEmployee.save();

    res.status(201).json({
      message: "Employee created successfully",
      employee: {
        _id: newEmployee._id,
        name: newEmployee.name,
        email: newEmployee.email,
        role: newEmployee.role,
        isEmailVerify: newEmployee.isEmailVerify,
        createdAt: newEmployee.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating employee:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

exports.updateEmployeeBySuperAdmin = async (req, res) => {
  
  try {

    const { id } = req.params;
    const {
      name,
      phoneNumber,
      location,
      address,
      pincode,
      aadharNumber,
      panNumber,
      isTelecaller,
      zone,
      serviceStates 
    } = req.body;

    // Validate employee exists
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const formattedZone = formatZone(zone);
    console.log("Original zone:", zone, "Formatted zone:", formattedZone);

    // Basic validations
    if (!name || !formattedZone) {
      return res.status(400).json({
        success: false,
        message: "Name and zone is required",
      });
    }

    

    const phoneRegex = /^[6-9]\d{9}$/;
    if (phoneNumber && !phoneRegex.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format",
      });
    }

    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (pincode && !pincodeRegex.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pincode format",
      });
    }

    const aadharRegex = /^\d{12}$/;
    if (aadharNumber && !aadharRegex.test(aadharNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Aadhar number format",
      });
    }

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (panNumber && !panRegex.test(panNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid PAN number format",
      });
    }


        // Handle serviceStates - Parse JSON string if it's a string
    let serviceStatesArray = [];
    if (serviceStates) {
      try {
        // If serviceStates is a JSON string, parse it
        if (typeof serviceStates === 'string') {
          serviceStatesArray = JSON.parse(serviceStates);
        } else if (Array.isArray(serviceStates)) {
          serviceStatesArray = serviceStates;
        }
        
        // Validate that serviceStates contains valid ObjectIds
        if (serviceStatesArray.length > 0) {
          const isValidObjectId = serviceStatesArray.every(id => 
            mongoose.Types.ObjectId.isValid(id)
          );
          
          if (!isValidObjectId) {
            return res.status(400).json({
              success: false,
              message: "Invalid service states format"
            });
          }
        }
      } catch (error) {
        console.error("Error parsing serviceStates:", error);
        return res.status(400).json({
          success: false,
          message: "Invalid service states format"
        });
      }
    }

    // Helper function to upload file to S3
    const uploadFile = async (file, folder) => {
      if (!file) return null;

      const fileExtension = file.originalname.split(".").pop();
      const timestamp = Date.now();
      const key = `${folder}/${timestamp}.${fileExtension}`;

      const params = {
        Bucket: process.env.AWS_S3_PERSONASAL_FILE_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      const data = await s3.upload(params).promise();
      return data.Location;
    };

    // Helper function to delete file from S3
    const deleteFile = async (url) => {
      if (!url) return;

      try {
        const key = url.split("/").slice(3).join("/");
        await s3
          .deleteObject({
            Bucket: process.env.AWS_S3_PERSONASAL_FILE_BUCKET_NAME,
            Key: key,
          })
          .promise();
      } catch (error) {
        console.error(`Error deleting file from S3: ${url}`, error);
      }
    };

    // Process file uploads and deletions
    const updateOperations = [];
    const filesToDelete = [];

    // Handle photo update
    if (req.files?.photo?.[0]) {
      updateOperations.push(
        uploadFile(req.files.photo[0], "employeeDocs").then((newUrl) => {
          if (employee.photo) filesToDelete.push(employee.photo);
          employee.photo = newUrl;
        })
      );
    }

    // Handle aadhar image update
    if (req.files?.aadharImage?.[0]) {
      updateOperations.push(
        uploadFile(req.files.aadharImage[0], "employeeDocs").then((newUrl) => {
          if (employee.aadharImage) filesToDelete.push(employee.aadharImage);
          employee.aadharImage = newUrl;
        })
      );
    }

    // Handle pan card image update
    if (req.files?.panCardImage?.[0]) {
      updateOperations.push(
        uploadFile(req.files.panCardImage[0], "employeeDocs").then((newUrl) => {
          if (employee.panCardImage) filesToDelete.push(employee.panCardImage);
          employee.panCardImage = newUrl;
        })
      );
    }

    // Wait for all upload operations to complete
    await Promise.all(updateOperations);

    // Update employee data
    employee.name = name;
    employee.zone = formattedZone;
    if (phoneNumber) employee.phoneNumber = phoneNumber;
    if (location) employee.location = location;
    if (address) employee.address = address;
    if (pincode) employee.pincode = pincode;
    if (aadharNumber) employee.aadharNumber = aadharNumber;
    if (panNumber) employee.panNumber = panNumber;
    if (isTelecaller) employee.isTelecaller = isTelecaller;

     // Update serviceStates if provided
    if (serviceStates !== undefined) {
      employee.serviceStates = serviceStatesArray;
    }

    // Save the updated employee
    await employee.save();

    // Delete old files after successful update
    if (filesToDelete.length > 0) {
      await Promise.all(filesToDelete.map((url) => deleteFile(url)));
    }

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      employee: {
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        zone: employee.zone,
        photo: employee.photo,
        isTelecaller: employee.isTelecaller,
        aadharImage: employee.aadharImage,
        panCardImage: employee.panCardImage,
        updatedAt: employee.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.deleteEmployeeBySuperAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ID format first
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID format",
      });
    }

    // Check if employee exists
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    // Check for open tickets assigned to this employee
    const openTickets = await Ticket.find({
      $or: [{ assignee: id }],
      isTicketClosed: false,
    });

    if (openTickets.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete employee with open assigned tickets.",
        openTicketsCount: openTickets.length,
        ticketIds: openTickets.map((ticket) => ticket._id),
      });
    }

    // If no open tickets, proceed with deletion
    await Employee.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully.",
      employeeId: id,
    });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.createEmployeeBySuperAdmin = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phoneNumber,
      location,
      employeeId,
      address,
      pincode,
      aadharNumber,
      panNumber,
      role,
      zone,
      isTelecaller,
      serviceStates,
    
    } = req.body;
    console.log("THis running")
    // Format the zone input
    const formattedZone = formatZone(zone);
    // console.log("Body:", req.body);
    console.log("Files:", req.files); // Should contain: photo, aadharImage, panCardImage
    console.log("Original zone:", zone, "Formatted zone:", formattedZone);
    // Required field validation
    if (!name || !email || !phoneNumber || !password || !role || !formattedZone) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, mobile no. and role, zone are required.",
      });
    }





    // Role validation
    const validRoles = ["cse", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role.",
      });
    }

    // Format validations
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format.",
      });
    }

    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (pincode && !pincodeRegex.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pincode format.",
      });
    }

    const aadharRegex = /^\d{12}$/;
    if (aadharNumber && !aadharRegex.test(aadharNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Aadhar number format.",
      });
    }

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (panNumber && !panRegex.test(panNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid PAN number format.",
      });
    }

    // Check for existing employee
    const existing = await Employee.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Employee with this email already exists.",
      });
    }

    const validatePassword = (password) => {
  // Check length
  if (password.length < 8) {
    return {
      valid: false,
      message: "Password must be at least 8 characters long"
    };
  }

  // Check complexity (all other requirements in one regex)
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)"
    };
  }

  return { valid: true }; 
};

// ---------------------- For service staetes validation ----------------------
let serviceStatesArr = serviceStates || [];
if (typeof serviceStatesArr === 'string') {
  try { serviceStatesArr = JSON.parse(serviceStatesArr); } catch (e) { /* ignore */ }
}

if (!Array.isArray(serviceStatesArr)) serviceStatesArr = [];

// Validate serviceStates if provided
    if (serviceStatesArr && serviceStatesArr.length > 0) {
      // Step 1: Check valid ObjectId format
      if (!serviceStatesArr?.every(id => mongoose.Types.ObjectId.isValid(id))) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid state ID(s)" 
        });
      }

      // Step 2: Check existence in State collection
      const statesFromDb = await State.find({ 
        _id: { $in: serviceStatesArr } 
      }).select("_id");

      if (statesFromDb.length !== serviceStatesArr.length) {
        return res.status(400).json({ 
          success: false, 
          message: "Some state IDs do not exist" 
        });
      }
    }
// ---------------------/
const passwordValidation = validatePassword(password);
if (!passwordValidation.valid) {
  return res.status(400).json({
    success: false,
    message: passwordValidation.message,
  });
}

    console.log("Received files:", req.files); // Debug log

    // return;
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Function to upload file to S3
    const uploadToS3 = async (file, folder) => {
      if (!file) return null;

      const fileExtension = file.originalname.split(".").pop();
      const timestamp = Date.now();
      const key = `${folder}/${timestamp}.${fileExtension}`;

      const params = {
        Bucket: process.env.AWS_S3_PERSONASAL_FILE_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        // ACL: 'public-read' // Set appropriate ACL as needed
      };

      const data = await s3.upload(params).promise();
      return data.Location; // Returns the public URL
    };

    // // Upload files to S3
    // const [photoUrl, aadharImageUrl, panCardImageUrl] = await Promise.all([
    //   req.files?.photo?.[0]
    //     ? uploadToS3(req.files.photo[0], "employeeDocs")
    //     : null,
    //   req.files?.aadharImage?.[0]
    //     ? uploadToS3(req.files.aadharImage[0], "employeeDocs")
    //     : null,
    //   req.files?.panCardImage?.[0]
    //     ? uploadToS3(req.files.panCardImage[0], "employeeDocs")
    //     : null,
    // ]);

    const photoUrl = "fjatjsdjfafieafjelsfsdlfkskladjf";
    const aadharImageUrl = "fjatjsdjfafieafjelsfsdlfkskladjf";
    const panCardImageUrl = "fjatjsdjfafieafjelsfsdlfkskladjf";

    console.log(photoUrl);
    console.log(aadharImageUrl);
    console.log(panCardImageUrl, "45454545");
    // Create new employee with S3 URLs
    const newEmployee = new Employee({
      name,
      email,
      password: hashedPassword,
      role,
      zone: formattedZone, // Use the formatted zone here
      isEmailVerify: 0, // Using boolean instead of number
      phoneNumber,
      location,
      employeeId,
      address,
      pincode,
      isTelecaller,
      aadharNumber,
      panNumber,
      photo: photoUrl,
      aadharImage: aadharImageUrl,
      panCardImage: panCardImageUrl,
      serviceStates: serviceStatesArr,
      resetPasswordToken: {
        token: null,
        expires: null,
      },
    });

    await newEmployee.save();

     const html = welcomeTemplateOfQSTClientsTemplate(
        newEmployee.name,
        newEmployee.email,
        // tempPassword,
        password,
        `${process.env.CLIENT_BASE_URL}/login`
      );
       try{
      await sendEmail({
        to: newEmployee.email,
        subject: "Welcome on Quik Serv",
        html,
      }); } catch (err){
        console.error(`Email sending failed to ${newEmployee.email}:`, err.message);
      }

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      employee: {
        _id: newEmployee._id,
        name: newEmployee.name,
        email: newEmployee.email,
        role: newEmployee.role,
        zone: newEmployee.zone,
        isTelecaller: newEmployee?.isTelecaller,
        isEmailVerify: newEmployee.isEmailVerify,
        createdAt: newEmployee.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};


// Zone formatting function
function formatZone(zone) {
  if (!zone || typeof zone !== 'string') {
    return zone;
  }
  
  // Convert to lowercase and remove all spaces
  return zone.toLowerCase().replace(/\s+/g, '');
}

// it is used for  only company employee data (Not super Admin and other like qstClient) (use in employee module table)
exports.getAllEmployeeExceptSuperAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const query = {
      role: { $nin: ["superAdmin", "qstClient"] },
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
        { pincode: { $regex: search, $options: "i" } },
        { aadharNumber: { $regex: search, $options: "i" } },
        { panNumber: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
      ],
    };

    const totalEmployees = await Employee.countDocuments(query);
    const totalPages = Math.ceil(totalEmployees / limit);

    const employees = await Employee.find(query)
      .select("-password -resetPasswordToken")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // ------------
    // Get all employee IDs for ticket counting
    const employeeIds = employees.map((emp) => emp._id);

    // Get ticket counts in a single aggregation query (only if there are employees)
    let ticketCounts = [];
    if (employeeIds.length > 0) {
      try {
        ticketCounts = await Ticket.aggregate([
          {
            $match: {
              assignee: { $in: employeeIds },
            },
          },
          {
            $group: {
              _id: "$assignee",
              totalAssigned: { $sum: 1 },
              openTickets: {
                $sum: { $cond: [{ $eq: ["$isTicketClosed", false] }, 1, 0] },
              },
              closedTickets: {
                $sum: { $cond: [{ $eq: ["$isTicketClosed", true] }, 1, 0] },
              },
            },
          },
        ]);
      } catch (ticketError) {
        console.error("Error fetching ticket counts:", ticketError);
        // Continue without ticket counts if there's an error
        ticketCounts = [];
      }
    }

    // Create a lookup map for ticket counts
    const ticketMap = ticketCounts.reduce((acc, curr) => {
      acc[curr._id.toString()] = {
        totalAssigned: curr.totalAssigned,
        openTickets: curr.openTickets,
        closedTickets: curr.closedTickets,
      };
      return acc;
    }, {});

    // Add ticket info to each employee
    const employeesWithTickets = employees.map((employee) => ({
      ...employee,
      ticketInfo: ticketMap[employee._id.toString()] || {
        totalAssigned: 0,
        openTickets: 0,
        closedTickets: 0,
      },
    }));

    // -------------
    res.status(200).json({
      success: true,
      count: employees.length,
      totalEmployees,
      totalPages,
      page,
      limit,
      employees: employeesWithTickets,
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    console.error("Error stack:", error.stack);
    res
      .status(500)
      .json({
        message: "Internal Server Error",
        success: false,
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
  }
};


// here we remove the qstClient contacts details user💀👇
exports.getAllEmployee_Without_qstClient_contacts_user = async (req, res) => {
  try {
    const allowedRoles = ["cse", "superAdmin", "admin"];

    const employees = await Employee.find({
      role: { $in: allowedRoles },
    }).select("-password -resetPasswordToken");

    res.status(200).json({
      success: true,
      count: employees.length,
      message: "Get all employee successfuly",
      data: employees,
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// we export only company employee not employee created byqst client contact
exports.exportEmployeesWithoutQstContactEmployee = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "fromDate and toDate are required",
      });
    }

    const from = dayjs(fromDate).startOf("day").toDate();
    const to = dayjs(toDate).endOf("day").toDate();

    const employees = await Employee.find({
      role: { $nin: ["superAdmin", "qstClient"] },
      createdAt: { $gte: from, $lte: to },
    }).select("-password -resetPasswordToken");

    res.status(200).json({
      success: true,
      count: employees.length,
      message: "Filtered employees fetched successfully",
      data: employees,
    });
  } catch (error) {
    console.error("Error fetching filtered employees:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// // utils/passwordUtils.js
// const passwordValidator = (password) => {
//   const trimmedPassword = password?.trim();
  
//   // Validation checks
//   if (!trimmedPassword) {
//     return {
//       isValid: false,
//       message: "Password cannot be empty."
//     };
//   }

//   if (trimmedPassword.length < 8) {
//     return {
//       isValid: false,
//       message: "Password must be at least 8 characters long."
//     };
//   }

//   if (!/[A-Z]/.test(trimmedPassword)) {
//     return {
//       isValid: false,
//       message: "Password must contain at least one uppercase letter."
//     };
//   }

//   if (!/[a-z]/.test(trimmedPassword)) {
//     return {
//       isValid: false,
//       message: "Password must contain at least one lowercase letter."
//     };
//   }

//   if (!/\d/.test(trimmedPassword)) {
//     return {
//       isValid: false,
//       message: "Password must contain at least one number."
//     };
//   }

//   if (!/[!@#$%^&*()\-_=+{};:,<.>]/.test(trimmedPassword)) {
//     return {
//       isValid: false,
//       message: "Password must contain at least one special character."
//     };
//   }

//   return {
//     isValid: true,
//     trimmedPassword
//   };
// };

// module.exports = { passwordValidator };


// utils/passwordUtils.js
const passwordValidator = (password) => {
  const trimmedPassword = password?.trim();
  
  if (!trimmedPassword) {
    return { isValid: false, message: "Password cannot be empty." };
  }

  if (trimmedPassword.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters long." };
  }

  const hasUpper = /[A-Z]/.test(trimmedPassword);
  const hasLower = /[a-z]/.test(trimmedPassword);
  const hasNumber = /\d/.test(trimmedPassword);
  const hasSpecial = /[!@#$%^&*()\-_=+{};:,<.>]/.test(trimmedPassword);

  if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
    let message = "Password must contain:";
    if (!hasUpper || !hasLower) message += " both uppercase and lowercase letters,";
    
    // Combined number and special character message
    if (!hasNumber && !hasSpecial) {
      message += " at least one number and special character,";
    } else {
      if (!hasNumber) message += " at least one number,";
      if (!hasSpecial) message += " at least one special character,";
    }
    
    // Remove trailing comma and add period
    message = message.replace(/,$/, '.');
    
    return { isValid: false, message };
  }

  return {
    isValid: true,
    trimmedPassword
  };
};

module.exports = { passwordValidator };
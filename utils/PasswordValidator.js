
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
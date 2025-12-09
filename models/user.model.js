const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');



const userSchema = new mongoose.Schema({
  name:{type:String,required:true
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  role: {
    type: String,
    enum: ['cse', 'admin', 'superAdmin'],
    default: 'cse',
  },
  resetPasswordToken: {
    token: String,
    expires: Date,
  },
  isEmailVerify:{
    type:Number,required:true, default:0,
  }
}, { timestamps: true });

// Password hashing
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare passwords
userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// // Generate reset token
// userSchema.methods.getResetPasswordToken = function () {
//   const rawToken = crypto.randomBytes(20).toString('hex');
//   const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');
//   this.resetPasswordToken = {
//     token: hashed,
//     expires: Date.now() + 15 * 60 * 1000, // 15 minutes
//   };
//   return rawToken;
// };

module.exports = mongoose.model('User', userSchema);

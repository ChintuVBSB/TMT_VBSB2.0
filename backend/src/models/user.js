import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["admin", "manager", "staff", "client"],
    default: "read_only"
  },
  photo: { type: String, default: "https://www.freepik.com/free-photos-vectors/no-profile" },


  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },

  

  otp: String,
  otp_expiry: Date,

  created_at: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model("User", userSchema);

export default User;

//testing 

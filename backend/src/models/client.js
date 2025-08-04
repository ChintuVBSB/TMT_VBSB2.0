import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    // Client ka naam, jaise "ABC Pvt Ltd" ya "Tata Group"
    name: {
      type: String,
      required: true,
      unique: true, // Har client ka naam unique hona chahiye
    },
    // Client ka email (Optional)
    email: {
      type: String,
      // unique: true, // Aap ise unique rakh sakte hain agar chahein
      sparse: true, // Isse null values par unique constraint nahi lagega
    },

    // ✅ FIXED: Parent-Child relationship ke liye
    // Yeh field parent client (group) ki ID store karega
    // Agar yeh client khud ek parent group hai, to yeh null rahega
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client", // Yeh 'Client' model ko hi refer kar raha hai
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Client = mongoose.model("Client", clientSchema);

export default Client;
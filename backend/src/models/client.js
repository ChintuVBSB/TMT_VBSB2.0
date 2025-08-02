// models/Client.js
import mongoose from "mongoose";
const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: String,
  gstin: String,
});
export default mongoose.model("Client", clientSchema);
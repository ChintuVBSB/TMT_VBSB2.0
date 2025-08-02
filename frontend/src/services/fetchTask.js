import api from "../../services/api"; // 🔁 rename it to avoid confusion

const fetchStaff = async () => {
  const res = await api.get("/user/staff-only"); // ✅ instance ka get method
};

export default fetchStaff;  
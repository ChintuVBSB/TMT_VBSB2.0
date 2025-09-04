
import {Download} from "lucide-react"
import toast from "react-hot-toast";
import { getToken } from "../../utils/token";
import axios from "../../services/api";


const StaffExport = ({ filters }) => {
  const handleExport = async () => {
    console.log("Filters being sent:", filters);

    try {
      const res = await axios.get("/timelog/export-logs", {
        params: {
          from: filters.fromDate,
          to: filters.toDate,
        },
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `My-Timelogs-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error("Failed to export time logs");
    }
  };

  return (
    <button
      onClick={handleExport}
      className="bg-blue-600 mb-5 text-white px-4 py-2 ml-4 flex items-center gap-2 rounded hover:bg-blue-700"
    >
      <Download size={16} /> Export My Logs
    </button>
  );
};

export default StaffExport;

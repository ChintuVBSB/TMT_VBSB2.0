// frontend/components/MISExport.jsx
import { useContext } from "react";
import { getToken } from "../../../utils/token";
import axios from "../../../services/api";
// import { ReportFilterContext } from "../../context/ReportFilterContext";
import toast from "react-hot-toast";
import { Download } from "lucide-react";

const MISExport = ({filters}) => {
  // const { filters } = useContext(ReportFilterContext);

  const handleExport = async () => {
    try {
      const res = await axios.get("/reports/mis-export", {
        params: {
          from: filters.fromDate,
          to: filters.toDate,
          groupBy: filters.groupBy,
          format: "csv",
        },
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `MIS-Report-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("CSV Export failed", err);
      toast.error("Failed to export report");
    }
  };

  return (
    <button
      onClick={handleExport}
      className="bg-black mb-5 text-white px-4 py-2 ml-4 flex items-center gap-2 rounded hover:bg-gray-800"
    >
      <Download size={16} /> Timelog Sheet
    </button>
  );
};

export default MISExport;

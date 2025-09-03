import { useState, useEffect } from "react";
import axios from "../../services/api";
import { getToken } from "../../utils/token";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import AdminNavbar from "../../components/navbars/AdminNavbar";

import {
  Building2,
  UserPlus,
  UsersRound,
  Download,
} from "lucide-react";
import { MdEmail } from "react-icons/md";
import Papa from "papaparse";

function AddClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  //CHANGE: State ka naam 'parentId' se 'groupId' kar diya for consistency
  const [groupId, setGroupId] = useState("");
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredClients, setFilteredClients] = useState([]);

  // Fetch clients to populate dropdown and list
  const fetchClients = async () => {
    try {
      const res = await axios.get("/clients", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setClients(res.data);
      setFilteredClients(res.data);
    } catch (err) {
      toast.error("Failed to fetch clients");
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Update search to work with new schema
  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    const filtered = clients.filter(
      (client) =>
        client.name.toLowerCase().includes(lowerSearch) ||
        (client.email && client.email.toLowerCase().includes(lowerSearch)) ||
        (client.group && client.group.name.toLowerCase().includes(lowerSearch)) // Yeh pehle se sahi tha
    );
    setFilteredClients(filtered);
  }, [search, clients]);

  const handleCSVUpload = async (e) => {
    // ... (Is function mein koi change nahi)
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data;
        try {
          const res = await axios.post(
            "/clients/upload",
            { clients: data },
            { headers: { Authorization: `Bearer ${getToken()}` } }
          );
          toast.success(res.data.message || "Clients imported!");
          fetchClients();
        } catch (err) {
          toast.error(
            "CSV upload failed. Make sure the backend is configured for the new format."
          );
          console.error(err);
        }
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ✅ CHANGE: Ab 'parentId' ki jagah 'groupId' bhej rahe hain
      await axios.post(
        "/clients",
        { name, email, group: groupId || null }, // Send null if no group is selected
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      toast.success("Client added!");
      setName("");
      setEmail("");
      setGroupId(""); // ✅ CHANGE: Dropdown ko reset kiya
      fetchClients();
    } catch (err) {
       const msg = err.response?.data?.message || "Something went wrong!";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle CSV download
  const handleDownloadCSV = () => {
    if (clients.length === 0) {
      toast.error("No clients to download.");
      return;
    }

    // ✅ CHANGE: Yahan 'client.parent' ko 'client.group' kar diya
    const dataForCSV = clients.map((client) => ({
      name: client.name,
      email: client.email || "",
      parentName: client.group ? client.group.name : "", // <-- THEEK KAR DIYA
    }));

    const csv = Papa.unparse(dataForCSV);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "clients_list.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    toast.success("Client list is downloading!");
  };

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen bg-gray-50 pt-28 px-4 py-10">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <UserPlus className="w-6 h-6 text-blue-600" /> Add New Client
          </h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 mb-8">
            {/* ... Client Name & Email inputs waise hi rahenge ... */}
             <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4" />
                Client / Group Name*
              </label>
              <input
                placeholder="e.g. ABC Pvt Ltd or Tata Group"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Parent Group Selection Dropdown */}
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1">
                <UsersRound className="w-4 h-4" />
                Client Group (Optional)
              </label>
              <select
                // ✅ CHANGE: 'parentId' ko 'groupId' se badal diya
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- None (This is a Parent Group) --</option>
                {clients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
             <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1">
                <MdEmail className="w-4 h-4" />
                Email
              </label>
              <input
                type="email"
                placeholder="e.g. contact@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-md font-semibold ${
                  loading ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-700"
                }`}
              >
                {loading ? <Loader /> : "Add Client"}
              </button>
            </div>
          </form>

          {/* ... CSV Upload section waise hi rahega ... */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border">
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Bulk Upload via CSV
            </label>
            <p className="text-xs text-gray-500 mb-2">CSV columns should be: <strong>name, email, parentName</strong> (parentName is optional and must match an existing client name).</p>
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 rounded-md"
            />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
            <Building2 className="w-5 h-5" /> Existing Clients
          </h2>
          <button
                  onClick={handleDownloadCSV}
                  disabled={clients.length === 0}
                  className="flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                  <Download size={16} />
                  Download CSV
              </button>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search clients by name, email, or group..."
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="max-h-80 overflow-y-auto border rounded-md">
              {filteredClients.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {filteredClients.map((client) => (
                    <li key={client._id} className="p-3">
                      <p className="font-semibold text-gray-800">
                        {client.name}
                      </p>
                      <span className="text-sm text-gray-500">
                        {/* ✅ CHANGE: Yahan 'client.parent' ko 'client.group' kar diya */}
                        Group:{" "}
                        <strong className="text-gray-700">
                          {client.group ? client.group.name : "N/A"}
                        </strong>{" "}
                        | Email:{" "}
                        <strong className="text-gray-700">
                          {client.email || "N/A"}
                        </strong>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="p-4 text-center text-gray-500">
                  No clients found.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AddClient;
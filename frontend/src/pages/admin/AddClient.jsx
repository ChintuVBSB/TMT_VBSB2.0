import { useState, useEffect } from "react";
import axios from "../../services/api";
import { getToken } from "../../utils/token";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import AdminNavbar from "../../components/navbars/AdminNavbar";

import {
  Building2,
  Phone,
  ScrollText,
  UserPlus,
  UsersRound
} from "lucide-react";
import { MdEmail } from "react-icons/md";
import Papa from "papaparse"; // CSV parser

function AddClient() {
  const [name, setName] = useState("");
  const [gstin, setGstin] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredClients, setFilteredClients] = useState([]);

  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    const filtered = clients.filter(
      (client) =>
        client.name.toLowerCase().includes(lowerSearch) ||
        (client.email && client.email.toLowerCase().includes(lowerSearch)) ||
        (client.gstin && client.gstin.toLowerCase().includes(lowerSearch))
    );
    setFilteredClients(filtered);
  }, [search, clients]);

  const fetchClients = async () => {
    try {
      const res = await axios.get("/clients", {
        headers: { Authorization: `Bearer ${getToken()}` }
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

  const handleCSVUpload = async (e) => {
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
          toast.error("CSV upload failed");
          console.error(err);
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        "/clients",
        { name, gstin, email },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      toast.success("Client added!");
      setName("");
      setGstin("");
      setEmail("");
      fetchClients(); // refresh list
    } catch (err) {
      toast.error("Error adding client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen bg-gray-50 pt-26 px-4 py-10">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold text-purple-700 mb-6 flex items-center gap-2">
            <UserPlus className="w-6 h-6" /> Add Client
          </h1>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
          >
            <div>
              <label className="text-sm font-medium flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                Client Name
              </label>
              <input
                placeholder="e.g. ABC Pvt Ltd"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="text-sm font-medium flex items-center gap-1">
                <ScrollText className="w-4 h-4" />
                GSTIN
              </label>
              <input
                placeholder="e.g. 22AAAAA0000A1Z5"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <MdEmail className="w-4 h-4" />
                Email
              </label>
              <input
                type="email"
                placeholder="e.g. client@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 bg-purple-700 text-white px-4 py-2 rounded ${
                  loading ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {loading ? <Loader /> : "Add Client"}
              </button>
            </div>
          </form>

          <div className="sm:col-span-2 mb-5 mt-4">
            <label className="text-sm font-medium mb-1 block">
              Upload CSV (name, email, gstin)
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
          </div>

          <h2 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <UsersRound className="w-5 h-5" /> Existing Clients
          </h2>

          <div className="mt-6">
            <input
              type="text"
              placeholder="Search clients..."
              className="w-full p-2 border border-gray-300 rounded mb-4"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="max-h-72 overflow-y-auto border rounded p-2">
              {filteredClients.length > 0 ? (
                <ul className="divide-y text-sm">
                  {filteredClients.map((client) => (
                    <li key={client._id} className="py-2">
                      <strong>{client.name}</strong> <br />
                      <span className="text-gray-600">
                        GSTIN: {client.gstin || "N/A"} | Contact:{" "}
                        {client.email || "N/A"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No clients found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AddClient;

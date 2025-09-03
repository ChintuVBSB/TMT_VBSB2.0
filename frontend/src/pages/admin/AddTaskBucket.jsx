import { useEffect, useState } from "react";
import axios from "../../services/api";
import { getToken } from "../../utils/token";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import AdminNavbar from "../../components/navbars/AdminNavbar";
import { LayoutList, CheckLine } from "lucide-react";
import Papa from "papaparse";

function AddTaskBucket() {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [buckets, setBuckets] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredBuckets, setFilteredBuckets] = useState([]);

  // Fetch buckets on mount
  useEffect(() => {
    fetchBuckets();
  }, []);

  // Filter buckets when search or list changes
  useEffect(() => {
    const query = search.toLowerCase();
    const filtered = buckets.filter((bucket) =>
      bucket.title.toLowerCase().includes(query)
    );
    setFilteredBuckets(filtered);
  }, [search, buckets]);

  const fetchBuckets = async () => {
    try {
      const res = await axios.get("/task-buckets", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setBuckets(res.data);
      setFilteredBuckets(res.data);
    } catch (err) {
      toast.error("Failed to fetch buckets");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        "/task-buckets",
        { title },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      toast.success("Task Bucket added!");
      setTitle("");
      fetchBuckets();
    } catch (err) {
       const msg = err.response?.data?.message || "Something went wrong!";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const data = results.data;
          await axios.post(
            "/task-buckets/upload",
            { buckets: data },
            {
              headers: { Authorization: `Bearer ${getToken()}` },
            }
          );
          toast.success("Buckets imported!");
          fetchBuckets();
        } catch (err) {
          toast.error("CSV upload failed");
          console.error(err);
        }
      },
    });
  };

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen px-4 pt-32 py-10 bg-gray-50">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-purple-700 mb-4">
            <LayoutList /> Add Task Bucket
          </h1>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6"
          >
            <input
              type="text"
              placeholder="Bucket Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="flex-1 px-4 py-2 border rounded-md w-full sm:w-auto"
            />
            <button
              type="submit"
              disabled={loading}
              className={`bg-purple-700 hover:bg-purple-800 text-white px-6 py-2 rounded-md flex items-center justify-center gap-2 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <>
                  <Loader /> Adding...
                </>
              ) : (
                "Add Bucket"
              )}
            </button>
          </form>

          {/* CSV Upload */}
          <div className="mb-6">
            <label className="text-sm font-medium block mb-1">
              Upload CSV (with `title` column)
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search buckets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border rounded mb-4"
          />

          <h2 className="text-lg flex items-center gap-2 font-semibold text-gray-700 mb-2">
            <CheckLine /> Existing Task Buckets:
          </h2>

          {/* Scrollable Bucket List */}
          <div className="max-h-64 overflow-y-auto border rounded p-3">
            {filteredBuckets.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1 text-gray-800 text-sm">
                {filteredBuckets.map((bucket) => (
                  <li key={bucket._id}>{bucket.title}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No task buckets found.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AddTaskBucket;

// src/pages/tasks/TimeLogPage.jsx
import { useEffect, useState, useMemo } from "react";
import axios from "../../services/api";
import { getToken } from "../../utils/token";
import toast from "react-hot-toast";
import debounce from "lodash.debounce";
import {
  CalendarDays,
  Clock4,
  ClipboardList,
  TimerReset,
  User,
  Pencil,
  Trash
} from "lucide-react";
import StaffNavbar from "../../components/navbars/StaffNavbar";

function TimeLogPage() {
  const [clients, setClients] = useState([]);
  const [buckets, setBuckets] = useState([]);
  const [draftLogs, setDraftLogs] = useState([]);
  const [searchClient, setSearchClient] = useState("");
  const [searchBucket, setSearchBucket] = useState("");
  const [filteredClients, setFilteredClients] = useState([]);
  const [filteredBuckets, setFilteredBuckets] = useState([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [isClientFocused, setIsClientFocused] = useState(false);
  const [isBucketFocused, setIsBucketFocused] = useState(false);
  const [editingLog, setEditingLog] = useState(null);

  const [form, setForm] = useState({
    workingDate: "",
    title: "",
    client: "",
    bucket: "",
    customBucket: "",
    description: "",
    startTime: "",
    endTime: "",
    assignedBy: "",
    status: "",
    completionDate: ""
  });

  useEffect(() => {
    fetchClients();
    fetchBuckets();
    fetchDraftLogs();

    const today = new Date().toISOString().split("T")[0];
    setForm((prev) => ({ ...prev, workingDate: today }));
  }, []);

  const fetchClients = async () => {
    const res = await axios.get("/clients", {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    setClients(res.data);
    setFilteredClients(res.data);
  };

  const fetchBuckets = async () => {
    const res = await axios.get("/task-buckets", {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    setBuckets(res.data);
    setFilteredBuckets(res.data);
  };

  const fetchDraftLogs = async () => {
    try {
      const res = await axios.get("/timelog/drafts", {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setDraftLogs(res.data);
    } catch (err) {
      toast.error("Failed to fetch drafts");
    }
  };

  useEffect(() => {
    if (form.startTime && form.endTime) {
      const start = new Date(`1970-01-01T${form.startTime}`);
      const end = new Date(`1970-01-01T${form.endTime}`);
      const diff = (end - start) / (1000 * 60);
      setTotalMinutes(diff > 0 ? diff : 0);
    }
  }, [form.startTime, form.endTime]);

  const debouncedClientFilter = useMemo(
    () =>
      debounce((query) => {
        const result = clients.filter((client) =>
          client.name.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredClients(result);
      }, 300),
    [clients]
  );

  const debouncedBucketFilter = useMemo(
    () =>
      debounce((query) => {
        const result = buckets.filter((bucket) =>
          bucket.title.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredBuckets(result);
      }, 300),
    [buckets]
  );

  useEffect(() => {
    debouncedClientFilter(searchClient);
  }, [searchClient]);

  useEffect(() => {
    debouncedBucketFilter(searchBucket);
  }, [searchBucket]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (log) => {
    setEditingLog(log);
  };

  const handleSaveDraft = async (e) => {
    e.preventDefault();
    const log = {
      title: form.title,
      client: form.client,
      working_date: form.workingDate,
      task_bucket: form.customBucket || form.bucket,
      task_description: form.description,
      start_time: form.startTime,
      end_time: form.endTime,
      total_minutes: totalMinutes,
      assigned_by: form.assignedBy,
      status: form.status,
      completion_date: form.status === "Completed" ? form.completionDate : ""
    };

    try {
      await axios.post("/timelog/save-draft", log, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      toast.success("Saved to Drafts!");
      setForm({
        title: "",
        workingDate: form.workingDate,
        client: "",
        bucket: "",
        customBucket: "",
        description: "",
        startTime: "",
        endTime: "",
        assignedBy: "",
        status: "",
        completionDate: ""
      });
      setSearchClient("");
      setSearchBucket("");
      setTotalMinutes(0);
      fetchDraftLogs();
    } catch (err) {
      toast.error("Error saving draft");
    }
  };

  const handleSubmitAllLogs = async () => {
    try {
      await axios.patch(
        "/timelog/submit-all",
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      toast.success("All logs submitted!");
      fetchDraftLogs();
    } catch (err) {
      toast.error("Submission failed");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this draft?"
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/timelog/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Draft deleted successfully!");
      fetchDraftLogs(); // refresh list
    } catch (err) {
      console.error("Delete Error:", err.message);
      toast.error("Failed to delete draft");
    }
  };

  return (
    <>
    <StaffNavbar/>
      {editingLog && (
        <div className="fixed  inset-0 bg-[#0000005b] backdrop-blur-sm bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl shadow-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Edit Draft Log</h2>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await axios.put(`/timelog/${editingLog._id}`, editingLog, {
                    headers: { Authorization: `Bearer ${getToken()}` }
                  });
                  toast.success("Draft updated!");
                  setEditingLog(null);
                  fetchDraftLogs(); // refresh list
                } catch (err) {
                  toast.error("Error updating draft");
                }
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                {/* Working Date */}
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    Working Date
                  </label>
                  <input
                    type="date"
                    value={editingLog.working_date?.slice(0, 10)}
                    onChange={(e) =>
                      setEditingLog({
                        ...editingLog,
                        working_date: e.target.value
                      })
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>

                {/* Task Title */}
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    Task Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter title"
                    value={editingLog.title}
                    onChange={(e) =>
                      setEditingLog({ ...editingLog, title: e.target.value })
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>

                {/* Client Dropdown */}
                <div className="col-span-1">
                  <label className="text-sm font-medium text-gray-700">
                    Client
                  </label>
                  <select
                    className="w-full border p-2 rounded"
                    value={editingLog.client}
                    onChange={(e) =>
                      setEditingLog({ ...editingLog, client: e.target.value })
                    }
                  >
                    <option value="">Search clients</option>
                    {clients.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Task Bucket Dropdown */}
                <div className="col-span-1">
                  <label className="text-sm font-medium text-gray-700">
                    Task Bucket
                  </label>
                  <select
                    className="w-full border p-2 rounded"
                    value={editingLog.task_bucket}
                    onChange={(e) =>
                      setEditingLog({
                        ...editingLog,
                        task_bucket: e.target.value
                      })
                    }
                  >
                    <option value="">Search buckets</option>
                    {buckets.map((bucket) => (
                      <option key={bucket._id} value={bucket._id}>
                        {bucket.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom Bucket */}
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    Custom Bucket
                  </label>
                  <input
                    type="text"
                    placeholder="Or enter custom"
                    value={editingLog.custom_bucket || ""}
                    onChange={(e) =>
                      setEditingLog({
                        ...editingLog,
                        custom_bucket: e.target.value
                      })
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter description"
                    value={editingLog.task_description}
                    onChange={(e) =>
                      setEditingLog({
                        ...editingLog,
                        task_description: e.target.value
                      })
                    }
                    className="w-full border p-2 rounded"
                  ></textarea>
                </div>

                {/* Start Time */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={editingLog.start_time}
                    onChange={(e) =>
                      setEditingLog({
                        ...editingLog,
                        start_time: e.target.value
                      })
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>

                {/* End Time */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={editingLog.end_time}
                    onChange={(e) =>
                      setEditingLog({ ...editingLog, end_time: e.target.value })
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>

                {/* Total Minutes (read-only) */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Total Minutes
                  </label>
                  <input
                    type="number"
                    readOnly
                    value={editingLog.total_minutes}
                    className="w-full border p-2 rounded bg-gray-100"
                  />
                </div>

                {/* Assigned By */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Assigned By
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Vaibhav sir"
                    value={editingLog.assigned_by}
                    onChange={(e) =>
                      setEditingLog({
                        ...editingLog,
                        assigned_by: e.target.value
                      })
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    className="w-full border p-2 rounded"
                    value={editingLog.status}
                    onChange={(e) =>
                      setEditingLog({ ...editingLog, status: e.target.value })
                    }
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* Completion Date */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Completion Date
                  </label>
                  <input
                    type="date"
                    value={editingLog.completion_date?.slice(0, 10) || ""}
                    onChange={(e) =>
                      setEditingLog({
                        ...editingLog,
                        completion_date: e.target.value
                      })
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end mt-6 gap-3">
                <button
                  type="button"
                  onClick={() => setEditingLog(null)}
                  className="px-4 py-2 border rounded bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="px-4 py-6 mt-18 md:px-8 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-purple-800 mb-4 flex items-center gap-2">
          <TimerReset className="w-6 h-6" /> Time Logger
        </h1>

        <form
          onSubmit={handleSaveDraft}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl shadow-md border"
        >
          <div>
            <label className="text-sm font-medium flex items-center gap-1">
              <CalendarDays className="w-4 h-4" /> Working Date
            </label>
            <input
              type="date"
              name="workingDate"
              value={form.workingDate}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded-md focus:outline-purple-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Task Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter title"
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>

          <div className="relative">
            <label className="text-sm font-medium">Search Client</label>
            <input
              type="text"
              value={searchClient}
              onChange={(e) => {
                setSearchClient(e.target.value);
                setForm((prev) => ({ ...prev, client: "" }));
              }}
              onFocus={() => setIsClientFocused(true)}
              onBlur={() => setTimeout(() => setIsClientFocused(false), 200)}
              placeholder="Search clients"
              className="w-full px-3 py-2 border rounded-md"
            />
            {isClientFocused && filteredClients.length > 0 && (
              <ul className="absolute z-10 bg-white border mt-1 rounded-md max-h-40 overflow-y-auto w-full shadow-sm">
                {filteredClients.map((c) => (
                  <li
                    key={c._id}
                    className="px-3 py-2 cursor-pointer hover:bg-purple-100"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, client: c._id }));
                      setSearchClient(c.name);
                      setIsClientFocused(false);
                    }}
                  >
                    {c.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="relative">
            <label className="text-sm font-medium">Search Task Bucket</label>
            <input
              type="text"
              value={searchBucket}
              onChange={(e) => {
                setSearchBucket(e.target.value);
                setForm((prev) => ({ ...prev, bucket: "" }));
              }}
              onFocus={() => setIsBucketFocused(true)}
              onBlur={() => setTimeout(() => setIsBucketFocused(false), 200)}
              placeholder="Search buckets"
              className="w-full px-3 py-2 border rounded-md"
            />
            {isBucketFocused && filteredBuckets.length > 0 && (
              <ul className="absolute z-10 bg-white border mt-1 rounded-md max-h-40 overflow-y-auto w-full shadow-sm">
                {filteredBuckets.map((b) => (
                  <li
                    key={b._id}
                    className="px-3 py-2 cursor-pointer hover:bg-purple-100"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, bucket: b.title }));
                      setSearchBucket(b.title);
                      setIsBucketFocused(false);
                    }}
                  >
                    {b.title}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Custom Bucket</label>
            <input
              name="customBucket"
              value={form.customBucket}
              onChange={handleChange}
              placeholder="Or enter custom"
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <ClipboardList className="w-4 h-4" /> Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium flex items-center gap-1">
              <Clock4 className="w-4 h-4" /> Start Time
            </label>
            <input
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium flex items-center gap-1">
              <Clock4 className="w-4 h-4" /> End Time
            </label>
            <input
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>

          <div className="col-span-1 sm:col-span-2 bg-purple-100 text-purple-800 px-4 py-2 rounded text-sm font-semibold">
            Total Minutes: {totalMinutes}
          </div>

          <div>
            <label className="text-sm font-medium flex items-center gap-1">
              <User className="w-4 h-4" /> Assigned By
            </label>
            <input
              name="assignedBy"
              placeholder="Ex: Vaibhav sir"
              value={form.assignedBy}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Status</label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="status"
                  value="Pending"
                  checked={form.status === "Pending"}
                  onChange={handleChange}
                />
                Pending
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="status"
                  value="Completed"
                  checked={form.status === "Completed"}
                  onChange={handleChange}
                />
                Completed
              </label>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Completion Date</label>
            <input
              type="date"
              name="completionDate"
              value={form.completionDate}
              onChange={handleChange}
              disabled={form.status === "Pending"}
              className="w-full border px-3 py-2 rounded-md disabled:bg-gray-100"
            />
          </div>

          <button
            type="submit"
            className="col-span-1 sm:col-span-2 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md font-semibold"
          >
            + Add to Drafts
          </button>
        </form>

        <div className="text-right mt-5 mb-6">
          <button
            onClick={handleSubmitAllLogs}
            className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
          >
            Submit All Logs
          </button>
        </div>

        <div className="bg-white p-4 mt-10 rounded-lg shadow-md border">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            📋 Saved Draft Logs
          </h2>
          <div className="w-full overflow-auto">
            <table className="min-w-full text-sm table-auto border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-2 text-left whitespace-nowrap">
                    Date
                  </th>
                  <th className="border px-3 py-2 text-left whitespace-nowrap">
                    Title
                  </th>
                  <th className="border px-3 py-2 text-left whitespace-nowrap">
                    Client
                  </th>
                  <th className="border px-3 py-2 text-left whitespace-nowrap">
                    Bucket
                  </th>
                  <th className="border px-3 py-2 text-left">Description</th>
                  <th className="border px-3 py-2 text-left whitespace-nowrap">
                    Start
                  </th>
                  <th className="border px-3 py-2 text-left whitespace-nowrap">
                    End
                  </th>
                  <th className="border px-3 py-2 text-center whitespace-nowrap">
                    Minutes
                  </th>
                  <th className="border px-3 py-2 text-left whitespace-nowrap">
                    Assigned By
                  </th>
                  <th className="border px-3 py-2 text-left whitespace-nowrap">
                    Completed On
                  </th>
                  <th className="border px-3 py-2 text-left whitespace-nowrap">
                    Status
                  </th>
                  <th className="border px-3 py-2 text-center whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {draftLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="border px-3 py-2 whitespace-nowrap">
                      {new Date(log.working_date).toLocaleDateString()}
                    </td>
                    <td className="border px-3 py-2 max-w-[150px] truncate">
                      {log.title}
                    </td>
                    <td className="border px-3 py-2 whitespace-nowrap">
                      {clients.find((c) => c._id === log.client)?.name ||
                        log.client}
                    </td>
                    <td className="border px-3 py-2 whitespace-nowrap">
                      {buckets.find((b) => b._id === log.task_bucket)?.title ||
                        log.task_bucket}
                    </td>
                    <td className="border px-3 py-2 max-w-[200px] truncate">
                      {log.task_description}
                    </td>
                    <td className="border px-3 py-2 whitespace-nowrap">
                      {log.start_time}
                    </td>
                    <td className="border px-3 py-2 whitespace-nowrap">
                      {log.end_time}
                    </td>
                    <td className="border px-3 py-2 text-center whitespace-nowrap">
                      {log.total_minutes}
                    </td>
                    <td className="border px-3 py-2 whitespace-nowrap">
                      {log.assigned_by}
                    </td>
                    <td className="border px-3 py-2 whitespace-nowrap">
                      {log.completion_date
                        ? new Date(log.completion_date).toLocaleDateString()
                        : "Pending"}
                    </td>
                    <td className="border px-3 py-2 whitespace-nowrap">
                      {log.status}
                    </td>
                    <td className="border px-3 py-2 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(log)}
                          className="text-blue-600 hover:underline"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(log._id)}
                          className="text-red-600 hover:underline"
                          title="Delete"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default TimeLogPage;

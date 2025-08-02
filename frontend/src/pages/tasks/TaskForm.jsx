import React, { useState, useEffect, useRef } from "react";
import { Calendar, Paperclip, ChevronDown } from "lucide-react";
import FileUploadModal from "./FileUploadModal";
import { getToken } from "../../utils/token";
import axios from "../../services/api";
import toast from "react-hot-toast";
import debounce from "lodash.debounce";

const TaskForm = ({ users: initialUsers, taskBucket, clients }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [client, setClient] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [files, setFiles] = useState([]);
  // const [scheduledDate, setScheduledDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [recurring, setrecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState("");

  const [searchUser, setSearchUser] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(initialUsers);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchClient, setSearchClient] = useState("");
  const [filteredClients, setFilteredClients] = useState(clients);
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  const [isServiceTypeOpen, setIsServiceTypeOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    const debounced = debounce(() => {
      const list = initialUsers.filter((u) =>
        u.name.toLowerCase().includes(searchUser.toLowerCase())
      );
      setFilteredUsers(list);
    }, 300);
    debounced();
    return () => debounced.cancel();
  }, [searchUser, initialUsers]);

  useEffect(() => {
    const debounced = debounce(() => {
      const list = clients.filter((c) =>
        c.name.toLowerCase().includes(searchClient.toLowerCase())
      );
      setFilteredClients(list);
    }, 300);
    debounced();
    return () => debounced.cancel();
  }, [searchClient, clients]);

  const handleAddTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      setTags((prev) => [...prev, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) =>
    setTags(tags.filter((t) => t !== tagToRemove));

  const handleUploadComplete = (selectedFiles) => {
    setFiles(selectedFiles);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(dueDate);
    selectedDate.setHours(0, 0, 0, 0);

    if (!dueDate || selectedDate < today) {
      toast.error("Due date cannot be in the past.");
      return;
    }

    setIsSubmitting(true);
    isSubmittingRef.current = true;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("assigned_to", assignee);
    formData.append("priority", priority);
    formData.append("client", client);
    formData.append("serviceType", serviceType);
    formData.append("due_date", dueDate);
    // formData.append("scheduled_date", scheduledDate);
    formData.append("recurring", recurring);
    formData.append("recurringFrequency", recurringFrequency);


    tags.forEach((tag) => formData.append("tags[]", tag));
    if (files.length > 0) {
  files.forEach(file => {
    formData.append("attachments", file);
  });
}


    try {
      await axios.post("/assign/tasks", formData, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      toast.success("Task Assigned");
      setTitle("");
      setDescription("");
      setAssignee("");
      setClient("");
      setPriority("Medium");
      setServiceType("");
      setDueDate("");
      setTags([]);
      setFiles([]);
      setSearchUser("");
      setSearchClient("");
    } catch (err) {
      console.error("Failed to create task:", err);
      toast.error("Task creation failed");
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <>
      <div className="min-h-screen mt-18 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Side - Image and Intro */}
          <div className="bg-gray-50 flex flex-col justify-center items-center px-8 py-16">
            <img
              src="/undraw_add-tasks_mvlb.svg"
              alt="Create Task Illustration"
              className="w-80 h-auto mb-6"
            />
            <h1 className="text-4xl font-bold text-gray-800 text-center mb-2">
              Create a New Task
            </h1>
            <p className="text-gray-600 text-center max-w-md">
              Streamline your workflow by assigning and tracking tasks in just a
              few clicks.
            </p>
          </div>

          {/* Right Side - Form */}
          <div className="px-6 py-10">
            <form
              onSubmit={submitHandler}
              className="bg-white border border-gray-200 rounded-lg shadow-md p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold">Task Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="w-full mt-1 px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full mt-1 px-4 py-2 border rounded-lg resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold">Tags</label>
                    <div className="flex flex-wrap gap-2 mt-1 px-4 py-2 border rounded-lg">
                      {tags.map((tag, i) => (
                        <span
                          key={i}
                          className="bg-black text-white px-2 py-1 rounded-full text-sm"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-1 text-white"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        className="flex-1 min-w-[100px] border-none outline-none"
                        placeholder="Press Enter to add"
                      />
                    </div>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => setIsUploadModalOpen(true)}
                      className="text-sm flex items-center text-blue-700"
                    >
                      <Paperclip className="w-4 h-4 mr-1" /> Attach File
                      {files.length > 0 && (
                        <span className="ml-2 bg-black text-white px-2 py-1 text-xs rounded-full">
                          {files.length}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Right form section */}
                <div className="space-y-4">
                  <div className="relative">
                    <label className="text-sm font-semibold">Assign To</label>
                    <input
                      type="text"
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                      onFocus={() => setShowUserDropdown(true)}
                      onBlur={() =>
                        setTimeout(() => setShowUserDropdown(false), 200)
                      }
                      placeholder="Search staff"
                      className="w-full mt-1 px-4 py-2 border rounded-lg"
                    />
                    {showUserDropdown && (
                      <ul className="absolute z-10 bg-white border rounded mt-1 max-h-48 overflow-y-auto w-full shadow-lg">
                        {filteredUsers.map((user) => (
                          <li
                            key={user._id}
                            onMouseDown={() => {
                              setAssignee(user._id);
                              setSearchUser(user.name);
                              setShowUserDropdown(false);
                            }}
                            className="px-4 py-2 hover:bg-gray-100 text-sm cursor-pointer"
                          >
                            {user.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="relative">
                    <label className="text-sm font-semibold">Client</label>
                    <input
                      type="text"
                      value={searchClient}
                      onChange={(e) => setSearchClient(e.target.value)}
                      onFocus={() => setShowClientDropdown(true)}
                      onBlur={() =>
                        setTimeout(() => setShowClientDropdown(false), 200)
                      }
                      placeholder="Search client"
                      className="w-full mt-1 px-4 py-2 border rounded-lg"
                    />
                    {showClientDropdown && (
                      <ul className="absolute z-10 bg-white border rounded mt-1 max-h-48 overflow-y-auto w-full shadow-lg">
                        {filteredClients.map((client) => (
                          <li
                            key={client._id}
                            onMouseDown={() => {
                              setClient(client._id);
                              setSearchClient(client.name);
                              setShowClientDropdown(false);
                            }}
                            className="px-4 py-2 hover:bg-gray-100 text-sm cursor-pointer"
                          >
                            {client.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold">Priority</label>
                    <div className="flex gap-2 mt-1">
                      {["Low", "Medium", "High"].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setPriority(level)}
                          className={`px-3 py-1 rounded-full border ${
                            priority === level
                              ? "bg-black text-white"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative">
                    <label className="text-sm font-semibold">
                      Service Type
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsServiceTypeOpen(!isServiceTypeOpen)}
                      className="w-full mt-1 px-4 py-2 border rounded-lg text-left flex justify-between items-center"
                    >
                      {serviceType || "Select service type"}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {isServiceTypeOpen && (
                      <ul className="absolute z-10 bg-white border mt-1 w-full rounded shadow-lg max-h-48 overflow-y-auto">
                        {taskBucket.map((bucket) => (
                          <li
                            key={bucket._id}
                            onMouseDown={() => {
                              setServiceType(bucket.title);
                              setIsServiceTypeOpen(false);
                            }}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          >
                            {bucket.title}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* <div>
                    <label className="text-sm font-semibold">Scheduled Date</label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={e => setScheduledDate(e.target.value)}
                      className="w-full mt-1 px-4 py-2 border rounded-lg"
                    />
                  </div> */}

                  <div>
                    <label className="text-sm font-semibold">Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full mt-1 px-4 py-2 border rounded-lg"
                    />

                    {/* Recurring Task Section */}
                    <div>
                      <label className="text-sm font-semibold">
                        Is this task recurring?
                      </label>
                      <div className="flex gap-4 mt-2 items-center">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={recurring === true}
                            onChange={() => setrecurring(true)}
                          />
                          Yes
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={recurring === false}
                            onChange={() => {
                              setrecurring(false);
                              setrecurringFrequency("");
                            }}
                          />
                          No
                        </label>
                      </div>
                    </div>

                    {/* Recurring Frequency Selector */}
                    {recurring && (
                      <div className="mt-2">
                        <label className="text-sm font-semibold">
                          Recurring Frequency
                        </label>
                        <div className="flex flex-wrap gap-3 mt-1">
                          {[
                            "weekly",
                            "monthly",
                            "quarterly",
                            "Bi-Annually",
                            "annually"
                          ].map((freq) => (
                            <button
                              key={freq}
                              type="button"
                              onClick={() => setRecurringFrequency(freq)}
                              className={`px-3 py-1 border rounded-full text-sm ${
                                recurringFrequency === freq
                                  ? "bg-black text-white"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {freq}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="px-6 py-2 border rounded-lg text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-black text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <FileUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={handleUploadComplete}
        />
      )}
    </>
  );
};

export default TaskForm;

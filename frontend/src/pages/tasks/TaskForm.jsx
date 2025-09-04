import React, { useState, useEffect, useRef } from "react";
import { Paperclip, ChevronDown } from "lucide-react";
import FileUploadModal from "./FileUploadModal";
import { getToken } from "../../utils/token";
import axios from "../../services/api";
import toast from "react-hot-toast";
import debounce from "lodash.debounce";
import AdminNavbar from "../../components/navbars/AdminNavbar"; // Added for page layout

const TaskForm = ({ users: initialUsers, taskBucket, clients }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [client, setClient] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [serviceType, setServiceType] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [recurring, setRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState("");
  const [searchServiceType, setSearchServiceType] = useState("");
  const [filteredServiceTypes, setFilteredServiceTypes] = useState(taskBucket);
  
  // State for form validation errors
  const [errors, setErrors] = useState({});

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

  useEffect(() => {
  const debounced = debounce(() => {
    const list = taskBucket.filter((bucket) =>
      bucket.title.toLowerCase().includes(searchServiceType.toLowerCase())
    );
    setFilteredServiceTypes(list);
  }, 300);
  debounced();
  return () => debounced.cancel();
}, [searchServiceType, taskBucket]);


  const handleUploadComplete = (selectedFiles) => {
    setFiles(selectedFiles);
  };
  
  // --- NEW VALIDATION FUNCTION ---
  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) newErrors.title = "Task title is required.";
    if (!assignee) newErrors.assignee = "Please assign the task to a staff member.";
    if (!client) newErrors.client = "Please select a client for this task.";
    if (!serviceType) newErrors.serviceType = "Please select a service type.";
    
    if (!dueDate) {
      newErrors.dueDate = "Due date is required.";
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of today
      const selectedDueDate = new Date(dueDate);
      if (selectedDueDate < today) {
        newErrors.dueDate = "Due date cannot be in the past.";
      }
    }

    if (recurring && !recurringFrequency) {
      newErrors.recurringFrequency = "Please select a frequency for the recurring task.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const submitHandler = async (e) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;
    
    // Call validation function before submitting
    if (!validateForm()) {
        toast.error("Please fix the errors before submitting.");
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
    formData.append("recurring", recurring);
    if(recurring) {
        formData.append("recurringFrequency", recurringFrequency);
    }

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
      // Reset form on success
      setTitle("");
      setDescription("");
      setAssignee("");
      setClient("");
      setPriority("Medium");
      setServiceType("");
      setDueDate("");
      setFiles([]);
      setSearchUser("");
      setSearchClient("");
      setRecurring(false);
      setRecurringFrequency("");
      setErrors({}); // Clear errors on success
    } catch (err) {
      console.error("Failed to create task:", err);
      toast.error(err.response?.data?.message || "Task creation failed");
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen pt-18 bg-white">
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
              noValidate
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {/* Task Title */}
                  <div>
                    <label className="text-sm font-semibold">Task Title <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => {
                          setTitle(e.target.value);
                          if(errors.title) setErrors(p => ({...p, title: null}));
                      }}
                      className={`w-full mt-1 px-4 py-2 border rounded-lg ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-sm font-semibold">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full mt-1 px-4 py-2 border rounded-lg resize-none"
                    />
                  </div>
 
                  {/* Attachments */}
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
                  {/* Assignee */}
                  <div className="relative">
                    <label className="text-sm font-semibold">Assign To <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                      onFocus={() => setShowUserDropdown(true)}
                      onBlur={() => setTimeout(() => setShowUserDropdown(false), 200)}
                      placeholder="Search staff"
                      className={`w-full mt-1 px-4 py-2 border rounded-lg ${errors.assignee ? 'border-red-500' : 'border-gray-300'}`}
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
                              if(errors.assignee) setErrors(p => ({...p, assignee: null}));
                            }}
                            className="px-4 py-2 hover:bg-gray-100 text-sm cursor-pointer"
                          >
                            {user.name}
                          </li>
                        ))}
                      </ul>
                    )}
                    {errors.assignee && <p className="text-xs text-red-500 mt-1">{errors.assignee}</p>}
                  </div>

                  {/* Client */}
                  <div className="relative">
                    <label className="text-sm font-semibold">Client <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={searchClient}
                      onChange={(e) => setSearchClient(e.target.value)}
                      onFocus={() => setShowClientDropdown(true)}
                      onBlur={() => setTimeout(() => setShowClientDropdown(false), 200)}
                      placeholder="Search client"
                      className={`w-full mt-1 px-4 py-2 border rounded-lg ${errors.client ? 'border-red-500' : 'border-gray-300'}`}
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
                              if(errors.client) setErrors(p => ({...p, client: null}));
                            }}
                            className="px-4 py-2 hover:bg-gray-100 text-sm cursor-pointer"
                          >
                            {client.name}
                          </li>
                        ))}
                      </ul>
                    )}
                    {errors.client && <p className="text-xs text-red-500 mt-1">{errors.client}</p>}
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="text-sm font-semibold">Priority</label>
                    <div className="flex gap-2 mt-1">
                      {["Low", "Medium", "High"].map((level) => (
                        <button key={level} type="button" onClick={() => setPriority(level)}
                          className={`px-3 py-1 rounded-full border ${priority === level ? "bg-black text-white" : "bg-gray-100 text-gray-700"}`}>
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Service Type */}
                  <div className="relative">
                    <label className="text-sm font-semibold">Service Type <span className="text-red-500">*</span></label>
                    <button
                      type="button"
                      onClick={() => setIsServiceTypeOpen(!isServiceTypeOpen)}
                      className={`w-full mt-1 px-4 py-2 border rounded-lg text-left flex justify-between items-center ${errors.serviceType ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      {serviceType || "Select service type"}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {isServiceTypeOpen && (
                      <div className="absolute z-10 bg-white border mt-1 w-full rounded shadow-lg max-h-64 overflow-y-auto">
                          {/* Search input for service type */}
                          <input
                            type="text"
                            value={searchServiceType}
                            onChange={e => setSearchServiceType(e.target.value)}
                            placeholder="Search service type"
                            className="w-full px-3 py-2 border-b border-gray-200"
                            autoFocus
                          />
                          <ul>
                            {filteredServiceTypes.map((bucket) => (
                              <li
                                key={bucket._id}
                                onMouseDown={() => {
                                  setServiceType(bucket.title);
                                  setIsServiceTypeOpen(false);
                                  setSearchServiceType("");
                                  if(errors.serviceType) setErrors(p => ({...p, serviceType: null}));
                                }}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              >
                                {bucket.title}
                              </li>
                            ))}
                            {filteredServiceTypes.length === 0 && (
                              <li className="px-4 py-2 text-gray-400">No service type found</li>
                            )}
                          </ul>
                        </div>
                    )}
                    {errors.serviceType && <p className="text-xs text-red-500 mt-1">{errors.serviceType}</p>}
                  </div>
                  
                  {/* Due Date */}
                  <div>
                    <label className="text-sm font-semibold">Due Date <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => {
                          setDueDate(e.target.value);
                          if(errors.dueDate) setErrors(p => ({...p, dueDate: null}));
                      }}
                      className={`w-full mt-1 px-4 py-2 border rounded-lg ${errors.dueDate ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.dueDate && <p className="text-xs text-red-500 mt-1">{errors.dueDate}</p>}
                  </div>
                  
                  {/* Recurring Task Section */}
                  <div>
                    <label className="text-sm font-semibold">Is this task recurring?</label>
                    <div className="flex gap-4 mt-2 items-center">
                      <label className="flex items-center gap-2">
                        <input type="radio" checked={recurring === true} onChange={() => setRecurring(true)} /> Yes
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" checked={recurring === false} onChange={() => {
                            setRecurring(false);
                            setRecurringFrequency("");
                            if(errors.recurringFrequency) setErrors(p => ({...p, recurringFrequency: null}));
                        }}/> No
                      </label>
                    </div>
                  </div>

                  {/* Recurring Frequency Selector */}
                  {recurring && (
                    <div className="mt-2">
                      <label className="text-sm font-semibold">Recurring Frequency <span className="text-red-500">*</span></label>
                      <div className="flex flex-wrap gap-3 mt-1">
                        {["weekly", "monthly", "quarterly", "Bi-Annually", "annually"].map((freq) => (
                          <button key={freq} type="button" onClick={() => {
                              setRecurringFrequency(freq);
                              if(errors.recurringFrequency) setErrors(p => ({...p, recurringFrequency: null}));
                          }}
                            className={`px-3 py-1 border rounded-full text-sm ${recurringFrequency === freq ? "bg-black text-white" : "bg-gray-100 text-gray-800"}`}>
                            {freq}
                          </button>
                        ))}
                      </div>
                      {errors.recurringFrequency && <p className="text-xs text-red-500 mt-1">{errors.recurringFrequency}</p>}
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" className="px-6 py-2 border rounded-lg text-gray-600">Cancel</button>
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
// CreateTask.jsx
import React, { useEffect, useState } from "react";
import TaskForm from "../tasks/TaskForm";
import axios from "../../services/api";
import { getToken } from "../../utils/token";
import toast from "react-hot-toast";
import { ArrowLeft } from 'lucide-react';
import AdminNavbar from "../../components/navbars/AdminNavbar";

const CreateTask = () => {
  const [users, setUsers] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchTaskBuckets = async () => {
      try {
        const res = await axios.get("/task-buckets", {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setServiceTypes(res.data);
      } catch (err) {
        console.error("Failed to fetch task buckets", err);
      }
    };
    fetchTaskBuckets();
  }, []);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await axios.get("/user?role=staff", {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setUsers(res.data.users);
      } catch (err) {
        toast.error("Failed to fetch staff list");
      }
    };
    fetchStaff();
  }, []);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get("/clients", {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setClients(res.data || []);
        console.log(clients) 
      } catch (err) {
        toast.error("Failed to fetch clients");
      }
    };
    fetchClients();
  }, []);

  return (
    <div>
       <AdminNavbar/>
      <TaskForm users={users} taskBucket={serviceTypes} clients={clients} />
    </div>
  );
};

export default CreateTask;

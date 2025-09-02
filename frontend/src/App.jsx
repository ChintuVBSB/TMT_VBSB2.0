import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./pages/admin/AdminLogin";
import ManagerLogin from "./pages/manager/ManagerLogin";
import TeamLogin from "./pages/team/TeamLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManagerDashBoard from "./pages/manager/ManagerMyTasks";
import TeamDashBoard from "./pages/team/StaffDashboard";
import Login from "./pages/Login";
import CreateTask from "./pages/tasks/CreateTask";
import { Toaster } from "react-hot-toast";
import AllTasks from "./pages/tasks/AllTasks";
import StaffDashboard from "./pages/team/StaffDashboard";
import EditTask from "./pages/tasks/EditTask";
import OtpVerify from "./pages/OtpVerify";
import TimeLogPage from "./pages/team/TimeLogPage";
import AddClient from "./pages/admin/AddClient";
import AddTaskBucket from "./pages/admin/AddTaskBucket";
import StaffReport from "./pages/team/StaffReport";
import AdminHero from "./pages/Hero";
import { getToken } from "./utils/token";
import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorized from "./pages/Unauthorized";
import Hero from "./pages/Hero";
import AllUsers from "./pages/admin/AllUsers";
import Footer from "./components/Footer";
import About from "./components/About";
import Policy from "./components/Policy";
import ProjectDetails from "./pages/admin/ProjectDetails";
import CreateProject from "./pages/admin/dashboard-widgets/CreateProject";
import MyProjects from "./pages/team/MyProjects";
import AdminProjectDashboard from "./pages/admin/dashboard-widgets/AdminProjectDashboard";
import GlobalLayout from "./layouts/GlobalLayout";
import RecurringTasks from "./pages/team/RecurringTasks";
import CalendarPage from "./pages/CalanderPage";
import TimeSheet from '../src/pages/admin/TimeSheet'
import AdminTaskListTable from "./components/AdminTaskListTable";
import AllTaskLogsView from "./components/AllTaskLogsView";
import ManagerMyTasks from "./pages/manager/ManagerMyTasks";
import { useEffect } from "react";
import StaffTasksReport from "./components/MyTaskReport";
import CalendarView from "./components/CalendarView";
import AdminCalander from "./pages/AdminCalander";


const App = () => {


  return (
    <>
      <BrowserRouter>
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
        <Routes>
          {/* Public Routes */}
          <Route element={<GlobalLayout />} />
          <Route path="/" element={<Hero />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/manager/login" element={<ManagerLogin />} />
          <Route path="/staff/login" element={<TeamLogin />} />
          <Route path="/verify-otp" element={<OtpVerify />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <Hero />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/home"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <Hero />
              </ProtectedRoute>
            }
          />

          <Route
            path="/staff/recurring-tasks"
            element={
              <ProtectedRoute allowedRoles={["staff", "manager", "admin"]}>
                <RecurringTasks />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

           <Route
            path="/admin/dashboard/calendar"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                 <AdminCalander/>
              </ProtectedRoute>
            }
          />

           <Route
            path="/my-tasks"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <ManagerMyTasks/>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/projects/"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <AdminProjectDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/activity-logs"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <AllTaskLogsView/>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/create-project"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <CreateProject />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/allusers"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <AllUsers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/create-task"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <CreateTask />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tasks"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <AllTasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/edit-task/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <EditTask />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/add-client"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <AddClient />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/add-task-bucket"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <AddTaskBucket />
              </ProtectedRoute>
            }
          />

          {/* Staff Routes */}
          <Route
            path="/staff/dashboard"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/time-logs"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <TimeLogPage />
              </ProtectedRoute>
            }
          />


          
            
            <Route path="/staff/calendar" element={<CalendarPage />} />
          

          <Route
            path="/staff/my-projects"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <MyProjects />
              </ProtectedRoute>
            }
          />

          <Route
            path="/staff/report"
            element={
              <ProtectedRoute allowedRoles={["staff", "admin"]}>
                <StaffReport />
              </ProtectedRoute>
            }
          />

          {/* Manager Route */}
          <Route
            path="/manager/dashboard"
            element={
              <ProtectedRoute allowedRoles={["manager"]}>
                <ManagerDashBoard />
              </ProtectedRoute>
            }
          />

            <Route
            path="/admin/manager/timesheet"
            element={
              <ProtectedRoute allowedRoles={["manager","admin","staff "]}>
                <TimeSheet/>
              </ProtectedRoute>
            }
          />

            <Route
            path="/admin/alltasklist"
            element={
              <ProtectedRoute allowedRoles={["manager","admin"]}>
                <AdminTaskListTable/>
              </ProtectedRoute>
            }
          />
          

          <Route path="/about" element={<About />} />
          <Route path="/privacy-policy" element={<Policy />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;

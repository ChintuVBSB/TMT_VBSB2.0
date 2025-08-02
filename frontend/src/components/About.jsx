// 📄 src/pages/About.jsx (for Task Flow)
import React from "react";

const About = () => {
  // Check if user is logged in (token exists in localStorage)
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <div className="flex flex-col min-h-screen font-sans bg-soft text-darkText">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 shadow-md bg-white/60 backdrop-blur-lg sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <a href="/" className="block">
            <img
              src="/tmt-cropped-logo.png"
              alt="Task Flow Logo"
              className="h-10 w-auto hover:scale-105 transition-transform"
            />
          </a>
        </div>
        <div className="space-x-6 text-sm font-medium">
          {!isLoggedIn ? (
            <a href="/login">
              <button className="ml-4 bg-gradient-to-r from-blue-900 to-blue-700 text-white px-5 py-2 rounded hover:scale-105 transition shadow-lg ring-2 ring-blue-900/20">
                Login
              </button>
            </a>
          ) : (
            <a href="/">
              <button className="ml-4 bg-gradient-to-r from-green-700 to-green-500 text-white px-5 py-2 rounded hover:scale-105 transition shadow-lg ring-2 ring-green-900/20">
                Explore
              </button>
            </a>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#e0f7fa] to-[#f1f5f9] py-16 px-6 md:px-40 text-center">
        <h1 className="text-4xl font-extrabold mb-4">About Task Flow</h1>
        <p className="max-w-3xl mx-auto text-lg text-gray-700">
          A modern task and workflow management platform built by VBSB Associates for teams who care about productivity, clarity, and speed.
        </p>
      </section>

      {/* Main Content */}
      <main className="flex-1 px-6 md:px-40 py-16 bg-white">
        <section className="max-w-6xl mx-auto space-y-12 text-gray-700">
          <div className="bg-[#f1f5f9] p-6 shadow-sm border border-gray-200">
            <p>
              <strong>Task Flow</strong> is a project and task assignment tool designed by <strong>VBSB Associates</strong> to streamline internal operations, manage deadlines efficiently, and boost accountability across departments.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div className="p-6 bg-blue-100 text-blue-900 shadow-md hover:shadow-xl transition transform hover:-translate-y-1">
              <h3 className="text-lg font-bold mb-2">Clear Task Delegation</h3>
              <p className="text-sm">
                Assign, track, and manage tasks in real time with visibility for both staff and managers.
              </p>
            </div>

            <div className="p-6 bg-emerald-100 text-emerald-900 shadow-md hover:shadow-xl transition transform hover:-translate-y-1">
              <h3 className="text-lg font-bold mb-2">Dashboard Analytics</h3>
              <p className="text-sm">
                Visual dashboards offer insights into task statuses, priorities, team productivity, and more.
              </p>
            </div>
          </div>

          <div className="p-6 bg-indigo-100 text-indigo-900 shadow-md hover:shadow-xl transition transform hover:-translate-y-1">
            <h3 className="text-lg font-bold mb-2">Built for Teams</h3>
            <p className="text-sm">
              Whether you're managing small groups or multiple branches, Task Flow is scalable, secure, and designed for collaboration.
            </p>
          </div>

          <p className="text-base leading-relaxed">
            With real-time notifications, smart reminders, and a clutter-free interface, Task Flow is the modern workplace assistant every team deserves.
          </p>

          <p className="font-semibold text-blue-900">
            Task Flow by VBSB Associates – your workflow, reimagined.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-10 px-6 text-center text-sm text-[#5a788c]">
        <div className="flex justify-center gap-6 flex-wrap mb-4">
          <a href="/about" className="hover:underline">About</a>
          <a href="/privacy" className="hover:underline">Privacy Policy</a>
          <a href="/terms" className="hover:underline">Terms of Service</a>
        </div>
        <div className="flex items-center justify-center gap-2">
          <img src="/tmt-cropped-logo.png" alt="Logo" className="h-6 w-auto" />
          <span className="text-xs">© 2025 Task Flow by VBSB Associates. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default About;

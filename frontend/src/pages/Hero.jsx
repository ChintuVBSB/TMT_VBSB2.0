// src/pages/Hero.jsx
import React from "react";
import NavbarSwitcher from "../components/navbars/NavbarSwitcher";
import Footer from "../components/Footer";

const Hero = () => {
  return (
    <div className="bg-dark-50  dark:bg-dark-950 w-full min-h-screen overflow-hidden">
      {/* Dynamic Navbar */}
      <NavbarSwitcher />

      {/* Hero Content */}
      <main className="pt-24 2xl:max-w-screen-2xl mx-auto px-4 pb-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white text-black min-h-[calc(100vh-72px)]">
        {/* Left Content */}
        <div className="relative w-full">
            <img className="w-[10vw]  " src="/tmt-cropped-logo.png" alt="" />
          <div className="relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl text-gray-700 font-bold leading-tight">
              Smarter Task Management for Modern <span className="">CA</span> Firms.
            </h1>
            <p className="font-bold text-blue-900 mt-2 text-sm">
              VBSB-Associates - Chartered Accountants
            </p>
            <p className="mt-4 text-lg text-gray-600 max-w-xl">
              Track filings, manage deadlines, and collaborate with your team — all from one powerful dashboard.
            </p>
          </div>
        </div>

        {/* Right Image */}
        <div className="w-full flex justify-center">
          <img
            className="max-h-[520px] w-full rounded-lg object-cover object-center"
            src="/undraw_add-tasks_4qsy.svg"
            alt="office-workspace"
            loading="lazy"
          />
        </div>
      </main>
    <Footer/>
    </div>
  );
};

export default Hero;

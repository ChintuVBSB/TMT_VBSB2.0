// 📄 src/pages/PrivacyPolicy.jsx (Task Flow 2025)
import React from "react";
import Footer from "./Footer";
import NavbarSwitcher from "./navbars/NavbarSwitcher";

const Policy = () => {
  return (
    <div className="flex flex-col mt-10  min-h-screen bg-soft text-darkText font-sans">
      {/* Navbar */}
      <NavbarSwitcher />

      {/* Hero Section */}
      <section className="bg-gradient-to-br  from-blue-50 to-blue-100 py-16 px-6 md:px-40 text-center">
        <h1 className="text-4xl font-extrabold mb-4">Privacy Policy</h1>
        <p className="max-w-3xl mx-auto text-lg text-gray-700">
          Your trust matters. Here's how we handle your data securely and responsibly.
        </p>
      </section>

      {/* Main Content */}
      <main className="flex-1 px-6 md:px-40 py-16 bg-white">
        <section className="max-w-5xl mx-auto space-y-8 text-gray-700">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="p-6 bg-rose-100 text-rose-900 shadow hover:shadow-md transition">
              <h2 className="text-lg font-bold mb-2">1. Information We Collect</h2>
              <p className="text-sm">We may collect your name, email, phone, business details, and uploaded documents.</p>
            </div>

            <div className="p-6 bg-teal-100 text-teal-900 shadow hover:shadow-md transition">
              <h2 className="text-lg font-bold mb-2">2. How We Use Your Data</h2>
              <p className="text-sm">To offer automation, task tracking, and insights aligned with your work.</p>
            </div>

            <div className="p-6 bg-indigo-100 text-indigo-900 shadow hover:shadow-md transition">
              <h2 className="text-lg font-bold mb-2">3. Data Security</h2>
              <p className="text-sm">We use encrypted storage and secure access to keep your data private and safe.</p>
            </div>

            <div className="p-6 bg-amber-100 text-amber-900 shadow hover:shadow-md transition">
              <h2 className="text-lg font-bold mb-2">4. Sharing & Disclosure</h2>
              <p className="text-sm">We never sell your data. It's only shared with your consent or legal requirement.</p>
            </div>

            <div className="p-6 bg-purple-100 text-purple-900 shadow hover:shadow-md transition">
              <h2 className="text-lg font-bold mb-2">5. Cookies</h2>
              <p className="text-sm">We use cookies to enhance experience. You can manage them in browser settings.</p>
            </div>

            <div className="p-6 bg-sky-100 text-sky-900 shadow hover:shadow-md transition">
              <h2 className="text-lg font-bold mb-2">6. Your Rights</h2>
              <p className="text-sm">
                Access, correct, or request deletion of your data. Email us at{' '}
                <a href="mailto:ho@vbsb.in" className="underline">ho@vbsb.in</a>.
              </p>
            </div>

            <div className="p-6 bg-gray-100 text-gray-900 shadow hover:shadow-md transition">
              <h2 className="text-lg font-bold mb-2">7. Policy Updates</h2>
              <p className="text-sm">We may revise this policy. The latest version will always be posted here.</p>
            </div>

            <div className="p-6 bg-pink-100 text-pink-900 shadow hover:shadow-md transition">
              <h2 className="text-lg font-bold mb-2">8. Contact & Support</h2>
              <p className="text-sm">
                Questions? Email <a href="mailto:ho@vbsb.in" className="underline">ho@vbsb.in</a> or call{' '}
                <a href="tel:+918884237766" className="underline">8884237766</a>.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Policy;

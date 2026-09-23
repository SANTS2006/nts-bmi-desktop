import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Footer from "../components/Footer";

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-[var(--bms-bg)] text-[var(--bms-text)] transition-colors duration-300">
      <div className="flex h-full">

        {/* Fixed Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main application */}
        <div className="flex min-w-0 flex-1 flex-col">

          {/* Topbar */}
          <Topbar
            onMenuClick={() => setSidebarOpen(true)}
          />

          {/* Main scroll area */}
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">

            <main className="flex-1 bg-[var(--bms-bg)] p-4 transition-colors duration-300 sm:p-6 lg:p-8">
              <Outlet />
            </main>

            <Footer />

          </div>

        </div>
      </div>
    </div>
  );
}

export default AppLayout;
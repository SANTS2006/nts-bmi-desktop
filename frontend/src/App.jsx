import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";


import AppLayout from "./layouts/AppLayout";

import ProtectedRoute from "./components/ProtectedRoute";


import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";


import Notifications from "./pages/Notifications";
import NotificationDetails from "./pages/NotificationDetails";


import Profile from "./pages/Profile";
import AccountSettings from "./pages/AccountSettings";
import Security from "./pages/Security";


import Roles from "./pages/Roles";
import RoleDetails from "./pages/RoleDetails";


import Permissions from "./pages/Permissions";
import PermissionDetails from "./pages/PermissionDetails";


import Users from "./pages/Users";
import UserDetails from "./pages/UserDetails";

import Departments from "./pages/departments/Departments.jsx";
import DepartmentDetails from "./pages/departments/DepartmentDetails.jsx";

import Projects from "./pages/projects/Projects.jsx";
import ProjectDetails from "./pages/projects/ProjectDetails.jsx";

import Clients from "./pages/clients/Clients";
import ClientDetails from "./pages/clients/ClientDetails";

import Tasks from "./pages/Tasks.jsx";
import TaskDetails from "./pages/TaskDetails.jsx";

import Teams from "./pages/Teams.jsx";
import TeamDetails from "./pages/TeamDetails.jsx";

import Skills from "./pages/Skills.jsx";

import Goals from "./pages/Goals.jsx";

import Performance from "./pages/Performance.jsx";
import PerformanceDetails from "./pages/PerformanceDetails.jsx";

import EmployeeDocuments from "./pages/EmployeeDocuments.jsx";

import Employees from "./pages/employees/Employees.jsx";
import EmployeeDetails from "./pages/employees/EmployeeDetails.jsx";

import InternalCommunication from './pages/communication/InternalCommunication.jsx';

import FinanceDashboard from "./pages/Admin/finance/FinanceDashboard.jsx";
import Accounts from "./pages/Admin/finance/Accounts.jsx";
import Categories from "./pages/Admin/finance/Categories.jsx";
import Transactions from "./pages/Admin/finance/Transactions.jsx";
import Invoices from "./pages/Admin/finance/Invoices.jsx";
import InvoiceDetails from "./pages/Admin/finance/InvoiceDetails.jsx";
import Payments from "./pages/Admin/finance/Payments.jsx";
import Budgets from "./pages/Admin/finance/Budgets.jsx";
import FinanceReports from "./pages/Admin/finance/Reports.jsx";

import Attendance from "./pages/attendance/Attendance.jsx";
import LeaveManagement from "./pages/leave/LeaveManagement.jsx";


import Approvals from "./pages/approvals/Approvals";
import ApprovalHistory from "./pages/approvals/ApprovalHistory";

import Reports from "./pages/reports/Reports.jsx";


import AuditLogs from "./pages/audit/AuditLogs";


import Sessions from "./pages/Sessions";


import HelpCenter from "./pages/HelpCenter";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PasswordHistory from "./pages/PasswordHistory";
import SkillsDetails from "./pages/SkillsDetails.jsx";


function App() {

  return (

    <Routes>


      {/* ==================================================
          DEFAULT
      ================================================== */}

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />


      {/* ==================================================
          PUBLIC
      ================================================== */}

      <Route
        path="/login"
        element={
          <Login />
        }
      />


      <Route
        path="/register"
        element={
          <Register />
        }
      />

      <Route
          path="/forgot-password"
          element={
              <ForgotPassword />
          }
      />


      <Route
          path="/reset-password"
          element={
              <ResetPassword />
          }
      />


      {/* ==================================================
          PROTECTED
      ================================================== */}

      <Route
        element={
          <ProtectedRoute />
        }
      >

        <Route
          element={
            <AppLayout />
          }
        >


          {/* ==================================================
              DASHBOARD
          ================================================== */}

          <Route
            path="/dashboard"
            element={
              <Dashboard />
            }
          />


          {/* ==================================================
              USERS
          ================================================== */}

          <Route
            path="/users"
            element={
              <Users />
            }
          />


          <Route
            path="/users/:id"
            element={
              <UserDetails />
            }
          />


          {/* ==================================================
              APPROVALS
          ================================================== */}

          <Route
            path="/approvals"
            element={
              <Approvals />
            }
          />


          <Route
            path="/approvals/history"
            element={
              <ApprovalHistory />
            }
          />


          {/* ==================================================
              ROLES
          ================================================== */}

          <Route
            path="/roles"
            element={
              <Roles />
            }
          />


          <Route
            path="/roles/:id"
            element={
              <RoleDetails />
            }
          />


          {/* ==================================================
              PERMISSIONS
          ================================================== */}

          <Route
            path="/permissions"
            element={
              <Permissions />
            }
          />


          <Route
            path="/permissions/:id"
            element={
              <PermissionDetails />
            }
          />


          {/* ==================================================
              AUDIT LOGS
          ================================================== */}

          <Route
            path="/audit-logs"
            element={
              <AuditLogs />
            }
          />


          {/* ==================================================
              SESSIONS
          ================================================== */}

          <Route
            path="/sessions"
            element={
              <Sessions />
            }
          />


          {/* ==================================================
              NOTIFICATIONS
          ================================================== */}

          <Route
            path="/notifications"
            element={
              <Notifications />
            }
          />


          <Route
            path="/notifications/:notificationId"
            element={
              <NotificationDetails />
            }
          />


          {/* ==================================================
              HELP
          ================================================== */}

          <Route
            path="/help"
            element={
              <HelpCenter />
            }
          />


          {/* ==================================================
              PROFILE
          ================================================== */}

          <Route
            path="/profile"
            element={
              <Profile />
            }
          />


          {/* ==================================================
              SETTINGS
          ================================================== */}

          <Route
            path="/settings"
            element={
              <AccountSettings />
            }
          />


          {/* ==================================================
              SECURITY
          ================================================== */}

          <Route
            path="/security"
            element={
              <Security />
            }
          />

          <Route
              path="/password-history"
              element={
                  <PasswordHistory />
              }
          />
          <Route
              path="/departments"
              element={
                  <Departments />
              }
          />
          <Route
              path="/departments/:id"
              element={
                  <DepartmentDetails />
              }
          />

          <Route
              path="/projects"
              element={
                  <Projects />
              }
          />

          <Route
              path="/projects/:id"
              element={
                  <ProjectDetails />
              }
          />

          <Route
              path="/clients"
              element={
                  <Clients />
              }
          />

          <Route
              path="/clients/:id"
              element={
                  <ClientDetails />
              }
          />

          <Route
            path="/tasks"
            element={<Tasks />}
          />

        <Route
            path="/tasks/:taskId"
            element={<TaskDetails />}
        />

        <Route
            path="/employees"
           element={<Employees />}
        />

        <Route
            path="/employees/:id"
            element={<EmployeeDetails />}
        />
        <Route
            path="/teams"
           element={<Teams />}
        />

        <Route
            path="/teams/:id"
            element={<TeamDetails />}
        />

       <Route
            path="/skills"
           element={<Skills />}
        />

        <Route
            path="/skills/:id"
            element={<SkillsDetails />}
        />

        <Route
            path="/performance"
           element={<Performance />}
        />

        <Route
            path="/performance/:id"
            element={<PerformanceDetails />}
        />    
    
        <Route
            path="/goals"
           element={<Goals />}
        />

        <Route
            path="/employee-documents"
            element={<EmployeeDocuments/>}
        />

{/* ==================================================
            FINANCE & ACCOUNTING
        ================================================== */}

        <Route path="/finance" element={<FinanceDashboard />} />
        <Route path="/finance/accounts" element={<Accounts />} />
        <Route path="/finance/categories" element={<Categories />} />
        <Route path="/finance/transactions" element={<Transactions />} />
        <Route path="/finance/invoices" element={<Invoices />} />
        <Route path="/finance/invoices/:id" element={<InvoiceDetails />} />
        <Route path="/finance/payments" element={<Payments />} />
        <Route path="/finance/budgets" element={<Budgets />} />
        <Route path="/finance/reports" element={<FinanceReports />} />

        <Route path="/teams" element={<Teams />} />
        <Route path="/teams/:id" element={<TeamDetails />} />

        <Route path="/skills" element={<Skills />} />
        <Route path="/skills/:id" element={<SkillsDetails />} />

        <Route path="/performance" element={<Performance />} />
        <Route path="/performance/:id" element={<PerformanceDetails />} />

        <Route path="/goals" element={<Goals />} />
        <Route path="/employee-documents" element={<EmployeeDocuments />} />

        <Route path="/attendance" element={<Attendance />} />
        <Route path="/leave" element={<LeaveManagement />} />
        <Route path="/communication" element={<InternalCommunication />} />
        <Route path="/reports" element={<Reports />} />

        </Route>

      </Route>


      {/* ==================================================
          404
      ================================================== */}

      <Route
        path="*"
        element={
          <NotFound />
        }
      />


    </Routes>

  );

}


export default App;
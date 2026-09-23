import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  ShieldCheck,
  KeyRound,
  FileText,
  Monitor,
  Settings,
  Bell,
  CircleHelp,
  LogOut,
  X,
  Building2,
  FolderKanban,
  UsersRound,
  ListTodo,
  UserRoundCog,
  Award,
  Star,
  Target,
  FolderOpen,
  Coins,
  Landmark,
  ReceiptText,
  ArrowLeftRight,
  WalletCards,
  ChartNoAxesCombined,
  CalendarCheck, 
  CalendarOff,
  MessageSquare,
} from "lucide-react";

import { NavLink, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";


/*
 * ==================================================
 * MAIN NAVIGATION
 * ==================================================
 */

const mainNavigation = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },

  {
    label: "Users",
    path: "/users",
    icon: Users,
  },

  {
    label: "Employees",
    path: "/employees",
    icon: UserRoundCog,
  },

  {
    label: "Departments",
    path: "/departments",
    icon: Building2,
  },

  {
    label: "Projects",
    path: "/projects",
    icon: FolderKanban,
  },

  {
    label: "Tasks",
    path: "/tasks",
    icon: ListTodo,
  },

  {
    label: "Clients",
    path: "/clients",
    icon: UsersRound,
  },

  {
    label: "Approvals",
    path: "/approvals",
    icon: ClipboardCheck,
  },
  {
    label: "Attendance",
    path: "/attendance",
    icon: CalendarCheck,
  },
  {
    label: "Leave",
    path: "/leave",
    icon: CalendarOff,
  },
  {
    label: "Communication",
    path: "/communication",
    icon: MessageSquare,
  },
];


/*
 * ==================================================
 * PEOPLE NAVIGATION
 * ==================================================
 *
 * These are independent modules but are closely
 * related to employee/team management.
 * ==================================================
 */

const peopleNavigation = [
  {
    label: "Teams",
    path: "/teams",
    icon: UsersRound,
  },

  {
    label: "Skills",
    path: "/skills",
    icon: Award,
  },
];


/*
 * ==================================================
 * EMPLOYEE DEVELOPMENT NAVIGATION
 * ==================================================
 */

const developmentNavigation = [
  {
    label: "Performance",
    path: "/performance",
    icon: Star,
  },

  {
    label: "Goals",
    path: "/goals",
    icon: Target,
  },
];


/*
 * ==================================================
 * DOCUMENT NAVIGATION
 * ==================================================
 */

const documentNavigation = [
  {
    label: "Employee Documents",
    path: "/employee-documents",
    icon: FolderOpen,
  },
];


/*
 * ==================================================
 * ADMINISTRATION NAVIGATION
 * ==================================================
 */

const financeNavigation = [
  { label: "Finance Dashboard", path: "/finance", icon: Coins },
  { label: "Accounts", path: "/finance/accounts", icon: Landmark },
  { label: "Categories", path: "/finance/categories", icon: WalletCards },
  { label: "Transactions", path: "/finance/transactions", icon: ArrowLeftRight },
  { label: "Invoices", path: "/finance/invoices", icon: ReceiptText },
  { label: "Payments", path: "/finance/payments", icon: WalletCards },
  { label: "Budgets", path: "/finance/budgets", icon: ChartNoAxesCombined },
  { label: "Reports", path: "/finance/reports", icon: ChartNoAxesCombined },
];


/* ==================================================
   ADMINISTRATION NAVIGATION
================================================== */

const administrationNavigation = [
  {
    label: "Roles",
    path: "/roles",
    icon: ShieldCheck,
  },

  {
    label: "Permissions",
    path: "/permissions",
    icon: KeyRound,
  },

  {
    label: "Audit Logs",
    path: "/audit-logs",
    icon: FileText,
  },

  {
    label: "Sessions",
    path: "/sessions",
    icon: Monitor,
  },

  {
    label: "Reports",
    path: "/reports",
    icon: ChartNoAxesCombined,
  },
];


/*
 * ==================================================
 * SYSTEM NAVIGATION
 * ==================================================
 */

const systemNavigation = [
  {
    label: "Notifications",
    path: "/notifications",
    icon: Bell,
  },

  {
    label: "Help Center",
    path: "/help",
    icon: CircleHelp,
  },

  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
];


/*
 * ==================================================
 * NAVIGATION ITEM
 * ==================================================
 *
 * Keeping this separate makes the sidebar easier
 * to maintain and ensures every navigation group
 * behaves consistently.
 * ==================================================
 */

function NavigationItem({
  item,
  onClose,
}) {

  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      onClick={onClose}
      className={({ isActive }) =>
        [
          "group",
          "flex",
          "min-w-0",
          "items-center",
          "gap-3",
          "rounded-lg",
          "px-3",
          "py-3",
          "text-sm",
          "font-medium",
          "transition-all",
          "duration-200",

          isActive
            ? "bg-blue-600/15 text-blue-500 shadow-[inset_3px_0_0_#2563eb]"
            : "text-[var(--bms-text-secondary)] hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)]",
        ].join(" ")
      }
    >

      <Icon
        size={19}
        strokeWidth={1.8}
        className="shrink-0"
      />

      <span className="min-w-0 truncate">
        {item.label}
      </span>

    </NavLink>
  );
}


/*
 * ==================================================
 * NAVIGATION GROUP
 * ==================================================
 */

function NavigationGroup({
  title,
  items,
  onClose,
}) {

  return (
    <section className="mt-8 first:mt-0">

      <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--bms-text-muted)]">
        {title}
      </p>

      <div className="space-y-1">

        {items.map((item) => (
          <NavigationItem
            key={item.path}
            item={item}
            onClose={onClose}
          />
        ))}

      </div>

    </section>
  );
}


/*
 * ==================================================
 * SIDEBAR
 * ==================================================
 */

function Sidebar({
  isOpen,
  onClose,
}) {

  const {
    logout,
  } = useAuth();

  const location = useLocation();


  /*
   * ==================================================
   * ACTIVE EMPLOYEE DOMAIN
   * ==================================================
   *
   * This is useful if later we want to visually
   * highlight the entire employee-management area.
   * ==================================================
   */

  const isEmployeeDomain =
    location.pathname.startsWith("/employees") ||
    location.pathname.startsWith("/teams") ||
    location.pathname.startsWith("/skills") ||
    location.pathname.startsWith("/performance") ||
    location.pathname.startsWith("/goals") ||
    location.pathname.startsWith("/employee-documents");


  return (
    <>

      {/* ==================================================
          MOBILE OVERLAY
      ================================================== */}

      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={onClose}
          className="
            fixed
            inset-0
            z-40
            bg-black/70
            backdrop-blur-[2px]
            md:hidden
          "
        />
      )}


      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          flex
          w-72
          min-w-0
          flex-col
          overflow-hidden
          border-r
          border-[var(--bms-border)]
          bg-[var(--bms-surface)]
          transition-transform
          duration-300

          md:static
          md:translate-x-0

          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        {/* ==================================================
            BRAND
        ================================================== */}

        <div
          className="
            flex
            min-w-0
            items-center
            justify-between
            border-b
            border-[var(--bms-border)]
            px-5
            py-5
          "
        >

          <div className="flex min-w-0 items-center gap-3">

            <img
              src="/nts-logo.png"
              alt="NTS Digital Solutions"
              className="
                h-12
                w-12
                shrink-0
                rounded-xl
                object-cover
              "
            />

            <div className="min-w-0">

              <h1
                className="
                  truncate
                  text-lg
                  font-bold
                  text-[var(--bms-text)]
                "
              >
                NTS
              </h1>

              <p
                className="
                  truncate
                  text-xs
                  text-[var(--bms-text-secondary)]
                "
              >
                Digital Solutions
              </p>

            </div>

          </div>


          {/* ==================================================
              MOBILE CLOSE
          ================================================== */}

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              text-[var(--bms-text-secondary)]
              transition-all
              duration-200
              hover:bg-[var(--bms-surface-soft)]
              hover:text-[var(--bms-text)]
              active:scale-95
              md:hidden
            "
            aria-label="Close navigation menu"
          >

            <X
              size={18}
              strokeWidth={1.8}
            />

          </button>

        </div>


        {/* ==================================================
            NAVIGATION
        ================================================== */}

        <nav
          className="
            sidebar-scrollbar
            min-w-0
            flex-1
            overflow-y-auto
            px-3
            py-6
          "
          aria-label="Main navigation"
        >

          {/* ==================================================
              MAIN
          ================================================== */}

          <NavigationGroup
            title="Main"
            items={mainNavigation}
            onClose={onClose}
          />


          {/* ==================================================
              PEOPLE
          ================================================== */}

          <NavigationGroup
            title="People"
            items={peopleNavigation}
            onClose={onClose}
          />


          {/* ==================================================
              EMPLOYEE DEVELOPMENT
          ================================================== */}

          <NavigationGroup
            title="Employee Development"
            items={developmentNavigation}
            onClose={onClose}
          />


          {/* ==================================================
              DOCUMENTS
          ================================================== */}

          <NavigationGroup
            title="Documents"
            items={documentNavigation}
            onClose={onClose}
          />


          {/* ==================================================
              FINANCE & ACCOUNTING
          ================================================== */}

          <NavigationGroup
            title="Finance & Accounting"
            items={financeNavigation}
            onClose={onClose}
          />


          {/* ==================================================
              ADMINISTRATION
          ================================================== */}

          <NavigationGroup
            title="Administration"
            items={administrationNavigation}
            onClose={onClose}
          />


          {/* ==================================================
              SYSTEM
          ================================================== */}

          <NavigationGroup
            title="System"
            items={systemNavigation}
            onClose={onClose}
          />

        </nav>


        {/* ==================================================
            COMPANY CARD + LOGOUT
        ================================================== */}

        <div
          className="
            border-t
            border-[var(--bms-border)]
            p-4
          "
        >

          {/* ==================================================
              COMPANY CARD
          ================================================== */}

          <div
            className="
              rounded-xl
              border
              border-[var(--bms-border)]
              bg-[var(--bms-surface-soft)]
              p-3
              transition-colors
              duration-300
            "
          >

            <div className="flex min-w-0 items-center gap-3">

              <img
                src="/nts-logo.png"
                alt=""
                className="
                  h-10
                  w-10
                  shrink-0
                  rounded-lg
                  object-cover
                "
              />

              <div className="min-w-0">

                <p
                  className="
                    truncate
                    text-sm
                    font-semibold
                    text-[var(--bms-text)]
                  "
                >
                  NTS Digital Solutions
                </p>

                <p
                  className="
                    mt-1
                    truncate
                    text-xs
                    text-[var(--bms-text-muted)]
                  "
                >
                  Empowering Businesses
                </p>

              </div>

            </div>

          </div>


          {/* ==================================================
              LOGOUT
          ================================================== */}

          <button
            type="button"
            onClick={logout}
            className="
              mt-3
              flex
              w-full
              items-center
              gap-3
              rounded-lg
              px-3
              py-2
              text-sm
              text-[var(--bms-text-secondary)]
              transition-all
              duration-200
              hover:bg-[var(--bms-surface-soft)]
              hover:text-[var(--bms-text)]
              active:scale-[0.99]
            "
          >

            <LogOut
              size={18}
              strokeWidth={1.8}
            />

            <span>
              Logout
            </span>

          </button>

        </div>

      </aside>

    </>
  );
}


export default Sidebar;
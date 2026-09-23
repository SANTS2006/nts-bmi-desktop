import {
  Search,
  LayoutDashboard,
  Users,
  ClipboardCheck,
  ShieldCheck,
  KeyRound,
  FileText,
  Monitor,
  Bell,
  Settings,
  UserCircle,
  BookOpen,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  MessageCircle,
  Mail,
  LifeBuoy,
  AlertTriangle,
  LockKeyhole,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";


/*
 * ==================================================
 * HELP CENTER
 * ==================================================
 */

function HelpCenter() {

  /*
   * ==================================================
   * STATE
   * ==================================================
   */

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");


  const [
    activeCategory,
    setActiveCategory,
  ] = useState("all");


  const [
    openFaq,
    setOpenFaq,
  ] = useState(null);


  /*
   * ==================================================
   * HELP CATEGORIES
   * ==================================================
   */

  const categories = [

    {
      id: "getting-started",
      title: "Getting Started",
      description:
        "Learn the basics of navigating and using the system.",
      icon: BookOpen,
      iconClass:
        "bg-blue-500/10 text-blue-500",
      articles: 6,
    },

    {
      id: "users",
      title: "Users",
      description:
        "Manage users, accounts, status and user information.",
      icon: Users,
      iconClass:
        "bg-purple-500/10 text-purple-500",
      articles: 8,
    },

    {
      id: "approvals",
      title: "Approvals",
      description:
        "Understand approval requests, reviews and decisions.",
      icon: ClipboardCheck,
      iconClass:
        "bg-emerald-500/10 text-emerald-500",
      articles: 7,
    },

    {
      id: "roles",
      title: "Roles & Permissions",
      description:
        "Learn how roles and permissions control system access.",
      icon: ShieldCheck,
      iconClass:
        "bg-orange-500/10 text-orange-500",
      articles: 9,
    },

    {
      id: "security",
      title: "Security",
      description:
        "Manage sessions, authentication and account security.",
      icon: LockKeyhole,
      iconClass:
        "bg-red-500/10 text-red-500",
      articles: 7,
    },

    {
      id: "system",
      title: "System & Settings",
      description:
        "Configure your account and understand system settings.",
      icon: Settings,
      iconClass:
        "bg-cyan-500/10 text-cyan-500",
      articles: 6,
    },

  ];


  /*
   * ==================================================
   * POPULAR ARTICLES
   * ==================================================
   */

  const articles = [

    {
      id: 1,
      category: "getting-started",
      title:
        "Understanding the Business Management System",
      description:
        "Learn how the major sections of the system work together.",
      icon: LayoutDashboard,
    },

    {
      id: 2,
      category: "getting-started",
      title:
        "Navigating the Dashboard",
      description:
        "Understand statistics, recent activity, system overview and quick actions.",
      icon: LayoutDashboard,
    },

    {
      id: 3,
      category: "users",
      title:
        "Managing Users",
      description:
        "Learn how to view, create, update and manage user accounts.",
      icon: Users,
    },

    {
      id: 4,
      category: "approvals",
      title:
        "How Approval Requests Work",
      description:
        "Understand pending, approved and rejected approval requests.",
      icon: ClipboardCheck,
    },

    {
      id: 5,
      category: "roles",
      title:
        "Understanding Roles and Permissions",
      description:
        "Learn how roles determine what users can access and perform.",
      icon: ShieldCheck,
    },

    {
      id: 6,
      category: "security",
      title:
        "Managing Active Sessions",
      description:
        "View your active sessions and revoke sessions you no longer recognize.",
      icon: Monitor,
    },

    {
      id: 7,
      category: "security",
      title:
        "Understanding Audit Logs",
      description:
        "Learn how important system activities are recorded for accountability.",
      icon: FileText,
    },

    {
      id: 8,
      category: "system",
      title:
        "Managing Your Profile",
      description:
        "Update and review your account information.",
      icon: UserCircle,
    },

  ];


  /*
   * ==================================================
   * FAQ DATA
   * ==================================================
   */

  const faqs = [

    {
      id: 1,
      question:
        "Why can't I access a particular page?",
      answer:
        "Access to system features is controlled by your assigned role and permissions. If you cannot access a page or action, your current role may not have the required permission. Contact an administrator if you believe you should have access.",
      category: "roles",
    },

    {
      id: 2,
      question:
        "What is an approval request?",
      answer:
        "An approval request is a workflow that requires an authorized user to review and approve or reject an action before it is completed. Approval requests help maintain accountability and prevent unauthorized changes.",
      category: "approvals",
    },

    {
      id: 3,
      question:
        "Can I approve my own request?",
      answer:
        "No. The system prevents users from approving or rejecting their own approval requests. This helps maintain separation of responsibilities and improves system security.",
      category: "approvals",
    },

    {
      id: 4,
      question:
        "What happens when an approval is rejected?",
      answer:
        "A rejected approval is recorded with a rejection reason. The request remains available in the approval history so authorized users can review what happened.",
      category: "approvals",
    },

    {
      id: 5,
      question:
        "What are active sessions?",
      answer:
        "Active sessions represent devices or browser sessions currently authenticated to your account. You can review active sessions and revoke sessions that you no longer recognize or want to remain active.",
      category: "security",
    },

    {
      id: 6,
      question:
        "Why should I review my active sessions?",
      answer:
        "Regularly reviewing your sessions helps identify unfamiliar devices or locations. If you notice a session you do not recognize, revoke it and contact your administrator if necessary.",
      category: "security",
    },

    {
      id: 7,
      question:
        "What are audit logs?",
      answer:
        "Audit logs provide a record of important actions performed within the system. They help administrators understand what happened, who performed an action and when it occurred.",
      category: "security",
    },

    {
      id: 8,
      question:
        "What is the difference between a role and a permission?",
      answer:
        "A permission represents a specific capability, such as viewing users or approving requests. A role is a collection of permissions assigned to a user. Users inherit their available capabilities through their assigned roles.",
      category: "roles",
    },

    {
      id: 9,
      question:
        "Why did my session expire?",
      answer:
        "Sessions can expire automatically as part of the system's security controls. When a session expires, sign in again to continue using the system.",
      category: "security",
    },

    {
      id: 10,
      question:
        "What should I do if the system is not responding?",
      answer:
        "First refresh the page and verify your internet connection. If the problem continues, note what you were doing when the problem occurred and contact system support or your administrator.",
      category: "troubleshooting",
    },

  ];


  /*
   * ==================================================
   * SEARCH RESULTS
   * ==================================================
   */

  const filteredArticles =
    useMemo(() => {

      const query =
        searchQuery
          .trim()
          .toLowerCase();


      return articles.filter(
        (article) => {

          const matchesCategory =
            activeCategory ===
              "all" ||
            article.category ===
              activeCategory;


          if (!query) {
            return matchesCategory;
          }


          return (
            matchesCategory &&
            (
              article.title
                .toLowerCase()
                .includes(query) ||
              article.description
                .toLowerCase()
                .includes(query)
            )
          );

        }
      );

    }, [
      searchQuery,
      activeCategory,
    ]);


  /*
   * ==================================================
   * FAQ SEARCH
   * ==================================================
   */

  const filteredFaqs =
    useMemo(() => {

      const query =
        searchQuery
          .trim()
          .toLowerCase();


      if (!query) {
        return faqs;
      }


      return faqs.filter(
        (faq) =>
          faq.question
            .toLowerCase()
            .includes(query) ||
          faq.answer
            .toLowerCase()
            .includes(query)
      );

    }, [
      searchQuery,
    ]);


  /*
   * ==================================================
   * FAQ TOGGLE
   * ==================================================
   */

  const toggleFaq =
    (id) => {

      setOpenFaq(
        (previous) =>
          previous === id
            ? null
            : id
      );

    };


  /*
   * ==================================================
   * RENDER
   * ==================================================
   */

  return (

    <div className="w-full space-y-8 pb-8">


      {/* ==================================================
          HERO
      ================================================== */}

      <section className="relative overflow-hidden rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

        {/* Decorative background */}

        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />


        <div className="relative px-5 py-10 sm:px-8 sm:py-14 lg:px-12">

          <div className="mx-auto max-w-3xl text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/10">

              <LifeBuoy
                size={28}
                strokeWidth={1.7}
              />

            </div>


            <h1 className="mt-5 text-2xl font-bold tracking-tight text-[var(--bms-text)] sm:text-4xl">

              How can we help you?

            </h1>


            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--bms-text-secondary)] sm:text-base">

              Find answers, learn how to use the Business Management System, and get help with common tasks.

            </p>


            {/* Search */}

            <div className="relative mx-auto mt-7 max-w-2xl">

              <Search
                size={19}
                strokeWidth={1.8}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--bms-text-muted)]"
              />


              <input
                type="search"
                value={
                  searchQuery
                }
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                placeholder="Search help articles, FAQs and topics..."
                aria-label="Search help center"
                className="h-13 w-full rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] pl-11 pr-4 text-sm text-[var(--bms-text)] outline-none transition-all duration-200 placeholder:text-[var(--bms-text-muted)] focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
              />

            </div>


            {searchQuery && (

              <p className="mt-3 text-xs text-[var(--bms-text-muted)]">

                Searching for{" "}

                <span className="font-medium text-[var(--bms-text)]">
                  "{searchQuery}"
                </span>

              </p>

            )}

          </div>

        </div>

      </section>


      {/* ==================================================
          QUICK HELP
      ================================================== */}

      <section>

        <div className="mb-4">

          <h2 className="text-lg font-semibold text-[var(--bms-text)]">
            Quick Help
          </h2>

          <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
            Find information about the most important areas of the system.
          </p>

        </div>


        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {categories.map(
            (category) => {

              const Icon =
                category.icon;


              return (

                <button
                  key={
                    category.id
                  }
                  type="button"
                  onClick={() =>
                    setActiveCategory(
                      category.id
                    )
                  }
                  className={`group rounded-xl border p-5 text-left transition-all duration-300 ${
                    activeCategory ===
                    category.id
                      ? "border-blue-500/40 bg-blue-500/5 shadow-lg shadow-blue-500/5"
                      : "border-[var(--bms-border)] bg-[var(--bms-surface)] hover:-translate-y-0.5 hover:border-blue-500/25 hover:shadow-lg hover:shadow-blue-500/5"
                  }`}
                >

                  <div className="flex items-start justify-between">

                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${category.iconClass}`}
                    >

                      <Icon
                        size={21}
                        strokeWidth={1.8}
                      />

                    </div>


                    <ChevronRight
                      size={17}
                      className="text-[var(--bms-text-muted)] transition-transform duration-200 group-hover:translate-x-1"
                    />

                  </div>


                  <h3 className="mt-4 text-sm font-semibold text-[var(--bms-text)]">
                    {category.title}
                  </h3>


                  <p className="mt-1.5 text-xs leading-5 text-[var(--bms-text-muted)]">
                    {category.description}
                  </p>


                  <p className="mt-3 text-[11px] font-medium text-blue-500">
                    {category.articles} articles
                  </p>

                </button>

              );

            }
          )}

        </div>

      </section>


      {/* ==================================================
          POPULAR ARTICLES
      ================================================== */}

      <section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <h2 className="text-lg font-semibold text-[var(--bms-text)]">
              Helpful Resources
            </h2>

            <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
              Popular guides and articles to help you get things done.
            </p>

          </div>


          {activeCategory !==
            "all" && (

            <button
              type="button"
              onClick={() =>
                setActiveCategory(
                  "all"
                )
              }
              className="w-fit text-xs font-medium text-blue-500 hover:underline"
            >
              View all resources
            </button>

          )}

        </div>


        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">

          {filteredArticles.length >
          0 ? (

            filteredArticles.map(
              (article) => {

                const Icon =
                  article.icon;


                return (

                  <button
                    key={
                      article.id
                    }
                    type="button"
                    className="group flex items-start gap-4 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500/25 hover:shadow-lg hover:shadow-blue-500/5"
                  >

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--bms-surface-soft)] text-[var(--bms-text-secondary)] transition-colors group-hover:bg-blue-500/10 group-hover:text-blue-500">

                      <Icon
                        size={18}
                        strokeWidth={1.8}
                      />

                    </div>


                    <div className="min-w-0 flex-1">

                      <h3 className="text-sm font-medium text-[var(--bms-text)]">
                        {article.title}
                      </h3>


                      <p className="mt-1 text-xs leading-5 text-[var(--bms-text-muted)]">
                        {article.description}
                      </p>


                      <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-blue-500">

                        Read article

                        <ArrowRight
                          size={12}
                          className="transition-transform group-hover:translate-x-0.5"
                        />

                      </span>

                    </div>

                  </button>

                );

              }
            )

          ) : (

            <div className="col-span-full rounded-xl border border-dashed border-[var(--bms-border)] p-10 text-center">

              <Search
                size={24}
                className="mx-auto text-[var(--bms-text-muted)]"
              />

              <p className="mt-3 text-sm font-medium text-[var(--bms-text)]">
                No help articles found
              </p>

              <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
                Try a different search term.
              </p>

            </div>

          )}

        </div>

      </section>


      {/* ==================================================
          FAQ
      ================================================== */}

      <section>

        <div className="mb-4">

          <h2 className="text-lg font-semibold text-[var(--bms-text)]">
            Frequently Asked Questions
          </h2>

          <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
            Answers to common questions about the system.
          </p>

        </div>


        <div className="overflow-hidden rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

          {filteredFaqs.map(
            (faq, index) => {

              const isOpen =
                openFaq ===
                faq.id;


              return (

                <div
                  key={
                    faq.id
                  }
                  className={`${
                    index !==
                    filteredFaqs.length - 1
                      ? "border-b border-[var(--bms-border)]"
                      : ""
                  }`}
                >

                  <button
                    type="button"
                    onClick={() =>
                      toggleFaq(
                        faq.id
                      )
                    }
                    aria-expanded={
                      isOpen
                    }
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-200 hover:bg-[var(--bms-surface-soft)]"
                  >

                    <div className="flex min-w-0 items-center gap-3">

                      <HelpCircle
                        size={17}
                        className="shrink-0 text-blue-500"
                      />

                      <span className="text-sm font-medium text-[var(--bms-text)]">
                        {faq.question}
                      </span>

                    </div>


                    <ChevronDown
                      size={17}
                      className={`shrink-0 text-[var(--bms-text-muted)] transition-transform duration-200 ${
                        isOpen
                          ? "rotate-180"
                          : ""
                      }`}
                    />

                  </button>


                  <div
                    className={`grid transition-all duration-200 ${
                      isOpen
                        ? "grid-rows-[1fr]"
                        : "grid-rows-[0fr]"
                    }`}
                  >

                    <div className="overflow-hidden">

                      <p className="px-5 pb-5 pl-12 text-sm leading-6 text-[var(--bms-text-secondary)]">

                        {faq.answer}

                      </p>

                    </div>

                  </div>

                </div>

              );

            }
          )}


          {filteredFaqs.length ===
            0 && (

            <div className="p-10 text-center">

              <HelpCircle
                size={24}
                className="mx-auto text-[var(--bms-text-muted)]"
              />

              <p className="mt-3 text-sm font-medium text-[var(--bms-text)]">
                No matching questions
              </p>

            </div>

          )}

        </div>

      </section>


      {/* ==================================================
          TROUBLESHOOTING
      ================================================== */}

      <section>

        <div className="mb-4">

          <h2 className="text-lg font-semibold text-[var(--bms-text)]">
            Troubleshooting
          </h2>

          <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
            Quick solutions for common system problems.
          </p>

        </div>


        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">


          <TroubleshootingCard
            icon={RefreshCw}
            title="Page not loading"
            description="Refresh the page and check your internet connection. If the problem persists, try signing out and signing in again."
          />


          <TroubleshootingCard
            icon={LockKeyhole}
            title="Access denied"
            description="Your current role may not have the required permission. Contact an administrator if you need additional access."
          />


          <TroubleshootingCard
            icon={AlertTriangle}
            title="Something went wrong"
            description="Retry the operation. If the problem continues, record the error and contact system support."
          />

        </div>

      </section>


      {/* ==================================================
          SECURITY REMINDER
      ================================================== */}

      <section className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">

        <div className="flex items-start gap-4">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">

            <LockKeyhole
              size={19}
            />

          </div>


          <div>

            <h2 className="text-sm font-semibold text-[var(--bms-text)]">
              Security reminder
            </h2>


            <p className="mt-1 max-w-3xl text-xs leading-5 text-[var(--bms-text-secondary)]">

              Never share your password, authentication credentials or active session information with another person. If you notice suspicious account activity, revoke unfamiliar sessions and contact your system administrator.

            </p>

          </div>

        </div>

      </section>


      {/* ==================================================
          CONTACT SUPPORT
      ================================================== */}

      <section className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-blue-500/[0.04]">

        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />


        <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">

              <MessageCircle
                size={23}
              />

            </div>


            <div>

              <h2 className="text-lg font-semibold text-[var(--bms-text)]">
                Still need help?
              </h2>


              <p className="mt-1 max-w-xl text-sm leading-6 text-[var(--bms-text-secondary)]">

                If you cannot find the answer you're looking for, contact your system administrator or support team.

              </p>

            </div>

          </div>


          <div className="flex flex-wrap gap-3">

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:bg-blue-500 active:scale-95"
            >

              <MessageCircle
                size={15}
              />

              Contact Support

            </button>


            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface)] px-4 py-2.5 text-xs font-semibold text-[var(--bms-text-secondary)] transition-all duration-200 hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)] active:scale-95"
            >

              <Mail
                size={15}
              />

              Email Support

            </button>

          </div>

        </div>

      </section>


      {/* ==================================================
          FOOTER HELP LINKS
      ================================================== */}

      <section className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-2 text-xs text-[var(--bms-text-muted)]">

        <Link
          to="/notifications"
          className="inline-flex items-center gap-1.5 transition-colors hover:text-blue-500"
        >

          <Bell
            size={13}
          />

          Notifications

        </Link>


        <Link
          to="/security"
          className="inline-flex items-center gap-1.5 transition-colors hover:text-blue-500"
        >

          <LockKeyhole
            size={13}
          />

          Security

        </Link>


        <Link
          to="/settings"
          className="inline-flex items-center gap-1.5 transition-colors hover:text-blue-500"
        >

          <Settings
            size={13}
          />

          Settings

        </Link>


        <Link
          to="/profile"
          className="inline-flex items-center gap-1.5 transition-colors hover:text-blue-500"
        >

          <UserCircle
            size={13}
          />

          Profile

        </Link>

      </section>

    </div>

  );
}


/*
 * ==================================================
 * TROUBLESHOOTING CARD
 * ==================================================
 */

function TroubleshootingCard({
  icon: Icon,
  title,
  description,
}) {

  return (

    <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-5 transition-all duration-300 hover:border-blue-500/20 hover:shadow-lg hover:shadow-blue-500/5">

      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--bms-surface-soft)] text-[var(--bms-text-secondary)]">

        <Icon
          size={18}
        />

      </div>


      <h3 className="mt-4 text-sm font-semibold text-[var(--bms-text)]">
        {title}
      </h3>


      <p className="mt-1.5 text-xs leading-5 text-[var(--bms-text-muted)]">
        {description}
      </p>

    </div>

  );

}


export default HelpCenter;
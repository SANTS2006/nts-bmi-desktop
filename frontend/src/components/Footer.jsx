function Footer() {
  return (
    <footer className="border-t border-[var(--bms-border)] bg-[var(--bms-surface)] px-4 py-4 transition-colors duration-300 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
        <div>
          <p className="text-xs font-medium text-[var(--bms-text-secondary)]">
            © {new Date().getFullYear()} NTS Digital Solutions
          </p>

          <p className="mt-0.5 text-[11px] text-[var(--bms-text-muted)]">
            Empowering Businesses Through Digital Innovation
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-[var(--bms-text-muted)]">
          <span>NTS BMS</span>

          <span
            className="h-1 w-1 rounded-full bg-[var(--bms-text-muted)]"
            aria-hidden="true"
          />

          <span>v1.0.0</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconClass,
  chartClass,
  loading = false,
}) {

  return (

    <div className="group relative overflow-hidden rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5">


      <div className="flex items-start justify-between">


        <div>

          <p className="text-sm text-[var(--bms-text-secondary)]">
            {title}
          </p>


          {loading ? (

            <div className="mt-3 h-9 w-20 animate-pulse rounded-lg bg-[var(--bms-surface-soft)]" />

          ) : (

            <p className="mt-2 text-3xl font-bold tracking-tight text-[var(--bms-text)]">

              {value}

            </p>

          )}

        </div>


        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >

          <Icon
            size={22}
          />

        </div>

      </div>


      <div className="mt-4 flex items-center gap-2">

        {loading ? (

          <>

            <div className="h-4 w-12 animate-pulse rounded bg-[var(--bms-surface-soft)]" />

            <div className="h-3 w-24 animate-pulse rounded bg-[var(--bms-surface-soft)]" />

          </>

        ) : (

          <>

            <span className="text-sm font-medium text-emerald-500">

              {change}

            </span>


            <span className="text-xs text-[var(--bms-text-muted)]">

              {changeLabel}

            </span>

          </>

        )}

      </div>


      <div
        className={`mt-4 h-8 overflow-hidden ${chartClass}`}
      >

        <svg
          viewBox="0 0 240 40"
          className="h-full w-full"
          preserveAspectRatio="none"
          aria-hidden="true"
        >

          <path
            d="M0 30 C25 20 30 34 55 25 C80 15 90 30 115 18 C140 5 150 28 175 14 C195 3 210 18 240 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          />

        </svg>

      </div>

    </div>

  );
}


export default StatCard;
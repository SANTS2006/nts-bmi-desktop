import {
  Link,
} from "react-router-dom";


function QuickAction({
  to,
  icon: Icon,
  title,
  iconClass,
}) {

  return (

    <Link
      to={to}
      className="group flex min-w-0 flex-col items-center rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500/30 hover:bg-[var(--bms-surface)] hover:shadow-lg hover:shadow-blue-500/5 active:scale-[0.98]"
    >

      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
      >

        <Icon
          size={21}
        />

      </div>


      <span className="mt-3 text-center text-xs font-medium text-[var(--bms-text-secondary)] transition-colors group-hover:text-[var(--bms-text)]">

        {title}

      </span>

    </Link>

  );
}


export default QuickAction;
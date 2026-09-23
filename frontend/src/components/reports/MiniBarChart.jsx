import { motion } from "framer-motion";

const formatValue = value => Number(value || 0).toLocaleString();

export default function MiniBarChart({
  data = [],
  labelKey = "month",
  valueKey = "value",
  height = 180,
  formatter = formatValue,
  emptyMessage = "No data for this period.",
}) {
  const normalized = Array.isArray(data)
    ? data
      .map((item, index) => ({
        ...item,
        __index: index,
        __label: item?.[labelKey] ?? `Item ${index + 1}`,
        __value: Number(item?.[valueKey]) || 0,
      }))
      .filter(item => item.__value >= 0)
    : [];

  if (!normalized.length) {
    return (
      <div
        className="flex items-center justify-center text-sm text-[var(--bms-text-muted)]"
        style={{ height }}
      >
        {emptyMessage}
      </div>
    );
  }

  const max = Math.max(
    1,
    ...normalized.map(item => item.__value)
  );

  return (
    <div
      className="flex w-full items-end gap-2 overflow-x-auto pb-2"
      style={{ height }}
    >
      {normalized.map((item, index) => {
        const percentage =
          max === 0 ? 0 : (item.__value / max) * 100;

        const barHeight = Math.max(
          item.__value > 0 ? 6 : 2,
          percentage
        );

        return (
          <div
            key={`${String(item.__label)}-${item.__index}`}
            className="flex h-full min-w-[42px] flex-1 flex-col items-center justify-end gap-2"
          >
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.03,
              }}
              className="text-[10px] font-semibold text-[var(--bms-text-secondary)]"
            >
              {formatter(item.__value)}
            </motion.span>

            <div className="flex h-[120px] w-full items-end justify-center">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${barHeight}%` }}
                transition={{
                  duration: 0.55,
                  delay: index * 0.035,
                  ease: "easeOut",
                }}
                className="w-full max-w-9 rounded-t-md bg-blue-500/80 transition-opacity hover:opacity-70"
                title={`${item.__label}: ${formatter(item.__value)}`}
              />
            </div>

            <span
              className="max-w-[55px] truncate text-center text-[9px] text-[var(--bms-text-muted)]"
              title={String(item.__label)}
            >
              {String(item.__label).length > 8
                ? `${String(item.__label).slice(-8)}`
                : String(item.__label)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
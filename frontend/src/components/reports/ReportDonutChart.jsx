import { motion } from "framer-motion";

const defaultFormatter = value =>
    Number(value || 0).toLocaleString();

export default function ReportDonutChart({
    data = {},
    title = "",
    formatter = defaultFormatter,
}) {
    const entries = Object.entries(data || {})
        .map(([label, value]) => ({
            label,
            value: Number(value) || 0,
        }))
        .filter(item => item.value >= 0);

    const total = entries.reduce(
        (sum, item) => sum + item.value,
        0
    );

    if (!entries.length || total === 0) {
        return (
            <div className="flex h-56 items-center justify-center text-sm text-[var(--bms-text-muted)]">
                No data for this period.
            </div>
        );
    }

    /*
     * We deliberately use conic-gradient rather than adding another
     * chart dependency to the application.
     */
    let current = 0;

    const segments = entries.map((item, index) => {
        const start = current;
        const percentage = (item.value / total) * 100;

        current += percentage;

        return {
            ...item,
            index,
            start,
            end: current,
            percentage,
        };
    });

    const gradient = segments
        .map((segment, index) => {
            const hue = (index * 47) % 360;

            return `hsl(${hue} 75% 55%) ${segment.start}% ${segment.end}%`;
        })
        .join(", ");

    return (
        <div className="grid gap-6 sm:grid-cols-[180px_1fr] sm:items-center">
            <div className="relative mx-auto h-44 w-44">
                <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.45 }}
                    className="h-full w-full rounded-full"
                    style={{
                        background: `conic-gradient(${gradient})`,
                    }}
                />

                <div className="absolute inset-[18px] flex flex-col items-center justify-center rounded-full bg-[var(--bms-surface)]">
                    <span className="text-2xl font-bold text-[var(--bms-text)]">
                        {formatter(total)}
                    </span>

                    {title && (
                        <span className="mt-1 text-[10px] text-[var(--bms-text-muted)]">
                            {title}
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                {segments.map(segment => {
                    const hue = (segment.index * 47) % 360;

                    return (
                        <div
                            key={segment.label}
                            className="flex items-center justify-between gap-3"
                        >
                            <div className="flex min-w-0 items-center gap-2">
                                <span
                                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                                    style={{
                                        backgroundColor: `hsl(${hue} 75% 55%)`,
                                    }}
                                />

                                <span className="truncate text-xs capitalize text-[var(--bms-text-secondary)]">
                                    {segment.label
                                        .replaceAll("_", " ")
                                        .toLowerCase()}
                                </span>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                                <span className="text-xs font-semibold text-[var(--bms-text)]">
                                    {formatter(segment.value)}
                                </span>

                                <span className="text-[10px] text-[var(--bms-text-muted)]">
                                    {segment.percentage.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  PLACED: "bg-tertiary-50 text-tertiary-dark border-tertiary/20",
  CONFIRMED: "bg-primary-50 text-primary border-primary/20",
  PAID: "bg-purple-50 text-purple-700 border-purple/20",
  PICKED_UP: "bg-green-50 text-green-700 border-green-500/20",
  RETURNED: "bg-slate-100 text-slate-600 border-slate-300",
  CANCELLED: "bg-secondary-50 text-secondary-dark border-secondary/20",
  ACTIVE: "bg-green-50 text-green-700 border-green-500/20",
  SUSPENDED: "bg-secondary-50 text-secondary-dark border-secondary/20",
  PENDING: "bg-tertiary-50 text-tertiary-dark border-tertiary/20",
  COMPLETED: "bg-green-50 text-green-700 border-green-500/20",
  FAILED: "bg-secondary-50 text-secondary-dark border-secondary/20",
};

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof statusStyles | "default";
};

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const style = variant === "default" ? "bg-slate-100 text-slate-700 border border-slate-300" : statusStyles[variant] || statusStyles.default;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider",
        style,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

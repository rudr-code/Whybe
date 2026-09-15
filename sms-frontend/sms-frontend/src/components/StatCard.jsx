export default function StatCard({ title, value, subtitle, icon, trend, color = "emerald" }) {
  const getColorStyles = () => {
    switch (color) {
      case "emerald":
        return {
          iconBg: "bg-emerald/10 text-emerald border-emerald/20",
          trend: "text-emerald",
        };
      case "crimson":
        return {
          iconBg: "bg-crimson/10 text-crimson border-crimson/20",
          trend: "text-crimson",
        };
      case "jet":
        return {
          iconBg: "bg-jet/10 text-jet border-jet/20",
          trend: "text-ink",
        };
      case "platinum":
      default:
        return {
          iconBg: "bg-platinum/40 text-slate border-platinum",
          trend: "text-slate",
        };
    }
  };

  const style = getColorStyles();

  return (
    <div className="bg-white border border-platinum rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate uppercase tracking-wider">{title}</p>
          <h3 className="font-heading text-2xl sm:text-3xl font-bold text-ink mt-1.5">{value}</h3>
          {subtitle && <p className="text-xs text-slate mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${style.iconBg}`}>
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-platinum/60 flex items-center text-[11px] font-medium text-slate">
          <span className={`font-semibold mr-1.5 ${style.trend}`}>{trend}</span>
        </div>
      )}
    </div>
  );
}

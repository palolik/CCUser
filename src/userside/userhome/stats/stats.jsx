import { useState, useEffect } from "react";
import { Users, Package, Star, Eye, TrendingUp } from "lucide-react";
import { base_url } from "../../../config/config";

const statConfig = [
  { key: "clients",  label: "Active Clients",     icon: Users,   color: "blue",   trend: "+12%" },
  { key: "packages", label: "Packages Delivered", icon: Package, color: "emerald",trend: "+23%" },
  { key: "reviews",  label: "Customer Reviews",   icon: Star,    color: "amber",  trend: "+18%" },
  { key: "views",    label: "Total Visitors",     icon: Eye,     color: "purple", trend: "+34%" },
];

const colorMap = {
  blue:    { icon: "rgba(59,130,246,0.12)",  bar: "from-blue-500 to-blue-400",       text: "text-blue-500"    },
  emerald: { icon: "rgba(16,185,129,0.12)",  bar: "from-emerald-500 to-emerald-400", text: "text-emerald-500" },
  amber:   { icon: "rgba(245,158,11,0.12)",  bar: "from-amber-500 to-amber-400",     text: "text-amber-500"   },
  purple:  { icon: "rgba(139,92,246,0.12)",  bar: "from-purple-500 to-purple-400",   text: "text-purple-500"  },
};

const useCounter = (target, duration = 2000, delay = 0) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target) return;
    let raf, start;
    const timeout = setTimeout(() => {
      const step = (ts) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setValue(Math.floor(ease * target));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay);
    return () => { clearTimeout(timeout); cancelAnimationFrame(raf); };
  }, [target, duration, delay]);
  return value;
};

const StatCard = ({ label, rawValue, icon: Icon, color, trend, delay }) => {
  const animated = useCounter(rawValue, 2000, delay);
  const c = colorMap[color];
  const display = animated >= 1000 ? (animated / 1000).toFixed(1) + "K" : animated;

  return (
    <div
      className="group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1.5 cursor-default"
      style={{ background: "#fafbff", borderColor: "#e5e9f0" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#eff6ff";
        e.currentTarget.style.borderColor = "#bfdbfe";
        e.currentTarget.style.boxShadow = "0 20px 40px rgba(59,130,246,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#fafbff";
        e.currentTarget.style.borderColor = "#e5e9f0";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div className="p-7">

        {/* Icon */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
          style={{ background: c.icon }}
        >
          <Icon className={`w-5 h-5 ${c.text}`} strokeWidth={2} />
        </div>

        {/* Value */}
        <div
          className="font-serif text-5xl font-semibold text-gray-900 leading-none mb-1"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {display}
          <span className="text-2xl text-gray-300 font-sans font-light">+</span>
        </div>
        <p className="text-xs text-gray-400 font-medium mb-4 tracking-wide">{label}</p>

        {/* Trend */}
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-xs font-medium px-3 py-1 rounded-full">
          <TrendingUp className="w-3 h-3" />
          {trend} this month
        </div>
      </div>

      {/* Bottom accent bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${c.bar} scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}
      />
    </div>
  );
};

const Stats = () => {
  const [stats, setStats] = useState({ clients: 0, packages: 0, reviews: 0, views: 0 });

  useEffect(() => {
    fetch(`${base_url}/stats`)
      .then((res) => res.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  return (
    <section className="relative py-24 px-6 overflow-hidden bg-white">

      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-600 text-xs px-4 py-2 rounded-full mb-5 font-medium">
          <TrendingUp className="w-3.5 h-3.5" /> Real-Time Analytics
        </div>
        <h2
          className="font-serif text-4xl md:text-5xl font-semibold text-gray-900 leading-tight mb-4"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Our Impact <em className="italic text-blue-500">in Numbers</em>
        </h2>
        <p className="text-gray-400 font-light text-base max-w-md mx-auto leading-relaxed">
          Trusted by businesses worldwide. See how we're growing together.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
        {statConfig.map((s, i) => (
          <StatCard
            key={s.key}
            label={s.label}
            rawValue={stats[s.key] || 0}
            icon={s.icon}
            color={s.color}
            trend={s.trend}
            delay={i * 120}
          />
        ))}
      </div>
    </section>
  );
};

export default Stats;
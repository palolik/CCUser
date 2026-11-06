/* eslint-disable react/prop-types */
// Compact deadline countdown used on board cards (employee tasks, client
// projects).
import { useEffect, useRef, useState } from "react";
import { MdAccessTime, MdTimerOff } from "react-icons/md";

// Card colours by how much of the allowed time is left.
const timeTone = (fraction) =>
  fraction > 0.5  ? { box:"bg-emerald-50 border-emerald-200", text:"text-emerald-700", bar:"bg-emerald-500" }
  : fraction > 0.2 ? { box:"bg-amber-50 border-amber-200",   text:"text-amber-700",   bar:"bg-amber-500" }
  :                  { box:"bg-red-50 border-red-200",       text:"text-red-700",     bar:"bg-red-500" };

export const TimeUp = ({ label = "Time is up" }) => (
  <div className="flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-2 text-xs font-semibold text-red-700">
    <MdTimerOff size={15} /> {label}
  </div>
);

// Compact countdown for cards: d/h/m/s blocks and a bar of the time left,
// green → amber → red as the deadline nears. Calls onExpire once at zero.
export const TimeLeft = ({ targetDate, totalMs, onExpire, expiredLabel }) => {
  const target = targetDate.getTime();
  const [left, setLeft] = useState(() => target - Date.now());
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    let fired = false;
    const tick = () => {
      const diff = target - Date.now();
      setLeft(diff);
      if (diff <= 0 && !fired) {
        fired = true;
        onExpireRef.current?.();
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [target]);

  if (left <= 0) return <TimeUp label={expiredLabel} />;

  const pad = (n) => String(n).padStart(2, "0");
  const units = [
    [Math.floor(left / 86400000), "d"],
    [Math.floor((left % 86400000) / 3600000), "h"],
    [Math.floor((left % 3600000) / 60000), "m"],
    [Math.floor((left % 60000) / 1000), "s"],
  ];
  if (units[0][0] === 0) units.shift();
  const fraction = totalMs > 0 ? Math.min(1, left / totalMs) : 1;
  const tone = timeTone(fraction);

  return (
    <div className={`rounded-md border px-2.5 py-2 ${tone.box}`}>
      <div className={`flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider ${tone.text}`}>
        <span className="flex items-center gap-1"><MdAccessTime size={13} /> Time left</span>
        <span>{Math.round(fraction * 100)}%</span>
      </div>
      <div className="flex items-end gap-1 mt-1.5">
        {units.map(([value, unit], i) => (
          <div key={unit} className="flex items-baseline">
            <span className="bg-white rounded px-1.5 py-0.5 text-sm font-bold text-gray-800 tabular-nums shadow-sm">{i === 0 ? value : pad(value)}</span>
            <span className={`ml-0.5 text-[10px] font-medium ${tone.text}`}>{unit}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 h-1 rounded-full bg-white/80 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000 ${tone.bar}`} style={{ width: `${fraction * 100}%` }} />
      </div>
    </div>
  );
};

import { useState, useEffect, useRef } from "react";
import background  from "/assets/back/2.svg";  // viewBox 750×500 (landscape/wide)
import background2 from "/assets/back/3.svg";  // viewBox 500×500 (square)
import background3 from "/assets/back/4.svg";  // viewBox 500×500 (square)

const slides = [
  {
    title: ["Your Gateway to the", "Online Business World"],
    subtitle: "Helping businesses grow globally with trusted digital solutions since 2019.",
    image: background,
    // 750×500 = wide — needs more width, less height
    imgClass: "w-full h-auto max-h-[75vh] object-contain",
  },
  {
    title: ["Grow Your Business", "With Confidence"],
    subtitle: "Empowering startups through modern technology and strategy.",
    image: background2,
    // 500×500 = square — constrain by height
    imgClass: "h-[70vh] w-auto max-w-full object-contain",
  },
  {
    title: ["Transform Ideas Into", "Powerful Solutions"],
    subtitle: "Innovative tools designed to scale your business faster.",
    image: background3,
    // 500×500 = square — same
    imgClass: "h-[70vh] w-auto max-w-full object-contain",
  },
];

const Home3 = () => {
  const [current, setCurrent]   = useState(0);
  const [visible, setVisible]   = useState(true);
  const timerRef = useRef(null);

  const goTo = (idx) => {
    setVisible(false);
    setTimeout(() => {
      setCurrent(idx);
      setVisible(true);
    }, 350);
  };

  const next = () => goTo((current + 1) % slides.length);

  useEffect(() => {
    timerRef.current = setInterval(next, 4500);
    return () => clearInterval(timerRef.current);
  }, [current]);

  const s = slides[current];

  return (
    <section className="relative w-full min-h-screen flex overflow-hidden"
      style={{ background: "linear-gradient(150deg,#050d1f 0%,#0d1b3e 55%,#091528 100%)" }}>

      {/* Background glow */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[500px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse,rgba(59,130,246,0.12) 0%,transparent 65%)" }} />

      {/* ── LEFT: Text (always 55% on desktop, full on mobile) ── */}
      <div className="relative z-10 flex flex-col justify-center
        w-full lg:w-[55%] flex-shrink-0
        px-4 pt-2 pb-20 lg:px-18 lg:pt-0 lg:pl-20">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 self-start bg-blue-500/10 border border-blue-500/25
          text-blue-400 text-xs tracking-[2.5px] uppercase px-5 py-2 rounded-full mb-8 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block" />
          Cloud Company
        </div>

        {/* Title */}
        <h1 className={`font-serif text-5xl md:text-6xl lg:text-[clamp(36px,4.5vw,58px)]
          font-semibold text-blue-50 leading-[1.12] mb-5 max-w-xl
          transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ fontFamily: "'Playfair Display', serif" }}>
          {s.title[0]}<br />
          <em className="italic text-blue-400">{s.title[1]}</em>
        </h1>

        {/* Subtitle */}
        <p className={`text-base lg:text-lg text-blue-300/50 font-light leading-relaxed
          max-w-md mb-12
          transition-all duration-500 delay-100 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          {s.subtitle}
        </p>

        {/* CTAs */}
        <div className={`flex flex-wrap gap-4
          transition-all duration-500 delay-150 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <button className="border border-blue-400/30 hover:border-blue-400 text-blue-400
            hover:bg-blue-500/10 font-light text-sm px-4 py-2  lg:px-8 lg:py-3.5 rounded-full transition-all duration-200">
            Get Started
          </button>
          <button className="border border-blue-400/30 hover:border-blue-400 text-blue-400
            hover:bg-blue-500/10 font-light text-sm px-4 py-2  lg:px-8 lg:py-3.5 rounded-full transition-all duration-200">
            View Portfolio
          </button>
        </div>

        {/* Slide dots */}
        <div className="flex gap-2 mt-16">
          {slides.map((_, i) => (
            <button key={i} onClick={() => { clearInterval(timerRef.current); goTo(i); }}
              className={`h-2 rounded-full transition-all duration-300 border-none cursor-pointer ${
                i === current
                  ? "w-6 bg-blue-500"
                  : "w-2 bg-white/20 hover:bg-white/40"
              }`} />
          ))}
        </div>
      </div>

      {/* ── RIGHT: Image — contained in its own column, never overlapping ── */}
      <div className="hidden lg:flex flex-1 items-center justify-center
        pr-12 pl-4 py-16 overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            key={current}                  // forces remount = fresh fade-in
            src={s.image}
            alt={s.title.join(" ")}
            className={`${s.imgClass}
              transition-all duration-500 ease-out
              ${visible ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-95 translate-x-4"}`}
          />
        </div>
      </div>

      {/* Mobile image — below text, safe area */}
      <div className="lg:hidden absolute bottom-0 left-0 right-0 h-[38vh] flex items-end justify-center
        pointer-events-none px-6 pb-2">
        <img
          key={"m" + current}
          src={s.image}
          alt={s.title.join(" ")}
          className={`max-h-full max-w-full object-contain
            transition-all duration-500
            ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        />
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-[2px] bg-blue-500 z-20"
        style={{ width: visible ? "100%" : "0%", transition: visible ? "width 4.5s linear" : "none" }} />
    </section>
  );
};

export default Home3;
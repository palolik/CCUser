import { useState, useEffect } from "react";

const reasons = [
  { text: "Customer-focused, convincing copy that sells harder and converts better." },
  { text: "When you choose us, you'll feel the benefit of 15 years of writing and editing experience." },
  { text: "It's all about what adds value for your business. We want our words to work for you." },
  { text: "We're lean and efficient — not a big agency. We know you want to keep a lid on costs." },
  { text: "With deep knowledge of SEO, online and social media, we take your message wherever it needs to go." },
  { text: "Before writing a word, we think about your tone of voice and value proposition." },
  { text: "We take the work seriously, but not ourselves. Not prickly, precious, or pretentious." },
  { text: "We're the go-to copywriters for dozens of UK marketing agencies and professionals." },
];

const Whychooseus = () => {
  const [visibleCards, setVisibleCards] = useState([]);

  useEffect(() => {
    reasons.forEach((_, i) => {
      setTimeout(() => setVisibleCards((prev) => [...prev, i]), 100 + i * 100);
    });
  }, []);

  return (
    <section className="w-full py-24 px-6 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg,#0a0f1e 0%,#0d1a35 60%,#091528 100%)" }}>

      {/* Glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-96 pointer-events-none"
        style={{ background: "radial-gradient(ellipse,rgba(56,130,246,0.13) 0%,transparent 70%)" }} />

      {/* Header */}
      <p className="text-center text-xs tracking-[3px] uppercase text-blue-500 font-medium mb-4">
        Why work with us
      </p>
      <h2 className="text-center font-serif text-4xl lg:text-6xl font-semibold text-blue-50 leading-tight mb-4">
        Built for results.<br />
        <span className="text-blue-500">Driven by craft.</span>
      </h2>
      <p className="text-center text-blue-300/60 font-light text-base mb-16 max-w-md mx-auto">
        15 years of writing and editing, distilled into every word we deliver for you.
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-w-6xl mx-auto">
        {reasons.map((reason, i) => (
          <div
            key={i}
            className={`group relative rounded-2xl p-7 border transition-all duration-300 cursor-default
              hover:-translate-y-1 hover:shadow-2xl overflow-hidden
              ${visibleCards.includes(i) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-7"}`}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              transition: visibleCards.includes(i)
                ? "opacity 0.5s ease, transform 0.5s ease, background 0.3s, border-color 0.3s, box-shadow 0.3s"
                : "none",
            }}
          >
            {/* Number */}
            <div className="font-serif text-5xl font-semibold mb-4 leading-none tracking-tighter"
              style={{ color: "rgba(59,130,246,0.2)" }}>
              0{i + 1}
            </div>

            {/* Text */}
            <p className="text-sm leading-relaxed font-light" style={{ color: "#b0bfd8" }}>
              {reason.text}
            </p>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500 rounded-bl-2xl"
              style={{ background: "linear-gradient(90deg,#3b82f6,#60a5fa)" }} />
          </div>
        ))}
      </div>

    
    </section>
  );
};

export default Whychooseus;
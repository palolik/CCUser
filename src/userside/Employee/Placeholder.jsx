
const Placeholder = () => {


  return (
      <div className="flex flex-col justify-center items-center h-full">
    <div className="w-full  mx-auto px-4 py-8">

     
      <div className="text-center mb-8">
        <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-2">Getting started</p>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No tasks yet</h2>
        <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
          Follow these steps to get approved and receive your first task.
        </p>
      </div>

     
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            step: 1,
            title: "Complete your profile",
            desc: "Add your name, phone, country, and a profile photo. A complete profile helps us assign the right tasks to you.",
            tag: "Do this first",
            active: true,
            icon: (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="5" r="3.2" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M2 15c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            ),
          },
          {
            step: 2,
            title: "Add 7 portfolio items",
            desc: "Go to the Portfolio tab and upload 7 samples relevant to your department. These are reviewed to evaluate your work quality.",
            note: "Based on your department",
            active: false,
            icon: (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="2" width="14" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M5 9h8M5 6h5M5 12h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            ),
          },
          {
            step: 3,
            title: "Wait for review",
            desc: "Our team will review your portfolio. This usually takes 1–3 business days. No action needed from your side.",
            active: false,
            icon: (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M9 5.5V9l2.5 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            ),
          },
          {
            step: 4,
            title: "Get your first task",
            desc: "Once your portfolio is accepted, you'll receive an email. Your first task will appear on this page automatically.",
            final: true,
            active: false,
            icon: (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M2 7.5l7 4.5 7-4.5" stroke="currentColor" strokeWidth="1.4"/>
              </svg>
            ),
          },
        ].map(({ step, title, desc, tag, note, active, final, icon }) => (
          <div
            key={step}
            className={`relative rounded-2xl p-4 flex flex-col gap-3 overflow-hidden
              ${active
                ? "bg-white border-[1.5px] border-blue-200 shadow-sm shadow-blue-50"
                : "bg-gray-50/80 border border-gray-100"
              }`}
          >
            {/* watermark number */}
            <span className={`absolute top-2 right-3 text-5xl font-black leading-none select-none
              ${active ? "text-blue-50" : "text-gray-100"}`}>
              {step}
            </span>

            {/* icon + badge row */}
            <div className="flex items-center justify-between relative z-10">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border
                ${active
                  ? "bg-blue-50 border-blue-200 text-blue-500"
                  : "bg-white border-gray-200 text-gray-400"
                }`}>
                {icon}
              </div>
              {tag && (
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                  {tag}
                </span>
              )}
              {final && (
                <div className="w-7 h-7 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M2 7l3 3 6-6" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>

            {/* text */}
            <div className="relative z-10">
              <p className={`text-sm font-semibold mb-1 ${active ? "text-gray-800" : "text-gray-600"}`}>
                {title}
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
            </div>

            {/* note pill */}
            {note && (
              <span className="self-start text-[11px] text-gray-400 bg-white border border-gray-100 rounded-full px-3 py-1 relative z-10">
                {note}
              </span>
            )}
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400 mt-5">
        Questions? Reach out to your team lead or check your email for onboarding details.
      </p>

    </div>
  </div>
  )
};

export default Placeholder;

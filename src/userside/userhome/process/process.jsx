const steps = [
  {
    num: "01",
    title: "Sign Up",
    img: "/assets/sign-up-animate.svg",
    desc: "Creating an account is the first step to unlocking powerful business solutions. Sign up quickly and gain access to our suite of innovative services tailored to your needs.",
  },
  {
    num: "02",
    title: "Select Your Package",
    img: "/assets/data-extraction-animate.svg",
    desc: "Choose from flexible packages designed to meet your business needs. Scalable solutions that grow with you, ensuring maximum efficiency and return on investment.",
    featured: true,
  },
  {
    num: "03",
    title: "Talk With Your Manager",
    img: "/assets/tel.svg",
    desc: "Our dedicated managers guide you through every step, ensuring your vision is brought to life with precision, clear communication, and expertise.",
  },
];

const Process = () => {
  return (
    <section className="relative py-24 px-6 bg-white overflow-hidden">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: "linear-gradient(90deg,#3b82f6,#60a5fa,#3b82f6)" }} />

      {/* Header */}
      <div className="text-center mb-18">
        <p className="text-xs tracking-[3px] uppercase text-blue-500 font-medium mb-4">How It Works</p>
        <h2 className="font-serif text-4xl md:text-5xl font-semibold text-gray-900 leading-tight max-w-xl mx-auto"
          style={{ fontFamily: "'Playfair Display', serif" }}>
          Connect With Us in{" "}
          <em className="italic text-blue-500">Three Simple Steps</em>
        </h2>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto mt-16">
        {steps.map((step, i) => (
          <div key={i}
            className={`group relative flex flex-col items-center text-center p-9 rounded-3xl border overflow-hidden transition-all duration-300 hover:-translate-y-2 cursor-default ${
              step.featured
                ? "border-blue-500/30 hover:border-blue-500/60 hover:shadow-2xl"
                : "border-gray-200 hover:border-blue-400 hover:shadow-xl bg-gray-50/50 hover:bg-white"
            }`}
            style={step.featured ? { background: "linear-gradient(160deg,#050d1f,#0d1b3e)" } : {}}>

            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-[3px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
              style={{ background: "linear-gradient(90deg,#3b82f6,#60a5fa)" }} />

            {/* Step badge */}
            <div className={`absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border ${
              step.featured
                ? "bg-blue-500/15 border-blue-500/30 text-blue-300"
                : "bg-blue-50 border-blue-100 text-blue-600"
            }`}
              style={{ fontFamily: "'Playfair Display', serif" }}>
              {step.num}
            </div>

            {/* Image */}
            <img src={step.img} alt={step.title}
              className="w-40 h-40 object-contain mb-6 transition-transform duration-400 group-hover:scale-105" />

            {/* Step label */}
            <p className={`text-xs tracking-[2px] uppercase font-medium mb-2 ${step.featured ? "text-blue-400" : "text-blue-500"}`}>
              Step {step.num}
            </p>

            {/* Title */}
            <h3 className={`text-base font-medium mb-3 leading-snug ${step.featured ? "text-blue-50" : "text-gray-900"}`}>
              {step.title}
            </h3>

            {/* Desc */}
            <p className={`text-sm font-light leading-relaxed ${step.featured ? "text-blue-300/60 " : "text-gray-500"}`}>
              {step.desc}
            </p>

            {/* Bottom bar */}
            <div className={`mt-6 h-[2px] w-10 rounded-full transition-all duration-300 group-hover:w-16 ${
              step.featured ? "bg-blue-500/30 group-hover:bg-blue-500" : "bg-blue-200 group-hover:bg-blue-500"
            }`} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Process;
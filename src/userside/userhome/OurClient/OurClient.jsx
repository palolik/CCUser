const OurClient = ({ clientData }) => {
  if (!clientData) {
    return (
      <div className="w-full flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Duplicate for infinite scroll effect
  const doubled = [...clientData, ...clientData];

  return (
    <section className="py-20 bg-white overflow-hidden">

      {/* Header */}
      <div className="text-center mb-14 px-6">
        <p className="text-xs tracking-[3px] uppercase text-blue-500 font-medium mb-4">Trusted By</p>
        <h2 className="font-serif text-4xl md:text-5xl font-semibold text-gray-900 leading-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}>
          Clients Who <em className="italic text-blue-500">Trust Us</em>
        </h2>
      </div>

      {/* Marquee */}
      <div className="relative overflow-hidden">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-28 z-10 pointer-events-none"
          style={{ background: "linear-gradient(90deg,#fff,transparent)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-28 z-10 pointer-events-none"
          style={{ background: "linear-gradient(270deg,#fff,transparent)" }} />

        <div className="flex gap-4 w-max animate-marquee hover:[animation-play-state:paused]">
          {doubled.map((client, idx) => (
            <div key={idx}
              className="group w-44 h-20 flex-shrink-0 flex items-center justify-center px-5 py-3 rounded-2xl border border-gray-100 bg-gray-50 hover:border-blue-200 hover:bg-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default">
              <img
                src={client.logo || "https://placehold.co/100x44/f3f4f6/9ca3af?text=Logo"}
                alt={`Client ${idx + 1}`}
                className="max-w-full max-h-12 object-contain grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
              />
            </div>
          ))}
        </div>
      </div>

  
    </section>
  );
};

export default OurClient;
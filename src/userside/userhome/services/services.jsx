import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { base_url } from "../../../config/config";

const Services = ({ serviceData = [] }) => {
  const [ads, setAds] = useState([]);

  useEffect(() => {
    fetch(`${base_url}/advertise`)
      .then((res) => res.json())
      .then(setAds)
      .catch((err) => console.error("Failed to load ads:", err));
  }, []);

  const sidebarAds = ads.filter(
    (ad) => ad.location?.toLowerCase() === "sidebar" && ad.status?.toLowerCase() === "active"
  );

  const handleAdClick = async (id) => {
    try {
      await fetch(`${base_url}/adclicks/${id}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incrementBy: 1 }),
      });
    } catch (e) { console.error(e); }
  };

  if (!serviceData || serviceData.length === 0) {
    return (
      <div className="w-full flex items-center justify-center py-24 px-6">
        <p className="text-gray-400 font-light text-sm italic">No services available at the moment.</p>
      </div>
    );
  }

  // Sidebar ad component
  const SidebarAds = ({ side }) => (
    <div className={`hidden lg:flex flex-col gap-3 fixed top-1/2 -translate-y-1/2 z-20 ${side === "left" ? "left-2" : "right-2"}`}>
      {sidebarAds.map((ad) => (
        <a key={ad._id + side} href={ad.rdlink} target="_blank" rel="noopener noreferrer"
          onClick={() => handleAdClick(ad._id)}>
          <img src={ad.imglink} alt={ad.rdlink}
            className="w-28 h-[560px] object-cover rounded-2xl shadow-lg hover:shadow-xl transition-shadow" />
        </a>
      ))}
    </div>
  );

  return (
    <section className="relative py-24 px-6 bg-gray-50">

      <SidebarAds side="left" />
      <SidebarAds side="right" />

      {/* Header */}
      <div className="text-center mb-16">
        <p className="text-xs tracking-[3px] uppercase text-blue-500 font-medium mb-4">What We Do</p>
        <h2 className="font-serif text-4xl md:text-5xl font-semibold text-gray-900 leading-tight max-w-2xl mx-auto"
          style={{ fontFamily: "'Playfair Display', serif" }}>
          We Offer a Wide Range of{" "}
          <em className="italic text-blue-500">Online Services</em>
        </h2>
      </div>

      {/* Service rows */}
      <div className="flex flex-col gap-5 max-w-4xl mx-auto">
        {serviceData.map((service, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.55, delay: idx * 0.08 }}
            className={`group flex flex-col bg-white border border-gray-200 rounded-3xl overflow-hidden hover:border-blue-200 hover:shadow-2xl transition-all duration-300 ${
              idx % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"
            }`}
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
          >
            {/* Image */}
            <div className="md:w-[38%] w-full h-56 md:h-auto overflow-hidden relative flex-shrink-0">
              <img src={service.serviceBgImage} alt={service.serviceTitle}
                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "linear-gradient(135deg,rgba(59,130,246,0.12),transparent)" }} />
            </div>

            {/* Content */}
            <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">
              <div className="font-serif text-5xl font-semibold mb-3 leading-none"
                style={{ fontFamily: "'Playfair Display', serif", color: "rgba(59,130,246,0.1)" }}>
                0{idx + 1}
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3 leading-snug group-hover:text-blue-700 transition-colors">
                {service.serviceTitle || "Untitled Service"}
              </h3>
              <p className="text-sm text-gray-500 font-light leading-relaxed">
                {service.serviceDescription}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Services;
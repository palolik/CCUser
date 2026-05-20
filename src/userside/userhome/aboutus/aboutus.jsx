import React from "react";
import Navber from "../../navBer/navber";
import Footer from "../../footer/footer";
import SeoHead from "../../../Seohead";
import { NavLink } from "react-router-dom";
import missionImg from "/assets/tt.svg"; 
import storyImg from "/assets/sss.svg";
import AnimatedNetworkBackground from "../home/animatednetwork";
const stats = [
  { value: "5+", label: "Years Active" },
  { value: "200+", label: "Projects Delivered" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "3", label: "Countries Served" },
];

const values = [
  { title: "Tailored Solutions", desc: "Every business is unique. We craft software solutions perfectly aligned with your specific goals and workflows." },
  { title: "Innovative Technology", desc: "We stay ahead with modern frameworks, cloud-native tools, and scalable platforms built for the future." },
  { title: "End-to-End Service", desc: "From discovery to post-launch support, we ensure your project succeeds at every stage." },
  { title: "Transparent Process", desc: "Clear timelines, honest pricing, and direct communication — always." },
  { title: "Expert Team", desc: "Our developers, designers, and strategists bring deep domain expertise across industries." },
  { title: "Long-Term Partnership", desc: "We don't just build and disappear. We grow with you as your technology partner." },
];

const testimonials = [
  { quote: "Cloud Company transformed our business with their innovative solutions. The team understood our needs perfectly.", name: "Jane Doe", role: "CEO, Startup X", initials: "JD" },
  { quote: "Their expertise in web development helped us launch our e-commerce platform on time with all necessary features.", name: "John Smith", role: "Founder, EcomCo", initials: "JS" },
  { quote: "Professional, communicative, and highly skilled. They delivered beyond our expectations every single time.", name: "Sara Ahmed", role: "CTO, FinTech BD", initials: "SA" },
];

const Aboutus = () => {
  return (
    <div className="w-full font-sans">
      <SeoHead
        title="About Us"
        description="Learn about Cloud Company — a leading software development firm delivering custom web, app, and digital solutions since 2019."
        canonical="/aboutus"
      />
      <Navber />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden"
        style={{ background: "linear-gradient(150deg,#050d1f 0%,#0d1b3e 55%,#091528 100%)" }}>
          <AnimatedNetworkBackground/>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse,rgba(59,130,246,0.15) 0%,transparent 65%)" }} />

        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs tracking-[2.5px] uppercase px-5 py-2 rounded-full mb-8 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
          Est. 2019 · Dhaka, Bangladesh
        </div>

        <h1 className="font-serif text-5xl md:text-7xl font-semibold text-blue-50 leading-[1.1] mb-6 max-w-3xl"
          style={{ fontFamily: "'Playfair Display', serif" }}>
          We Build Software That{" "}
          <em className="not-italic text-blue-400">Moves Businesses Forward</em>
        </h1>

        <p className="text-lg text-blue-300/60 font-light max-w-xl leading-relaxed mb-14">
          Cloud Company is a full-service software firm crafting custom web, mobile, and digital solutions for ambitious businesses worldwide.
        </p>

        <div className="flex flex-wrap justify-center gap-10 md:gap-16">
          {stats.map((s, i) => (
            <React.Fragment key={i}>
              <div className="text-center">
                <strong className="block text-4xl font-serif font-semibold text-blue-50"
                  style={{ fontFamily: "'Playfair Display', serif" }}>{s.value}</strong>
                <span className="text-xs text-blue-900/60 tracking-widest uppercase">{s.label}</span>
              </div>
              {i < stats.length - 1 && <div className="hidden md:block w-px h-12 self-center bg-white/10" />}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ── MISSION ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <p className="text-xs tracking-[3px] uppercase text-blue-500 font-medium mb-4">Our Mission</p>
            <h2 className="font-serif text-4xl font-semibold text-gray-900 leading-snug mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Technology that works as hard as you do
            </h2>
            <p className="text-gray-500 font-light leading-relaxed text-base">
              We empower businesses with innovative software solutions that streamline operations, enhance customer experiences, and foster growth. Every line of code we write is in service of your success.
            </p>
          </div>
          <div className="rounded-3xl h-80 flex items-center justify-center relative overflow-hidden"
            style={{ background: "linear-gradient(135deg,#0d1b3e,#1a3a6e)" }}>
           <img  src={storyImg} />
          </div>
        </div>
      </section>

      {/* ── STORY ── */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="rounded-3xl h-80 flex items-center justify-center relative overflow-hidden"
            style={{ background: "linear-gradient(135deg,#0d1b3e,#1a3a6e)" }}>
           <img  src={missionImg} />
          </div>
          <div>
            <p className="text-xs tracking-[3px] uppercase text-blue-500 font-medium mb-4">Our Story</p>
            <h2 className="font-serif text-4xl font-semibold text-gray-900 leading-snug mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Founded on passion,<br />built on results
            </h2>
            <p className="text-gray-500 font-light leading-relaxed mb-4">
              Founded with a passion for technology, Cloud Company helps businesses navigate the complex digital landscape. Our expert team delivers scalable web and mobile solutions across industries.
            </p>
            <p className="text-gray-500 font-light leading-relaxed">
              From startups to enterprises, we provide tailored solutions that transform operations, improve workflows, and accelerate growth.
            </p>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[3px] uppercase text-blue-500 font-medium mb-4">Why Choose Us</p>
            <h2 className="font-serif text-4xl font-semibold text-gray-900"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              The Cloud Company difference
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <div key={i} className="group relative border border-gray-200 rounded-2xl p-8 bg-gray-50 overflow-hidden hover:border-blue-400 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                <div className="font-serif text-5xl font-semibold mb-5 leading-none"
                  style={{ fontFamily: "'Playfair Display', serif", color: "rgba(59,130,246,0.12)" }}>
                  0{i + 1}
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 font-light leading-relaxed">{v.desc}</p>
                <div className="absolute bottom-0 left-0 h-[3px] w-0 group-hover:w-full transition-all duration-500 rounded-bl-2xl"
                  style={{ background: "linear-gradient(90deg,#3b82f6,#60a5fa)" }} />
              </div>
            ))}
          </div>
        </div>
      </section>

     
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[3px] uppercase text-blue-500 font-medium mb-4">Client Stories</p>
            <h2 className="font-serif text-4xl font-semibold text-gray-900"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Trusted by founders & teams
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-8">
                <div className="font-serif text-5xl text-blue-500 leading-none mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}>"</div>
                <p className="text-sm text-gray-500 font-light italic leading-relaxed mb-6">{t.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 text-center relative overflow-hidden"
        style={{ background: "linear-gradient(150deg,#050d1f 0%,#0d1b3e 60%,#091528 100%)" }}>
          <AnimatedNetworkBackground/>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-72 pointer-events-none"
          style={{ background: "radial-gradient(ellipse,rgba(59,130,246,0.15),transparent 70%)" }} />
        <h2 className="font-serif text-4xl md:text-5xl font-semibold text-blue-50 mb-5 relative"
          style={{ fontFamily: "'Playfair Display', serif" }}>
          Ready to build something great?
        </h2>
        <p className="text-blue-300/60 font-light text-lg max-w-md mx-auto mb-10 relative leading-relaxed">
          Have a project in mind? Let's talk about how Cloud Company can bring your vision to life.
        </p>
        <NavLink to="/contact"
          className="relative inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm px-12 py-4 rounded-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl">
          Start a conversation →
        </NavLink>
      </section>

      <Footer />
    </div>
  );
};

export default Aboutus;
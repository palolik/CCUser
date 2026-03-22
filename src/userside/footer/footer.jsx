import logo from '/assets/logow.png';
import { NavLink } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="hidden md:block"
      style={{ background: "linear-gradient(160deg,#050d1f 0%,#0a1628 60%,#050d1f 100%)", borderTop: "1px solid rgba(59,130,246,0.15)" }}>
      
      <div className="px-12 pt-16 pb-10 grid grid-cols-4 gap-12">
        
        {/* Brand */}
        <div>
          <img className="w-24 lg:w-32" src={logo} alt="Cloud Company" />
          <p className="mt-5 text-xs text-blue-300/80 font-light leading-relaxed max-w-xs">
            We help businesses take proper initiatives to start and grow efficiently — by designing and establishing their online platform and marketing presence.
            <br /><br />
            <span className="text-blue-700/60">Providing reliable tech since 2019.</span>
          </p>
        </div>

        {/* Services */}
        <div>
          <h6 className="text-xs tracking-[2.5px] uppercase text-blue-500 font-medium mb-5">Services</h6>
          {["Graphic Design", "Web Development", "App Development", "Product Design", "Social Media Marketing"].map((s) => (
            <a key={s} className="block text-sm text-blue-300/60 hover:text-blue-100 font-light mb-2.5 transition-colors duration-200 cursor-pointer">{s}</a>
          ))}
        </div>

        {/* Company */}
        <div>
          <h6 className="text-xs tracking-[2.5px] uppercase text-blue-500 font-medium mb-5">Company</h6>
          {[
            { label: "About Us", to: "/aboutus" },
            { label: "Support", to: "/" },
            { label: "Terms & Conditions", to: "/" },
            { label: "Career", to: "/career" },
          ].map(({ label, to }) => (
            <NavLink key={label} to={to} className="block text-sm text-blue-300/60 hover:text-blue-100 font-light mb-2.5 transition-colors duration-200">{label}</NavLink>
          ))}
        </div>

        {/* General */}
        <div>
          <h6 className="text-xs tracking-[2.5px] uppercase text-blue-500 font-medium mb-5">General</h6>
          {[
            { label: "Career", to: "/career" },
            { label: "Affiliate", to: "/" },
            { label: "Our Team", to: "/ourteam" },
            { label: "Employee Login", to: "/employeesignin" },
          ].map(({ label, to }) => (
            <NavLink key={label} to={to} className="block text-sm text-blue-300/60 hover:text-blue-100 font-light mb-2.5 transition-colors duration-200">{label}</NavLink>
          ))}
        </div>

      </div>

      {/* Bottom bar */}
      <div className="mx-12 py-7 border-t flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <p className="text-xs font-light" style={{ color: "#1e3a5f" }}>© 2025 Cloud Company. All rights reserved.</p>
        <div className="flex gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="w-2 h-2 rounded-full" style={{ background: "rgba(59,130,246,0.3)" }} />
          <span className="w-2 h-2 rounded-full" style={{ background: "rgba(59,130,246,0.15)" }} />
        </div>
      </div>

    </footer>
  );
};

export default Footer;
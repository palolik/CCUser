import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navber from "../../navBer/navber";
import Footer from "../../footer/footer";
import { base_url } from "../../../config/config";
import AnimatedNetworkBackground from "../home/animatednetwork";

const HomePortfolio = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeType, setActiveType] = useState("all");
  const [portfolioTypes, setPortfolioTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPortfolios(); }, []);

  const fetchPortfolios = async () => {
    try {
      const res = await fetch(`${base_url}/getportfolio`);
      const data = await res.json();
      const visible = data.filter((i) => i.status === "visible");
      setPortfolios(visible);
      setFiltered(visible);
      setPortfolioTypes([...new Set(visible.map((i) => i.portfolioType))]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleFilter = (type) => {
    setActiveType(type);
    setFiltered(type === "all" ? portfolios : portfolios.filter((i) => i.portfolioType === type));
  };

  const getFileType = (url) => {
    if (!url || typeof url !== "string") return null;
    const ext = url.replace(/\\/g, "/").split("?")[0].split(".").pop().toLowerCase();
    if (ext === "pdf") return "pdf";
    if (["jpg","jpeg","png","gif","webp","svg","bmp"].includes(ext)) return "image";
    try { const p = new URL(url); return p.protocol.startsWith("http") ? "website" : null; }
    catch { return null; }
  };

  const buildDesc = () => portfolioTypes.length === 0
    ? "Explore Cloud Company's portfolio of web development, app development, graphic design, and digital marketing projects."
    : `Browse Cloud Company's work across ${portfolioTypes.map(t => t.replace(/-/g," ")).join(", ")}. ${portfolios.length} projects delivered since 2019.`;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Helmet>
        <title>Portfolio | Cloud Company</title>
        <meta name="description" content={buildDesc()} />
        <link rel="canonical" href="https://cloudcompany.cc/portfolio" />
      </Helmet>

      <Navber />

      
      <section className="relative text-center px-6 py-24 overflow-hidden"
        style={{ background: "linear-gradient(150deg,#050d1f 0%,#0d1b3e 55%,#091528 100%)" }}>
          <AnimatedNetworkBackground/>
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[700px] h-96 pointer-events-none"
          style={{ background: "radial-gradient(ellipse,rgba(59,130,246,0.15) 0%,transparent 65%)" }} />
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs tracking-[2.5px] uppercase px-5 py-2 rounded-full mb-6 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" /> Our Work
        </div>
        <h1 className="font-serif text-5xl md:text-6xl font-semibold text-blue-50 leading-tight mb-4"
          style={{ fontFamily: "'Playfair Display', serif" }}>
          Work We're <em className="italic text-blue-400">Proud Of</em>
        </h1>
        <p className="text-blue-300/60 font-light text-base max-w-md mx-auto leading-relaxed">
          Explore projects we've delivered across web development, design, and digital marketing since 2019.
        </p>
      </section>

      {/* ── FILTER TABS ── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-wrap justify-center gap-2">
          {["all", ...portfolioTypes].map((type) => (
            <button key={type} onClick={() => handleFilter(type)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeType === type
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              }`}>
              {type === "all" ? "All Projects" : type.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* ── GRID ── */}
      <div className="max-w-5xl mx-auto w-full px-6 py-16 flex-1">
        {loading && (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 font-light text-sm">Loading portfolios...</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <Link key={p._id} to={`/portfolio/${p._id}`}
                className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-400 hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 block"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>

                {/* Image */}
                <div className="h-52 overflow-hidden relative bg-gray-100">
                  {getFileType(p.image) === "image" ? (
                    <img src={p.image?.replace(/\\/g, "/")} alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : getFileType(p.image) === "pdf" ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-blue-50">
                      <span className="text-4xl mb-2">📄</span>
                      <p className="text-blue-600 text-sm font-medium">PDF Document</p>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                      <span className="text-4xl">🖼</span>
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Tag */}
                  <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-blue-300 text-xs font-medium px-3 py-1 rounded-full capitalize">
                    {p.portfolioType?.replace(/-/g, " ")}
                  </div>
                </div>

                {/* Body */}
                <div className="p-5">
                  <h2 className="text-base font-medium text-gray-900 group-hover:text-blue-600 transition-colors mb-2 leading-snug">
                    {p.title}
                  </h2>
                  <p className="text-sm text-gray-400 font-light leading-relaxed line-clamp-2 mb-4">
                    {p.shortDetails}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-500 font-medium">View Project</span>
                    <div className="w-7 h-7 rounded-full bg-blue-50 group-hover:bg-blue-500 flex items-center justify-center text-blue-500 group-hover:text-white text-xs transition-all duration-200">
                      →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <h3 className="font-serif text-2xl font-semibold text-gray-700 mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}>No projects found</h3>
            <p className="text-gray-400 font-light">
              {activeType === "all" ? "No portfolios available at the moment." : `No projects in "${activeType.replace(/-/g, " ")}" yet.`}
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default HomePortfolio;
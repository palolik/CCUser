import { useEffect, useState } from "react";
import Navber from "../navBer/navber";
import Footer from "../footer/footer";
import { base_url } from "../../config/config";
import AnimatedNetworkBackground from "../userhome/home/animatednetwork";
import SeoHead from "../../Seohead";

const rankLabels = {
  1: "Leadership",
  2: "Senior Team",
  3: "Core Team",
  4: "Team Members",
  5: "Associates",
};

const getInitials = (name) =>
  name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

const ShimmerCard = () => (
  <div className="bg-white border border-gray-200 rounded-3xl p-8 w-52 text-center">
    <div className="w-24 h-24 rounded-2xl bg-gray-200 animate-pulse mx-auto mb-5" />
    <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4 mx-auto mb-2" />
    <div className="h-2.5 bg-gray-100 rounded animate-pulse w-1/2 mx-auto mb-3" />
    <div className="h-2 bg-gray-100 rounded animate-pulse w-full mx-auto mb-1.5" />
    <div className="h-2 bg-gray-100 rounded animate-pulse w-5/6 mx-auto mb-1.5" />
    <div className="h-2 bg-gray-100 rounded animate-pulse w-4/6 mx-auto" />
  </div>
);

const Team = () => {
  const [team, setTeam] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${base_url}/team`)
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a, b) => a.rank - b.rank);
        const grouped = sorted.reduce((acc, member) => {
          if (!acc[member.rank]) acc[member.rank] = [];
          acc[member.rank].push(member);
          return acc;
        }, {});
        setTeam(grouped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SeoHead
        title="Our Team"
        description="Meet the people behind Cloud Company — the leadership, developers, designers, and marketers building software and digital solutions since 2019."
        canonical="/ourteam"
      />
      <Navber />

      {/* Hero */}
      <section
        className="relative text-center px-6 py-24 overflow-hidden"
        style={{ background: "linear-gradient(150deg,#050d1f 0%,#0d1b3e 55%,#091528 100%)" }}
      ><AnimatedNetworkBackground/>
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-[700px] h-96 pointer-events-none"
          style={{ background: "radial-gradient(ellipse,rgba(59,130,246,0.15) 0%,transparent 65%)" }}
        />
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs tracking-[2.5px] uppercase px-5 py-2 rounded-full mb-6 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
          Cloud Company
        </div>
        <h1
          className="font-serif text-5xl md:text-6xl font-semibold text-blue-50 leading-tight mb-4"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          The People Behind <em className="italic text-blue-400">Our Work</em>
        </h1>
        <p className="text-blue-300/60 font-light text-base max-w-md mx-auto leading-relaxed">
          Meet the talented individuals who bring expertise, creativity, and dedication to every project.
        </p>
      </section>

      {/* Team Grid */}
      <div className="max-w-5xl mx-auto w-full px-6 py-20 flex-1">
        {loading ? (
          <div className="flex flex-wrap justify-center gap-6">
            {Array.from({ length: 6 }).map((_, i) => <ShimmerCard key={i} />)}
          </div>
        ) : (
          Object.keys(team).sort((a, b) => a - b).map((rank) => (
            <div key={rank} className="mb-16">
              {/* Rank divider */}
              <div className="flex items-center gap-4 mb-10">
                <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
                <span className="text-xs tracking-[3px] uppercase text-gray-400 font-medium whitespace-nowrap">
                  {rankLabels[rank] || "Team"}
                </span>
                <div className="flex-1 h-px bg-gradient-to-l from-gray-200 to-transparent" />
              </div>

              <div className="flex flex-wrap justify-center gap-6">
                {team[rank].map((member) => (
                  <div
                    key={member._id}
                    className="group relative bg-white border border-gray-200 rounded-3xl p-8 w-52 text-center overflow-hidden hover:border-blue-400 hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 cursor-default"
                    style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                  >
                    {/* Top accent */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 to-blue-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                    {/* Avatar */}
                    <div className="relative w-24 h-24 mx-auto mb-5">
                      {member.piclink ? (
                        <img
                          src={member.piclink}
                          alt={member.name}
                          className="w-24 h-24 rounded-2xl object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className="w-24 h-24 rounded-2xl items-center justify-center text-white text-2xl font-semibold"
                        style={{
                          background: "linear-gradient(135deg,#3b82f6,#60a5fa)",
                          display: member.piclink ? "none" : "flex",
                          fontFamily: "'Playfair Display', serif",
                        }}
                      >
                        {getInitials(member.name)}
                      </div>
                    </div>

                    <h3 className="text-sm font-medium text-gray-900 mb-1.5 leading-snug">{member.name}</h3>
                    <p className="text-xs text-blue-500 font-medium tracking-wide mb-3">{member.designation}</p>
                    <p className="text-xs text-gray-400 font-light leading-relaxed line-clamp-3">{member.bio}</p>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Team;
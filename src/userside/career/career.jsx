import React, { useEffect, useState } from "react";
import Navber from "../navBer/navber";
import Footer from "../footer/footer";
import Swal from "sweetalert2";
import { base_url } from "../../config/config";
import { X } from "lucide-react";
import { MdOutlineDateRange } from "react-icons/md";
import { FaRegAddressBook } from "react-icons/fa";
import { RiTeamLine } from "react-icons/ri";
import { AiOutlineTeam } from "react-icons/ai";

const processSteps = [
  { icon: <FaRegAddressBook className="text-blue-700 " /> , title: "Apply", desc: "Submit your application and portfolio. We review every application carefully." },
  { icon: <RiTeamLine className="text-blue-700"  /> , title: "Interview", desc: "A friendly conversation to understand your skills, experience, and goals." },
  { icon: <AiOutlineTeam  className="text-blue-700" /> , title: "Join the Team", desc: "Receive your offer and start your journey with Cloud Company!" },
];

const perks = ["Remote Friendly", "Flexible Hours", "Learning Budget", "Growth Culture", "Inclusive Team", "Modern Stack"];

const Career = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", cv: null });

  useEffect(() => {
    fetch(`${base_url}/recruitment`)
      .then((res) => res.json())
      .then(setJobs)
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cv) return Swal.fire("Error", "Please upload your CV.", "error");
    const form = new FormData();
    form.append("name", formData.name);
    form.append("email", formData.email);
    form.append("phone", formData.phone);
    form.append("cv", formData.cv);
    form.append("jobTitle", selectedJob ? selectedJob.title : "Talent Pool");
    if (selectedJob) form.append("jobid", selectedJob._id);
    try {
      const res = await fetch(`${base_url}/applyjob`, { method: "POST", body: form });
      const data = await res.json();
      if (data.insertedId) {
        Swal.fire("Success!", "Your application has been submitted!", "success");
        setShowForm(false);
        setSelectedJob(null);
        setFormData({ name: "", email: "", phone: "", cv: null });
      } else Swal.fire("Error", "Something went wrong.", "error");
    } catch {
      Swal.fire("Error", "Network issue. Try again later.", "error");
    }
  };

  return (
    <div className="w-full font-sans bg-gray-50">
      <Navber />

      {/* ── HERO ── */}
      <section className="relative text-center px-6 py-28 overflow-hidden"
        style={{ background: "linear-gradient(150deg,#050d1f 0%,#0d1b3e 55%,#091528 100%)" }}>
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[700px] h-96 pointer-events-none"
          style={{ background: "radial-gradient(ellipse,rgba(59,130,246,0.15) 0%,transparent 65%)" }} />
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs tracking-[2.5px] uppercase px-5 py-2 rounded-full mb-7 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" /> We're Hiring
        </div>
        <h1 className="font-serif text-5xl md:text-7xl font-semibold text-blue-50 leading-tight mb-5"
          style={{ fontFamily: "'Playfair Display', serif" }}>
          Build the Future <em className="italic text-blue-400">With Us</em>
        </h1>
        <p className="text-lg text-blue-300/60 font-light max-w-xl mx-auto leading-relaxed mb-10">
          Cloud Company is growing fast. If you're passionate about technology, design, or digital innovation — there's a place for you here.
        </p>
        <button onClick={() => document.getElementById("openings")?.scrollIntoView({ behavior: "smooth" })}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm px-10 py-4 rounded-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl">
          View Open Positions →
        </button>
      </section>

      {/* ── JOB LISTINGS ── */}
      <section id="openings" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs tracking-[3px] uppercase text-blue-500 font-medium mb-4">Open Roles</p>
            <h2 className="font-serif text-4xl font-semibold text-gray-900"
              style={{ fontFamily: "'Playfair Display', serif" }}>Current Openings</h2>
          </div>
          {jobs.length === 0 ? (
            <p className="text-center text-gray-400 font-light py-12">No current openings — check back soon or join our talent pool below.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {jobs.map((job, i) => (
                <div key={i} onClick={() => setSelectedJob(job)}
                  className="group relative border border-gray-200 rounded-2xl p-7 bg-gray-50 cursor-pointer overflow-hidden hover:border-blue-400 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 to-blue-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  <span className="inline-block bg-blue-50 text-blue-500 text-xs font-medium px-3 py-1 rounded-full mb-4">{job.department}</span>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{job.title}</h3>
                  <p className="text-sm text-gray-400 mb-5">{job.salary || "Competitive"}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400"><MdOutlineDateRange /> {job.deadline}</span>
                    <div className="w-8 h-8 rounded-full bg-blue-50 group-hover:bg-blue-500 flex items-center justify-center text-blue-500 group-hover:text-white text-sm transition-all duration-200">→</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs tracking-[3px] uppercase text-blue-500 font-medium mb-4">How It Works</p>
            <h2 className="font-serif text-4xl font-semibold text-gray-900"
              style={{ fontFamily: "'Playfair Display', serif" }}>Our Hiring Process</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {processSteps.map((step, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-8">
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-xl mb-5">{step.icon}</div>
                <div className="font-serif text-5xl font-semibold mb-4 leading-none"
                  style={{ fontFamily: "'Playfair Display', serif", color: "rgba(59,130,246,0.12)" }}>0{i + 1}</div>
                <h3 className="text-base font-medium text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 font-light leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="py-24 px-6 text-center relative overflow-hidden"
        style={{ background: "linear-gradient(150deg,#050d1f 0%,#0d1b3e 60%,#091528 100%)" }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-72 pointer-events-none"
          style={{ background: "radial-gradient(ellipse,rgba(59,130,246,0.15),transparent 70%)" }} />
        <p className="text-xs tracking-[3px] uppercase text-blue-500 font-medium mb-4 relative">Why Work With Us</p>
        <h2 className="font-serif text-4xl md:text-5xl font-semibold text-blue-50 mb-4 relative"
          style={{ fontFamily: "'Playfair Display', serif" }}>
          A place where great <em className="italic text-blue-400">work thrives</em>
        </h2>
        <p className="text-blue-300/60 font-light text-base max-w-lg mx-auto leading-relaxed relative">
          We foster a collaborative, innovative environment where creativity thrives and every voice matters.
        </p>
        <div className="flex flex-wrap justify-center gap-3 my-10 relative">
          {perks.map((p) => (
            <span key={p} className="bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-light px-5 py-2 rounded-full">{p}</span>
          ))}
        </div>
        <button onClick={() => { setSelectedJob(null); setShowForm(true); }}
          className="relative bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm px-12 py-4 rounded-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl">
          Join Our Talent Pool →
        </button>
      </section>

      {/* ── JOB DETAIL MODAL ── */}
      {selectedJob && !showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setSelectedJob(null)}>
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button onClick={() => setSelectedJob(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all">
              <X size={14} />
            </button>
            <div className="p-8 border-b border-gray-100">
              <span className="inline-block bg-blue-50 text-blue-500 text-xs font-medium px-3 py-1 rounded-full mb-3">{selectedJob.department}</span>
              <h3 className="font-serif text-3xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}>{selectedJob.title}</h3>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span>💰 {selectedJob.salary || "Competitive"}</span>
                <span>📅 Deadline: {selectedJob.deadline}</span>
                <span>📍 Remote</span>
              </div>
            </div>
            <div className="p-8">
              <p className="text-xs tracking-[2px] uppercase text-gray-400 font-medium mb-3">About the Role</p>
              <div className="text-sm text-gray-600 font-light leading-relaxed mb-6 prose"
                dangerouslySetInnerHTML={{ __html: selectedJob.description }} />
              <p className="text-xs tracking-[2px] uppercase text-gray-400 font-medium mb-3">Requirements</p>
              <div className="text-sm text-gray-600 font-light leading-relaxed mb-8 prose"
                dangerouslySetInnerHTML={{ __html: selectedJob.requirements }} />
              <button onClick={() => setShowForm(true)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-4 rounded-xl transition-all duration-200">
                Apply for this Position →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── APPLICATION FORM MODAL ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && (setShowForm(false), setSelectedJob(null))}>
          <div className="bg-white rounded-3xl w-full max-w-md relative">
            <button onClick={() => { setShowForm(false); setSelectedJob(null); }}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all">
              <X size={14} />
            </button>
            <div className="p-8 border-b border-gray-100">
              <h3 className="font-serif text-2xl font-semibold text-gray-900"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                {selectedJob ? `Apply for ${selectedJob.title}` : "Join Our Talent Pool"}
              </h3>
              <p className="text-sm text-gray-400 font-light mt-1">
                {selectedJob ? `${selectedJob.department} · ${selectedJob.deadline}` : "We'll reach out when a suitable role opens up"}
              </p>
            </div>
            <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-4">
              {[
                { label: "Full Name", name: "name", type: "text", placeholder: "Your full name" },
                { label: "Email Address", name: "email", type: "email", placeholder: "your@email.com" },
                { label: "Phone Number", name: "phone", type: "tel", placeholder: "+880 1700 000000" },
              ].map((f) => (
                <div key={f.name}>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{f.label}</label>
                  <input name={f.name} type={f.type} placeholder={f.placeholder} required
                    value={formData[f.name]} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-400 transition-colors" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Upload CV (PDF)</label>
                <input name="cv" type="file" accept=".pdf" onChange={handleChange} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 outline-none focus:border-blue-400 transition-colors" />
              </div>
              <button type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3.5 rounded-xl mt-2 transition-all duration-200">
                Submit Application
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Career;
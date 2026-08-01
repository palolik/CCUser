import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SeoHead from '../../../Seohead';
import Footer from '../../footer/footer';
import Navber from '../../navBer/navber';
import { base_url } from '../../../config/config';

const PortfolioDetails = () => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${base_url}/getportfolio/${id}`)
      .then((res) => { if (!res.ok) throw new Error('Failed to fetch'); return res.json(); })
      .then(setPortfolioData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const isPDF = (url) => url?.toLowerCase().endsWith('.pdf');

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

  if (loading) return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-screen text-red-500 text-sm font-light">Error: {error}</div>
  );

  const p = portfolioData;

  return (
    <>
      <SeoHead
        title={p?.title || 'Portfolio'}
        description={p?.shortDetails || 'View this portfolio project by Cloud Company.'}
        canonical={`/portfolio/${p?._id || ''}`}
        ogImage={p?.image && !isPDF(p.image) ? p.image : undefined}
        ogType="article"
      />

      <Navber />

      {/* ── HERO ── */}
      <section className="relative px-6 py-16 overflow-hidden"
        style={{ background: "linear-gradient(150deg,#050d1f 0%,#0d1b3e 55%,#091528 100%)" }}>
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[700px] h-80 pointer-events-none"
          style={{ background: "radial-gradient(ellipse,rgba(59,130,246,0.15) 0%,transparent 65%)" }} />

        <div className="max-w-3xl mx-auto relative">
          <button onClick={() => navigate('/portfolio')}
            className="inline-flex items-center gap-2 text-blue-300/80 hover:text-blue-300 text-sm font-light mb-8 transition-colors">
            ← Back to Portfolio
          </button>

       
          

          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-blue-50 leading-tight mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            {p?.title}
          </h1>

          <div className="flex flex-wrap gap-5">
            {p?.createdAt && (
              <div className="flex items-center gap-2 text-sm text-blue-900/60 font-light">
                 <span className="text-blue-300/80">{formatDate(p.createdAt)}</span>
              </div>
            )}
            {p?.portfolioType && (
              <div className="flex items-center gap-2 text-sm text-blue-900/60 font-light">
                 <span className="text-blue-300/80 capitalize">{p.portfolioType.replace(/-/g, ' ')}</span>
              </div>
            )}
           
          </div>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <div className="max-w-3xl mx-auto px-6 pb-20 -mt-10 relative z-10">

        {/* Media */}
        {p && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6"
            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
            {p.image ? (
              isPDF(p.image) ? (
                <div className="p-4">
                  <object data={`${p.image}#toolbar=0&navpanes=0`} type="application/pdf"
                    className="w-full rounded-xl" style={{ height: '520px' }}>
                    <p className="text-center text-gray-400 py-10 text-sm">PDF preview not supported in your browser.</p>
                  </object>
                </div>
              ) : (
                <img src={p.image} alt={p.title}
                  className="w-full max-h-[480px] object-cover hover:scale-[1.02] transition-transform duration-500" />
              )
            ) : (
              <div className="h-64 flex flex-col items-center justify-center bg-blue-50 text-gray-400 gap-3">
                <span className="text-4xl">🖼</span>
                <span className="text-sm font-light">No media available</span>
              </div>
            )}
          </div>
        )}

        {/* Info grid */}
        {p && (
          <div className=" gap-5">

            {/* Main card */}
            <div className="md:col-span-2 bg-white border border-gray-200 rounded-2xl p-7">
              <h2 className="font-serif text-xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}>About this Project</h2>

              {p.shortDetails && (
                <p className="text-sm text-gray-500 font-light leading-relaxed">{p.shortDetails}</p>
              )}
          

              {p.createdAt && (
                <div>
                  <p className="text-xs tracking-[2px] uppercase text-gray-400 font-medium mb-1.5">Published</p>
                  <p className="text-sm text-gray-700">{formatDate(p.createdAt)}</p>
                </div>
              )}


              {p.link && (
                <>
                  <div className="h-px bg-gray-100 my-6" />
                  <a href={p.link.startsWith('http') ? p.link : `https://${p.link}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 hover:bg-blue-100 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors break-all">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 3h7m0 0v7m0-7L10 14M5 5H3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-2" />
                    </svg>
                    Live Link
                  </a>
                </>
              )}

            
            </div>

            

          </div>
        )}

        {!p && !loading && (
          <p className="text-center text-gray-400 font-light mt-20">No portfolio data available.</p>
        )}
      </div>

      <Footer />
    </>
  );
};

export default PortfolioDetails;
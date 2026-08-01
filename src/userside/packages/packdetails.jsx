import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from '../footer/footer';
import Navber from '../navBer/navber';
import SeoHead from '../../Seohead';
import cover from "/assets/packco.svg";
import { base_url } from '../../config/config';
import Comments from '../Comments/comments';

const stripHtmlToDescription = (html, maxLength = 160) => {
  if (!html) return '';
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
};

const PackDetails = () => {
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${base_url}/packdetails/${id}`);
        if (!response.ok) throw new Error('Failed to fetch package data');
        const data = await response.json();
        setPackageData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    checkLoginStatus();
  }, [id]);

  const checkLoginStatus = () => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
  };

  const handlePurchaseClick = () => {
    if (isLoggedIn) {
      navigate('/requireddetails', {
        state: {
          packageId: packageData.package._id,
          packageName: packageData.package.packageName,
          contents: packageData.package.packageContents,
          packagePrice: packageData.package.packagePrice,
          dtime: packageData.package.deliveryTime,
          edtime: packageData.package.expressDeliveryTime,
          edprice: packageData.package.expressDeliveryPrice,
        },
      });
    } else {
      toast.error('Please log in first to make a purchase!');
    }
  };

  if (loading)
    return (
      <div className="w-full h-screen flex justify-center items-center bg-slate-50">
        <img src="/assets/iconsvg.svg" alt="Loading..." className="w-14 h-14 animate-spin" />
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-screen text-red-500 font-medium">
        Error: {error}
      </div>
    );

  const pkg = packageData?.package;

  const metaDescription = pkg
    ? stripHtmlToDescription(pkg.packageDetails) ||
      `${pkg.packageName} — delivered in ${pkg.deliveryTime} days by Cloud Company.`
    : undefined;

  const productJsonLd = pkg
    ? {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: pkg.packageName,
        description: metaDescription,
        provider: { '@type': 'Organization', name: 'Cloud Company' },
        offers: {
          '@type': 'Offer',
          price: pkg.packagePrice,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
      }
    : undefined;

  return (
    <>
      {pkg && (
        <SeoHead
          title={pkg.packageName}
          description={metaDescription}
          canonical={`/packdetails/${id}`}
          ogImage={pkg.packageCover || undefined}
          jsonLd={productJsonLd}
        />
      )}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        .pack-root { font-family: 'DM Sans', sans-serif; }
        .pack-title { font-family: 'Playfair Display', serif; }
        .fade-in { animation: fadeUp 0.5s ease both; }
        .fade-in-1 { animation-delay: 0.05s; }
        .fade-in-2 { animation-delay: 0.12s; }
        .fade-in-3 { animation-delay: 0.2s; }
        .fade-in-4 { animation-delay: 0.28s; }
        .fade-in-5 { animation-delay: 0.36s; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .price-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(15,23,42,0.10); }
        .price-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .purchase-btn { background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%); transition: all 0.2s ease; }
        .purchase-btn:hover { background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(37,99,235,0.35); }
        .star-filled { color: #f59e0b; }
        .star-empty { color: #e2e8f0; }
        .divider { height: 1px; background: linear-gradient(90deg, transparent, #e2e8f0, transparent); }
      `}</style>

      <Navber />

      <div className="pack-root min-h-screen bg-slate-50">

        {packageData && pkg ? (
          <>
            {/* ── Hero Cover ── */}
            <div className="w-full h-48 sm:h-64 md:h-96 overflow-hidden relative fade-in">
              <img
                src={pkg.packageCover === '' ? pkg.packageCover : cover}
                className="w-full h-full object-cover"
                alt={pkg.packageName}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 px-3 sm:px-6 md:px-16 pb-4 sm:pb-6 md:pb-8">
                <span className="inline-block text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-blue-300 mb-1 sm:mb-2">
                  Service Package
                </span>
                <h1 className="pack-title text-xl sm:text-3xl md:text-5xl font-bold text-white leading-tight">
                  {pkg.packageName}
                </h1>
              </div>
            </div>

            {/* ── Main Content ── */}
            <div className="max-w-5xl mx-auto px-3 sm:px-5 md:px-8 py-4 sm:py-6 md:py-10 space-y-4 sm:space-y-6 md:space-y-10">

              {/* ── Pricing ── */}
              <section className="fade-in fade-in-1">
                <p className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-slate-400 mb-2 sm:mb-4">Available plans</p>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
                  {/* Regular */}
                  <div className="price-card bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-5 md:p-6 flex flex-col gap-1">
                    <span className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-slate-400">Regular</span>
                    <div className="flex items-end gap-1 mt-1 sm:mt-2">
                      <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800">${pkg.packagePrice}</span>
                    </div>
                    <div className="divider my-2 sm:my-3" />
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-500 flex-wrap">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Delivery in <span className="font-semibold text-slate-700">{pkg.deliveryTime} days</span></span>
                    </div>
                  </div>

                  {/* Express */}
                  <div className="price-card  rounded-xl sm:rounded-2xl p-3 sm:p-5 md:p-6 flex flex-col gap-1 relative overflow-hidden" style={{
    background:
      "linear-gradient(150deg,#050d1f 0%,#0d1b3e 55%,#091528 100%)",
  }}>
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-blue-500/40 text-white text-[8px] sm:text-[10px] font-bold tracking-widest uppercase px-1.5 sm:px-2 py-0.5 rounded-full">
                      Fast Track
                    </div>
                    <span className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-blue-200">Express</span>
                    <div className="flex items-end gap-1 mt-1 sm:mt-2">
                      <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">${Number(pkg.expressDeliveryPrice) + Number(pkg.packagePrice)}</span>
                    </div>
                    <div className="h-px bg-blue-500/50 my-2 sm:my-3" />
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-blue-100 flex-wrap">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-200 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Delivery in <span className="font-semibold text-white">{pkg.expressDeliveryTime} days</span></span>
                    </div>
                  </div>
                </div>
              </section>

              {/* ── Package Details ── */}
              <section className="fade-in fade-in-2 bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
                <p className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-slate-400 mb-3 sm:mb-4">Package Details</p>
                <div
                  className="prose prose-slate prose-sm sm:prose max-w-none text-slate-700 leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 sm:[&>ul]:pl-6 [&>ol]:list-decimal [&>ol]:pl-5 sm:[&>ol]:pl-6"
                  dangerouslySetInnerHTML={{ __html: pkg.packageDetails }}
                />
              </section>

              {/* ── Deliverables ── */}
              <section className="fade-in fade-in-3 bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
                <p className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-slate-400 mb-3 sm:mb-4">What You'll Get</p>
                <ul className="space-y-2 sm:space-y-3">
                  {pkg.packageContents
                    .filter((c) => c && c.trim() !== '')
                    .map((content, index) => (
                      <li key={index} className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-slate-700">
                        <span className="mt-0.5 sm:mt-1 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        {content}
                      </li>
                    ))}
                </ul>
              </section>

              {/* ── Requirements ── */}
              <section className="fade-in fade-in-3 bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
                <p className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-slate-400 mb-3 sm:mb-4">Requirements</p>
                <div
                  className="prose prose-slate prose-sm sm:prose max-w-none text-slate-700 leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 sm:[&>ul]:pl-6 [&>ol]:list-decimal [&>ol]:pl-5 sm:[&>ol]:pl-6"
                  dangerouslySetInnerHTML={{ __html: pkg.packageRequirements }}
                />
              </section>

              {/* ── Reviews ── */}
              {packageData.feedbacks && packageData.feedbacks.length > 0 && (
                <section className="fade-in fade-in-4 bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
                  <p className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-slate-400 mb-1">Client Reviews</p>
                  <div className="flex items-center gap-2 mb-4 sm:mb-6">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const avg = packageData.feedbacks.reduce((a, b) => a + b.rating, 0) / packageData.feedbacks.length;
                        return <span key={i} className={`text-base sm:text-lg ${i < Math.round(avg) ? 'star-filled' : 'star-empty'}`}>★</span>;
                      })}
                    </div>
                    <span className="text-xs sm:text-sm text-slate-500">
                      {packageData.feedbacks.length} review{packageData.feedbacks.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {packageData.feedbacks.map((feedback) => (
                      <div key={feedback._id} className="pb-4 sm:pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <img
                            src={feedback.cdp}
                            alt={feedback.cname}
                            loading="lazy"
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-slate-100 flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-800 text-xs sm:text-sm truncate">{feedback.cname}</p>
                            <p className="text-[10px] sm:text-xs text-slate-400">
                              {new Date(feedback.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          </div>
                          <div className="flex flex-shrink-0">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={`text-xs sm:text-sm ${i < feedback.rating ? 'star-filled' : 'star-empty'}`}>★</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed pl-10 sm:pl-[52px]">"{feedback.tfeedback}"</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── Comments ── */}
              <section className="fade-in fade-in-5">
                <Comments productId={id} />
              </section>

              {/* ── CTA ── */}
              <div className="fade-in fade-in-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 bg-slate-900 rounded-xl sm:rounded-2xl px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6">
                <div>
                  <p className="pack-title text-white text-lg sm:text-xl font-semibold">Ready to get started?</p>
                  <p className="text-slate-400 text-xs sm:text-sm mt-0.5">Choose a plan above and place your order today.</p>
                </div>
                <button
                  onClick={handlePurchaseClick}
                  className="purchase-btn text-white font-semibold px-5 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm whitespace-nowrap w-full sm:w-auto text-center"
                >
                  Purchase Now →
                </button>
              </div>

            </div>
          </>
        ) : (
          <p className="text-center text-slate-400 pt-40">No package data available.</p>
        )}

        <ToastContainer />
      </div>

      <Footer />
    </>
  );
};

export default PackDetails;
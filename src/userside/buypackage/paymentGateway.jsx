import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { base_url } from "../../config/config";
import Navber from '../navBer/navber';
import Footer from '../footer/footer';
import SeoHead from '../../Seohead';

const generateRefCode = () => {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits  = "123456789";
  const l1 = letters[Math.floor(Math.random() * letters.length)];
  const l2 = letters[Math.floor(Math.random() * letters.length)];
  const nums = Array.from({ length: 4 }, () => digits[Math.floor(Math.random() * digits.length)]).join("");
  return `${l1}${l2}${nums}`;
};

const PaymentGateway = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(null);

  const refCode = useRef(generateRefCode()).current;
  const { orderId, orderSummary ,userId , orderType } = state || {};

  useEffect(() => {
    if (!orderId) { navigate("/"); return; }
    fetch(`${base_url}/payment`)
      .then(r => r.json())
      .then(data => {
        setPaymentMethods(data);
        if (data.length > 0) setSelectedMethod(data[0]);
      })
      .catch(err => console.error("Error fetching payment methods:", err));
  }, []);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };
console.log(userId);
const handleConfirmPayment = async () => {
  if (!selectedMethod) { setError("Please select a payment method."); return; }
  if (!transactionId.trim()) { setError("Please enter your transaction ID."); return; }
  setError("");
  setLoading(true);
  try {
    const endpoint = orderType === 'custom'
      ? `${base_url}/updatecustomorderpayment/${orderId}`
      : `${base_url}/updateorderpayment/${orderId}`;

    const res = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentMethod: selectedMethod.method,
        paymentNumber: selectedMethod.number,
        referenceCode: refCode,
        transactionId: transactionId.trim(),
        paymentStatus: "Pending Verification",
      }),
    });
    const data = await res.json();
    if (data.success) navigate(`/clientprofile/${userId}`);
    else setError("Failed to update payment. Please try again.");
  } catch (err) {
    setError("Server error. Please try again.");
  } finally {
    setLoading(false);
  }
};

  if (!orderId) return null;

  return (
    <>
      <SeoHead title="Complete Your Order" noIndex />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        .pay-root { font-family: 'DM Sans', sans-serif; }
        .pay-title { font-family: 'Playfair Display', serif; }
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
        .pay-btn { background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%); transition: all 0.2s ease; }
        .pay-btn:hover:not(:disabled) { background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(37,99,235,0.35); }
        .divider { height: 1px; background: linear-gradient(90deg, transparent, #e2e8f0, transparent); }
        .method-card { transition: all 0.2s ease; }
        .ref-char { transition: transform 0.15s ease; }
        .ref-char:hover { transform: translateY(-2px); }
      `}</style>

      <Navber />

      <div className="pay-root min-h-screen bg-slate-50">

        {/* ── Hero Banner ── */}
        <div className="w-full bg-slate-900 relative overflow-hidden fade-in">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 60%), radial-gradient(circle at 80% 50%, #1d4ed8 0%, transparent 60%)' }}
          />
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-center">
            <span className="inline-block text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-blue-400 mb-2">
              Secure Checkout
            </span>
            <h1 className="pay-title text-2xl sm:text-4xl font-bold text-white">Complete Your Order</h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">Your payment is secured and encrypted</p>

            <div className="flex items-center justify-center gap-4 mt-4">
              {['Fill Details', 'Review Order', 'Pay'].map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 2 ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                    {i + 1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${i === 2 ? 'text-white' : 'text-slate-500'}`}>{step}</span>
                  {i < 2 && <div className="w-6 h-px bg-slate-700 mx-1" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="max-w-3xl mx-auto px-3 sm:px-5 md:px-8 py-4 sm:py-6 md:py-10 space-y-4 sm:space-y-5">

          {/* ── Order Summary ── */}
          {orderSummary && (
            <section className="fade-in fade-in-1 bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <p className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-slate-400 mb-4">Order Summary</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Subtotal</p>
                  <p className="text-slate-800 font-bold text-base sm:text-lg">${orderSummary.subtotal?.toFixed(2)}</p>
                </div>
             \
                {orderSummary.discount > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Discount</p>
                    <p className="text-emerald-600 font-bold text-base sm:text-lg">− ${orderSummary.discount?.toFixed(2)}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Total</p>
                  <p className="text-blue-600 font-black text-xl sm:text-2xl">${orderSummary.totalPrice?.toFixed(2)}</p>
                </div>
              </div>
            </section>
          )}

          {/* ── Reference Code ── */}
          <section className="fade-in fade-in-2 bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <div className="flex items-start justify-between gap-3 mb-1">
              <div>
                <p className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-slate-400">Reference Code</p>
                <p className="text-slate-800 font-semibold text-sm mt-0.5">Include this when sending your payment</p>
              </div>
              <button
                onClick={() => handleCopy(refCode, "ref")}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all flex-shrink-0 ${
                  copied === "ref"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-600"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                {copied === "ref" ? (
                  <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>Copied!</>
                ) : (
                  <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>Copy</>
                )}
              </button>
            </div>

            <div className="flex gap-1.5 sm:gap-2 mt-4 flex-wrap">
              {refCode.split("").map((char, i) => (
                <span
                  key={i}
                  className="ref-char w-9 h-10 sm:w-10 sm:h-11 bg-slate-50 border-2 border-slate-200 rounded-xl flex items-center justify-center text-slate-800 font-black text-base sm:text-lg select-none"
                >
                  {char}
                </span>
              ))}
            </div>
            <p className="text-slate-400 text-xs mt-3 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              Add this code as a note/reference when making the payment
            </p>
          </section>

          {/* ── Payment Methods ── */}
          <section className="fade-in fade-in-3 bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <p className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-slate-400 mb-4">Select Payment Method</p>
            <div className="flex flex-col gap-2 sm:gap-3">
              {paymentMethods.map((method) => {
                const isSelected = selectedMethod?._id === method._id;
                return (
                  <button
                    key={method._id}
                    onClick={() => setSelectedMethod(method)}
                    className={`method-card w-full text-left rounded-xl border-2 px-4 py-3.5 ${
                      isSelected
                        ? "border-blue-400 bg-blue-50"
                        : "border-slate-200 hover:border-blue-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Radio dot */}
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                          isSelected ? "border-blue-500" : "border-slate-300"
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-semibold ${isSelected ? "text-blue-700" : "text-slate-800"}`}>
                            {method.method}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-xs text-slate-500">{method.number}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleCopy(method.number, method._id); }}
                              className={`text-[10px] font-semibold transition ${
                                copied === method._id ? "text-emerald-500" : "text-slate-400 hover:text-blue-500"
                              }`}
                            >
                              {copied === method._id ? "✓ copied" : "copy"}
                            </button>
                          </div>
                          {method.extradetails && (
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{method.extradetails}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── Transaction ID ── */}
          <section className="fade-in fade-in-4 bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <p className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-slate-400 mb-1">Transaction ID</p>
            <p className="text-slate-600 text-sm mb-4">Paste the TrxID from your payment app after sending the money</p>
            <input
              type="text"
              value={transactionId}
              onChange={e => { setTransactionId(e.target.value); setError(""); }}
              placeholder="e.g. TXN8A29F3K1"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all font-mono"
            />
          </section>

          {/* ── Error ── */}
          {error && (
            <div className="fade-in bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2 text-red-600 text-sm">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {error}
            </div>
          )}

          {/* ── CTA ── */}
          <div className="fade-in fade-in-5 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-4 sm:py-5">
            <div>
              <p className="pay-title text-white text-base sm:text-lg font-semibold">Ready to confirm?</p>
              <p className="text-slate-400 text-xs mt-0.5">Verified within 24 hours by our team.</p>
            </div>
            <button
              onClick={handleConfirmPayment}
              disabled={loading}
              className="pay-btn disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none text-white font-semibold px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl text-sm whitespace-nowrap w-full sm:w-auto text-center flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Processing…
                </>
              ) : (
                'Confirm Payment →'
              )}
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 py-2 pb-4">
            {[
              { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', label: 'Secure' },
              { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: 'Protected' },
              { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', label: '24hr Verify' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
                </svg>
                <span className="text-[11px] font-medium">{label}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
};

export default PaymentGateway;
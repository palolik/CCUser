import { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navber from '../navBer/navber';
import Footer from '../footer/footer';
import { AuthContext } from './../Provider/AuthProvider';
import Swal from "sweetalert2";
import RichTextEditor from '../utils/PichTextEditor';
import cover from "/assets/packco.svg";
import { base_url } from '../../config/config';
import { GiDiceSixFacesFive } from 'react-icons/gi';
import SeoHead from '../../Seohead';

const Requireddetails = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { packageId } = location.state || {};
  const [uploadStatus, setUploadStatus] = useState('');
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({ projectTitle: '', projectBrief: '' });
  const [showBill, setShowBill] = useState(false);
  const [isExpress, setIsExpress] = useState(false);
  const [packageData, setPackageData] = useState({});
  const [couponData, setCouponData] = useState([]);
  const [enteredCoupon, setEnteredCoupon] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState(null);
  const [couponStatus, setCouponStatus] = useState(null); // 'valid' | 'invalid' | null

  useEffect(() => {
    if (!packageId) return;
    fetch(`${base_url}/packages/${packageId}`)
      .then(r => r.json())
      .then(data => {
        setPackageData(data.package);
        setCouponData(data.coupons);
      })
      .catch(console.error);
  }, [packageId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFiles(prev => [...prev, ...Array.from(e.target.files)]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePayment = async () => {
    const form = new FormData();
    form.append('packageId', packageData._id);
    form.append('projectTitle', formData.projectTitle);
    form.append('projectBrief', formData.projectBrief);
    form.append('packageName', packageData.packageName);
    const formattedContents = packageData.packageContents.map((item, i) => ({ id: i + 1, name: item, isDone: false }));
    form.append('packageContents', JSON.stringify(formattedContents));
    form.append('packageRequirements', packageData.packageRequirements || '');
    const basePrice = isExpress
      ? parseFloat(packageData.packagePrice) + parseFloat(packageData.expressDeliveryPrice)
      : parseFloat(packageData.packagePrice);
    let finalPrice = basePrice;
    if (enteredCoupon) {
      const coupon = couponData.find(c => c.couponcode === enteredCoupon);
      if (coupon) finalPrice = basePrice - (basePrice * coupon.discount) / 100;
    }
    form.append('sellPrice', finalPrice.toFixed(2));
    form.append('coupon', enteredCoupon);
    form.append('time', isExpress ? packageData.expressDeliveryTime : packageData.deliveryTime);
    form.append('buyerid', user?.userId);
    form.append('buyername', user?.rname);
    form.append('bdp', user?.rppic);
    form.append('email', user?.email);
    form.append('country', user?.country);
    files.forEach(file => form.append('mainPics', file, file.name));
    try {
      const response = await fetch(`${base_url}/buypackage`, { method: 'POST', body: form });
      const data = await response.json();
      if (response.ok && data.result?.insertedId) {
        navigate('/paymentgateway', {
          state: {
            orderId: data.result.insertedId,
            userId: user?.userId,
            orderSummary: {
              subtotal: parseFloat(packageData.packagePrice),
              discount: discountedPrice !== null ? totalPrice - discountedPrice : 0,
              totalPrice: netTotal,
            },
          },
        });
      } else {
        setUploadStatus('Error processing your order. Please try again.');
      }
    } catch (error) {
      setUploadStatus('Error uploading files and details');
    }
  };
 const handleLatePayment = async () => {
    const form = new FormData();
    form.append('packageId', packageData._id);
    form.append('projectTitle', formData.projectTitle);
    form.append('projectBrief', formData.projectBrief);
    form.append('packageName', packageData.packageName);
    const formattedContents = packageData.packageContents.map((item, i) => ({ id: i + 1, name: item, isDone: false }));
    form.append('packageContents', JSON.stringify(formattedContents));
    form.append('packageRequirements', packageData.packageRequirements || '');
    const basePrice = isExpress
      ? parseFloat(packageData.packagePrice) + parseFloat(packageData.expressDeliveryPrice)
      : parseFloat(packageData.packagePrice);
    let finalPrice = basePrice;
    if (enteredCoupon) {
      const coupon = couponData.find(c => c.couponcode === enteredCoupon);
      if (coupon) finalPrice = basePrice - (basePrice * coupon.discount) / 100;
    }
    form.append('sellPrice', finalPrice.toFixed(2));
    form.append('coupon', enteredCoupon);
    form.append('time', isExpress ? packageData.expressDeliveryTime : packageData.deliveryTime);
    form.append('buyerid', user?.userId);
    form.append('buyername', user?.rname);
    form.append('bdp', user?.rppic);
    form.append('email', user?.email);
    form.append('country', user?.country);
    files.forEach(file => form.append('mainPics', file, file.name));

    try {
      const response = await fetch(`${base_url}/buypackage`, { method: 'POST', body: form });
      const data = await response.json();
      if (response.ok && data.result?.insertedId) {
            
      navigate(`/clientprofile/${user?.userId}`);
       
      } else {
        setUploadStatus('Error processing your order. Please try again.');
      }
    } catch (error) {
      setUploadStatus('Error uploading files and details');
    }
  };
  const handleCouponApply = () => {
    const coupon = couponData.find(c => c.couponcode === enteredCoupon);
    if (coupon) {
      const base = isExpress
        ? parseFloat(packageData.packagePrice) + parseFloat(packageData.expressDeliveryPrice)
        : parseFloat(packageData.packagePrice);
      setDiscountedPrice(base - (base * coupon.discount) / 100);
      setCouponStatus({ type: 'valid', discount: coupon.discount });
    } else {
      setDiscountedPrice(null);
      setCouponStatus({ type: 'invalid' });
    }
  };

  const totalPrice = isExpress
    ? parseFloat(packageData.packagePrice || 0) + parseFloat(packageData.expressDeliveryPrice || 0)
    : parseFloat(packageData.packagePrice || 0);

  const netTotal = discountedPrice !== null ? discountedPrice : totalPrice;

  const isFormComplete =
    formData.projectTitle.trim() !== '' &&
    formData.projectBrief.trim() !== '' &&
    Array.isArray(packageData.packageContents) &&
    packageData.packageContents.length > 0 &&
    files.length > 0;

  const { packageCover, packageName, packageContents, packageRequirements,
    deliveryTime, packagePrice, expressDeliveryTime, expressDeliveryPrice } = packageData;

  return (
    <>
      <SeoHead title={packageName ? `Order Details — ${packageName}` : 'Order Details'} noIndex />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        .req-root { font-family: 'DM Sans', sans-serif; }
        .req-title { font-family: 'Playfair Display', serif; }
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
        .price-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .price-card:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(15,23,42,0.09); }
        .pay-btn { background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%); transition: all 0.2s ease; }
       .pay-lbtn { background: white; border: 2px solid #3b82f6; transition: all 0.2s ease; }

        .pay-btn:hover:not(:disabled) { background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(37,99,235,0.35); }
        .divider { height: 1px; background: linear-gradient(90deg, transparent, #e2e8f0, transparent); }
        .bill-row { display: flex; justify-content: space-between; align-items: center; }
      `}</style>

      <Navber />

      <div className="req-root min-h-screen bg-slate-50">

        {/* ── Hero ── */}
        <div className="w-full h-48 sm:h-64 md:h-80 overflow-hidden relative fade-in">
          <img
            src={packageCover === '' ? packageCover : cover}
            alt={packageName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-3 sm:px-6 md:px-16 pb-4 sm:pb-6 md:pb-8">
            <span className="inline-block text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-blue-300 mb-1 sm:mb-2">
              Order Details
            </span>
            <h1 className="req-title text-xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
              {packageName || 'Package Order'}
            </h1>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="max-w-6xl mx-auto px-3 sm:px-5 md:px-8 py-4 sm:py-6 md:py-10">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8 items-start">

            {/* ══ LEFT: Form ══ */}
            <div className="w-full lg:w-2/3 space-y-4 sm:space-y-5 md:space-y-6">

              {/* Pricing */}
              <section className="fade-in fade-in-1">
                <p className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-slate-400 mb-2 sm:mb-3">Available Plans</p>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {/* Regular */}
                  <div className="price-card bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-5 flex flex-col gap-1">
                    <span className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-slate-400">Regular</span>
                    <div className="flex items-end gap-1 mt-1">
                      <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800">${packagePrice}</span>
                    </div>
                    <div className="divider my-2" />
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 flex-wrap">
                      <svg className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Delivery in <span className="font-semibold text-slate-700">{deliveryTime} days</span></span>
                    </div>
                  </div>

                  {/* Express */}
                  <div className="price-card  rounded-xl sm:rounded-2xl p-3 sm:p-5 flex flex-col gap-1 relative overflow-hidden" style={{
    background:
      "linear-gradient(150deg,#050d1f 0%,#0d1b3e 55%,#091528 100%)",
  }}>
                    <div className="absolute top-2 right-2 bg-blue-500/40 text-white text-[8px] sm:text-[10px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-full">Fast Track</div>
                    <span className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-blue-200">Express</span>
                    <div className="flex items-end gap-1 mt-1">
                      <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">${Number(expressDeliveryPrice) + Number(packagePrice)}</span>
                    </div>
                    <div className="h-px bg-blue-500/50 my-2" />
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-blue-100 flex-wrap">
                      <svg className="w-3.5 h-3.5 text-blue-200 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Delivery in <span className="font-semibold text-white">{expressDeliveryTime} days</span></span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Deliverables */}
              <section className="fade-in fade-in-2 bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <p className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-slate-400 mb-3">What You'll Get</p>
                <ul className="space-y-2">
                  {(packageContents || []).filter(c => c?.trim()).map((content, i) => (
                    <li key={i} className="flex items-start gap-2 sm:gap-3 text-sm text-slate-700">
                      <span className="mt-0.5 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      {content}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Requirements */}
              <section className="fade-in fade-in-2 bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <p className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-slate-400 mb-3">Required Attachments & Details</p>
                <div
                  className="prose prose-sm sm:prose prose-slate max-w-none text-slate-700 leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5"
                  dangerouslySetInnerHTML={{ __html: packageRequirements }}
                />
              </section>

              {/* Project Title */}
              <section className="fade-in fade-in-3 bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <p className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-slate-400 mb-3">Project Title <span className="text-red-400">*</span></p>
                <input
                  type="text"
                  name="projectTitle"
                  value={formData.projectTitle}
                  onChange={handleInputChange}
                  placeholder="e.g. My Awesome Project"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                  required
                />
              </section>

              {/* Project Brief */}
              <section className="fade-in fade-in-3 bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <p className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-slate-400 mb-3">Project Brief <span className="text-red-400">*</span></p>
                <RichTextEditor
                  name="projectBrief"
                  value={formData.projectBrief}
                  onChange={value => setFormData(prev => ({ ...prev, projectBrief: value }))}
                />
              </section>

              {/* File Upload */}
              <section className="fade-in fade-in-4 bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <p className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-slate-400 mb-3">Attachments <span className="text-red-400">*</span></p>

                <input type="file" id="fileUpload" multiple onChange={handleFileChange} className="hidden" />
                <label
                  htmlFor="fileUpload"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 rounded-xl cursor-pointer transition-all text-sm font-medium text-slate-600 hover:text-blue-600 w-full justify-center sm:w-auto sm:justify-start"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  Attach Files
                </label>

                {files.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {files.map((file, index) => (
                      <li key={index} className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm text-slate-700 max-w-[200px]">
                        <svg className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="truncate text-xs flex-1">{file.name}</span>
                        <button onClick={() => removeFile(index)} className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Proceed Button */}
              <div className="fade-in fade-in-5 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-4 sm:py-5">
                <div>
                  <p className="req-title text-white text-base sm:text-lg font-semibold">Almost there!</p>
                  <p className="text-slate-400 text-xs mt-0.5">Review your details then proceed to payment.</p>
                </div>
                <button
                  onClick={() => setShowBill(true)}
                  disabled={!isFormComplete}
                  className="pay-btn disabled:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none text-white font-semibold px-5 sm:px-7 py-2.5 rounded-xl text-sm whitespace-nowrap w-full sm:w-auto text-center"
                >
                  {isFormComplete ? 'Proceed to Pay →' : 'Fill all fields first'}
                </button>
              </div>

              {uploadStatus && (
                <p className="text-sm text-red-500 text-center">{uploadStatus}</p>
              )}
            </div>

            {/* ══ RIGHT: Bill ══ */}
            <div className="w-full lg:w-1/3 lg:sticky lg:top-6">
              <div className={`bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-opacity duration-300 ${showBill ? 'opacity-100' : 'opacity-60'}`}>

                <p className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-slate-400 mb-1">Summary</p>
                <h2 className="req-title text-xl sm:text-2xl font-bold text-slate-800 mb-5">Your Bill</h2>

                {/* Package name row */}
                <div className="bill-row text-sm mb-3">
                  <span className="text-slate-500">Package</span>
                  <span className="font-semibold text-slate-800 text-right ml-4 truncate max-w-[160px]">{packageData.packageName}</span>
                </div>

                {/* Delivery */}
                <div className="bill-row text-sm mb-3">
                  <span className="text-slate-500">{isExpress ? 'Express Delivery' : 'Delivery Time'}</span>
                  <span className="font-semibold text-slate-800">{isExpress ? expressDeliveryTime : deliveryTime} days</span>
                </div>

                {/* Price breakdown */}
                <div className="bill-row text-sm mb-3">
                  <span className="text-slate-500">Base Price</span>
                  <span className="font-semibold text-slate-800">${packagePrice}</span>
                </div>

                {isExpress && (
                  <div className="bill-row text-sm mb-3">
                    <span className="text-slate-500">Express Fee</span>
                    <span className="font-semibold text-blue-600">+${expressDeliveryPrice}</span>
                  </div>
                )}

                <div className="divider my-3" />

                <div className="bill-row text-sm mb-4">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-bold text-slate-800">${totalPrice.toFixed(2)}</span>
                </div>

                {/* Express toggle */}
                <button
                  onClick={() => { setIsExpress(p => !p); setDiscountedPrice(null); setCouponStatus(null); }}
                  disabled={!showBill}
                  className={`w-full mb-4 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                    !showBill
                      ? 'border-slate-200 text-slate-400 cursor-not-allowed bg-slate-50'
                      : isExpress
                        ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {isExpress ? 'Cancel Express Delivery' : 'Upgrade to Express'}
                  </span>
                </button>

                {/* Coupon */}
                <div className="mb-4">
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-2">Coupon Code</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={enteredCoupon}
                      onChange={e => { setEnteredCoupon(e.target.value); setCouponStatus(null); }}
                      placeholder="Enter code"
                      disabled={!showBill}
                      className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all disabled:bg-slate-50 disabled:text-slate-400"
                    />
                    <button
                      onClick={handleCouponApply}
                      disabled={!showBill || !enteredCoupon.trim()}
                      className="pay-btn disabled:bg-slate-200 disabled:text-slate-400 disabled:transform-none disabled:shadow-none text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
                    >
                      Apply
                    </button>
                  </div>
                  {couponStatus?.type === 'valid' && (
                    <p className="text-xs text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                      {couponStatus.discount}% discount applied!
                    </p>
                  )}
                  {couponStatus?.type === 'invalid' && (
                    <p className="text-xs text-red-500 font-medium mt-1.5 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                      Invalid coupon code
                    </p>
                  )}
                </div>

                <div className="divider mb-4" />

                {/* Net total */}
                <div className="bill-row mb-5">
                  <span className="text-slate-500 text-sm">Net Total</span>
                  <div className="text-right">
                    {discountedPrice !== null && (
                      <p className="text-xs text-slate-400 line-through">${totalPrice.toFixed(2)}</p>
                    )}
                    <p className="text-2xl font-bold text-slate-900">${netTotal.toFixed(2)}</p>
                  </div>
                </div>

             <div className='flex flex-row gap-2'>
                 <button
                  onClick={handlePayment}
                  disabled={!showBill}
                  className="pay-btn disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none w-full py-3 rounded-xl text-white text-sm font-semibold text-center"
                >
                 Pay Now →
                </button>
                    <button
                  onClick={handleLatePayment}
                  disabled={!showBill}
                  className="pay-lbtn disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none w-full py-3 rounded-xl text-blue-700 text-sm font-semibold text-center"
                >
                 Pay Later →
                </button>

             </div>
             

                {!showBill && (
                  <p className="text-center text-[10px] text-slate-400 mt-3">Complete the form on the left to unlock payment</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Requireddetails;
import { useState, useEffect, useRef, useContext } from "react";
import { QRCodeCanvas } from "qrcode.react";
import Navber from "../navBer/navber";
import Footer from "../footer/footer";
import Euser from "./User";
import { AuthContext } from "../Provider/AuthProvider";
import { base_url } from "../../config/config";
import SeoHead from "../../Seohead";
import { Shimmer, ShimmerText, ShimmerForm, ShimmerTable } from "../utils/Shimmer";
const MProfile = () => {
  const { user } = useContext(AuthContext);
  const [referralCode, setReferralCode] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [referralCount, setReferralCount] = useState(0);
  const [couponCount, setCouponCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const qrRef = useRef(null);

  useEffect(() => {
    if (!user?.userId) return;

    const fetchMarketerCodes = async () => {
      try {
        const res = await fetch(`${base_url}/marketer/${user.userId}/codes`);
        const data = await res.json();

        if (data.success && data.data) {
          const marketer = data.data;
          setReferralCode(marketer.referralCode || "");
          setCouponCode(marketer.couponCode || "");
          setReferralCount(marketer.referralCount || 0);
          setCouponCount(marketer.couponCount || 0);
        } else {
          console.warn("No marketer data found for this user");
        }
      } catch (err) {
        console.error("Error fetching marketer codes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketerCodes();
  }, [user?.userId]);

  const referralLink = referralCode
    ? `${base_url}/ref/${referralCode}`
    : "Generating...";

  const copyToClipboard = (text) => navigator.clipboard.writeText(text);

  const downloadQRCode = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = "Referral_QR_Code.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen" role="status" aria-label="Loading">
        <div className="h-16 bg-white border-b border-gray-100 px-4 lg:px-10 flex items-center justify-between">
          <Shimmer className="h-8 w-32 rounded" />
          <Shimmer className="h-8 w-8 rounded-full" />
        </div>
        <div className="flex lg:flex-row flex-col gap-4 px-4 lg:px-10 py-4">
          <div className="w-full lg:w-[400px] p-4 bg-white rounded-md flex-shrink-0 flex flex-col gap-4">
            <div className="flex flex-row items-center gap-4">
              <Shimmer className="lg:w-20 lg:h-20 h-16 w-16 rounded-full shrink-0" />
              <div className="flex-1 min-w-0">
                <Shimmer className="h-4 w-2/3 rounded mb-2" />
                <Shimmer className="h-3 w-1/2 rounded" />
              </div>
            </div>
            <div className="hidden md:block">
              <ShimmerText lines={6} />
            </div>
          </div>
          <div className="flex-1 min-w-0 p-6 border border-gray-200 rounded-2xl flex flex-col gap-6">
            <Shimmer className="h-7 w-48 max-w-full rounded" />
            <div className="flex flex-col lg:flex-row w-full gap-8">
              <div className="w-full lg:w-1/2 p-5 rounded-xl border border-gray-100">
                <ShimmerForm fields={2} />
              </div>
              <div className="w-full lg:w-1/2 min-w-0">
                <ShimmerTable rows={2} cols={3} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SeoHead title="Marketer Tools" noIndex />
      <Navber />
      <div className="lg:w-full flex lg:flex-row flex-col mx-20 justify-center h-full">
        <Euser employee={user} />
        <div className="flex flex-col p-6 bg-gradient-to-br from-white to-blue-50 m-3 border border-gray-200 rounded-2xl shadow-md w-full max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
            Marketing Tools
          </h2>

          <div className="flex flex-col lg:flex-row w-full gap-8">
            {/* Left – Referral & Coupon */}
            <div className="bg-white/80 backdrop-blur-md w-full lg:w-1/2 p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="mb-8">
                <p className="font-semibold text-gray-700 mb-2">Referral Link</p>
                <div className="flex items-center bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="flex-1 bg-transparent text-gray-700 font-medium outline-none px-2"
                  />
                  <button
                    onClick={() => copyToClipboard(referralLink)}
                    className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md transition-all"
                  >
                    Copy
                  </button>
                </div>

                {referralCode && (
                  <div className="mt-5 flex flex-col items-center">
                    <div
                      ref={qrRef}
                      className="bg-white p-4 rounded-lg border border-gray-200 shadow-inner"
                    >
                      <QRCodeCanvas value={referralLink} size={160} />
                    </div>
                    <button
                      onClick={downloadQRCode}
                      className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-sm transition-all"
                    >
                      Download QR Code
                    </button>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <p className="font-semibold text-gray-700 mb-2">Coupon Code</p>
                <div className="flex items-center bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                  <input
                    type="text"
                    value={couponCode || "Loading..."}
                    readOnly
                    className="flex-1 bg-transparent text-gray-700 font-medium outline-none px-2"
                  />
                  <button
                    onClick={() => copyToClipboard(couponCode)}
                    className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md transition-all"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            {/* Right – Stats */}
            <div className="bg-white/80 backdrop-blur-md w-full lg:w-1/2 p-5 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                Usage Statistics
              </h2>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="border border-gray-200 p-2 text-left rounded-tl-md">
                      Code Type
                    </th>
                    <th className="border border-gray-200 p-2 text-left">
                      Code
                    </th>
                    <th className="border border-gray-200 p-2 text-left rounded-tr-md">
                      Usage Count
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-50 transition-all">
                    <td className="border border-gray-200 p-2 font-medium">
                      Referral Code
                    </td>
                    <td className="border border-gray-200 p-2 text-blue-600">
                      {referralCode}
                    </td>
                    <td className="border border-gray-200 p-2 text-center font-semibold text-gray-800">
                      {referralCount}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-all">
                    <td className="border border-gray-200 p-2 font-medium">
                      Coupon Code
                    </td>
                    <td className="border border-gray-200 p-2 text-blue-600">
                      {couponCode}
                    </td>
                    <td className="border border-gray-200 p-2 text-center font-semibold text-gray-800">
                      {couponCount}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MProfile;

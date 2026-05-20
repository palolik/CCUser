import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoCheckmarkDoneOutline } from "react-icons/io5";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { base_url } from "../../config/config";
import CustomPackageRequest from "../buypackage/custompackage";

const Packages = ({ category = [], packages = [] }) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (category?.length > 0) setSelectedCategory(category[0].category);
    setIsLoggedIn(!!localStorage.getItem("authToken"));
  }, [category]);

 const handleProductClick = (id) => {
  if (!id) return;


  navigate(`/packdetails/${id}`);


  fetch(`${base_url}/packageclicks/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ incrementBy: 1 }),
  }).catch((e) => {
    console.error("Package click tracking failed:", e);
  });
};

  const handlePurchaseClick = (pack) => {
    if (!isLoggedIn) return toast.error("Please log in first to make a purchase!");
    navigate("/requireddetails", {
      state: {
        packageId: pack._id, packageName: pack.packageName,
        contents: pack.packageContents, packagePrice: pack.packagePrice,
        dtime: pack.deliveryTime, edtime: pack.expressDeliveryTime,
        edprice: pack.expressDeliveryPrice, details: pack.packageDetails,
        requirements: pack.packageRequirements,
      },
    });
  };

  const isCustom = selectedCategory === "Custom Package";
const filteredPacks = isCustom ? [] : (packages ?? []).filter(
  (p) => p.category === selectedCategory && p.status === "approved"
);

  const withFeatured = filteredPacks.map((p, i) => ({
    ...p, featured: i === Math.floor(filteredPacks.length / 2),
  }));

  const tabClass = (cat) =>
    `px-5 py-2 rounded-full text-sm transition-all duration-200 border font-medium ${
      selectedCategory === cat
        ? 
           "bg-gradient-to-r from-blue-900 to-blue-700 text-white border-blue-600"
          
        : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
    }`;

  return (
    <section className="py-24 px-6 bg-gray-50">

      <div className="text-center mb-12">
        <p className="text-xs tracking-[3px] uppercase text-blue-500 font-medium mb-4">Pricing</p>
        <h2 className="font-serif text-4xl md:text-5xl font-semibold text-gray-900 leading-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}>
          Packages <em className="italic text-blue-500">We Offer</em>
        </h2>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-14">
        {category.length > 0 ? (
          <>
            {category.map((cat) => (
              <button key={cat._id} onClick={() => setSelectedCategory(cat.category)}
                className={tabClass(cat.category)}>
                {cat.category}
              </button>
            ))}
            <button onClick={() => setSelectedCategory("Custom Package")}
              className={tabClass("Custom Package") + " border-dashed"}>
              ✦ Custom Package
            </button>
          </>
        ) : (
          <p className="text-gray-400 font-light text-sm">No categories available</p>
        )}
      </div>

      {/* Custom panel */}
      {isCustom ? (
        <div className="w-full  mx-auto text-center">
          <CustomPackageRequest />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {withFeatured.length > 0 ? withFeatured.map((pack) => (
            <div key={pack._id}
              className={`group flex flex-col rounded-3xl border overflow-hidden transition-all duration-300 hover:-translate-y-1.5 ${
                pack.featured
                  ? "border-blue-500/30 hover:border-blue-400/60 hover:shadow-2xl"
                  : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-xl"
              }`}
              style={pack.featured ? { background: "linear-gradient(160deg,#050d1f,#0d1b3e)" } : {}}>

              {/* Top */}
              <div className="p-7 pb-5 cursor-pointer" onClick={() => handleProductClick(pack._id)}>
                <h3 className={`text-base font-medium text-center mb-5 ${pack.featured ? "text-blue-50" : "text-gray-900"}`}>
                  {pack.packageName}
                </h3>

                {/* Price */}
                <div className="text-center mb-3">
                  <span className={`font-serif text-5xl font-semibold ${pack.featured ? "text-blue-300" : "text-blue-600"}`}
                    style={{ fontFamily: "'Playfair Display', serif" }}>
                    ${pack.packagePrice}
                  </span>
                  <span className="text-gray-400 text-sm font-light"> /plan</span>
                </div>
                <p className={`text-center text-xs mb-5 ${pack.featured ? "text-blue-300/60" : "text-gray-400"}`}>
                  Express:{" "}
                  <span className={`font-medium ${pack.featured ? "text-blue-300/60" : "text-blue-500"}`}>
                    ${Number(pack.packagePrice) + Number(pack.expressDeliveryPrice)}
                  </span>
                </p>

                {/* Divider */}
                <div className={`h-px mb-5 ${pack.featured ? "bg-white/07" : "bg-gray-100"}`} />

                {/* Features */}
                <ul className="flex flex-col gap-2.5 mb-5">
                  {pack.packageContents?.filter(c => c?.trim()).map((c, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        pack.featured ? "bg-blue-500/15" : "bg-blue-50"}`}>
                        <IoCheckmarkDoneOutline className={`text-xs ${pack.featured ? "text-blue-300/60" : "text-blue-500"}`} />
                      </div>
                      <span className={`text-xs font-light leading-relaxed ${pack.featured ? "text-blue-300/60" : "text-gray-500"}`}>
                        {c}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Delivery */}
                <div className={`rounded-xl p-3 ${pack.featured ? "bg-white/04" : "bg-gray-50"}`}
                  style={pack.featured ? { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" } : {}}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={pack.featured ? "text-blue-300/60" : "text-gray-400"}>Regular</span>
                    <span className={`font-medium ${pack.featured ? "text-blue-300" : "text-blue-500"}`}>{pack.deliveryTime} days</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className={pack.featured ? "text-blue-300/60" : "text-gray-400"}>Express</span>
                    <span className={`font-medium ${pack.featured ? "text-blue-300" : "text-blue-500"}`}>{pack.expressDeliveryTime} days</span>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className={`p-5 pt-0 mt-auto`}>
                <button onClick={() => handlePurchaseClick(pack)}
                  className={`w-full py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                    pack.featured
                      ? "bg-blue-500 hover:bg-blue-400 text-white"
                      : "bg-blue-50 hover:bg-blue-100 text-blue-700"
                  }`}>
                  Purchase Now
                </button>
              </div>

            </div>
          )) : (
            <p className="text-center text-gray-400 font-light col-span-full py-12">
              No packages available for the selected category.
            </p>
          )}
        </div>
      )}

      <ToastContainer />
    </section>
  );
};

export default Packages;
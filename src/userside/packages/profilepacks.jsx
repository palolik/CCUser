/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoCheckmarkDoneOutline } from "react-icons/io5";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { base_url } from "../../config/config";
import CustomPackageRequest from "../buypackage/custompackage";

const ProfilePacks = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [category, setCategory] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const navigate = useNavigate();

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${base_url}/category`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCategory(data);
          setSelectedCategory(data[0].category);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch packages
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch(`${base_url}/packages`);
        const data = await res.json();
        if (Array.isArray(data)) setPackages(data);
      } catch (err) {
        console.error("Error fetching packages:", err);
      } finally {
        setLoadingPackages(false);
      }
    };
    fetchPackages();
  }, []);

  // Check login
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);
  }, []);

  const handleProductClick = async (id) => {
    try {
      await fetch(`${base_url}/packageclicks/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incrementBy: 1 }),
      });
      navigate(`/packdetails/${id}`);
    } catch (error) {
      console.error("Error updating click count:", error);
      navigate(`/packdetails/${id}`);
    }
  };

  const handlePurchaseClick = (pack) => {
    if (isLoggedIn) {
      navigate("/requireddetails", {
        state: {
          packageId: pack._id,
          packageName: pack.packageName,
          contents: pack.packageContents,
          packagePrice: pack.packagePrice,
          dtime: pack.deliveryTime,
          edtime: pack.expressDeliveryTime,
          edprice: pack.expressDeliveryPrice,
          details: pack.packageDetails,
          requirements: pack.packageRequirements,
        },
      });
    } else {
      toast.error("Please log in first to make a purchase!");
    }
  };

  const isCustom = selectedCategory === "Custom Package";

  const filteredPacks = isCustom
    ? []
    : packages.filter(
        (pack) => pack.category === selectedCategory && pack.status === "approved"
      );

  return (
    <section className="w-full flex flex-col items-center h-screen mt-4">

      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center mb-5 gap-3">
        {loadingCategories ? (
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-9 w-24 rounded-full bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {category.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat.category)}
                className={`px-6 py-2 rounded-md text-sm font-medium shadow-sm transition-all duration-200
                  ${selectedCategory === cat.category
                    ? "bg-white border text-gray-700 border-blue-600  shadow-md scale-105"
                    : "bg-white border text-gray-700 hover:bg-blue-50"
                  }`}
              >
                {cat.category}
              </button>
            ))}

            {/* Always-visible Custom Package tab */}
            <button
              onClick={() => setSelectedCategory("Custom Package")}
              className={`px-6 py-2 rounded-md text-sm font-medium shadow-sm transition-all duration-200
                ${isCustom
                  ? "bg-blue-600 text-white shadow-md scale-105"
                  : "bg-white border text-gray-700 hover:bg-blue-50"
                }`}
            >
              ✦ Custom Package
            </button>
          </>
        )}
      </div>

      {/* Custom Package Panel */}
      {isCustom ? (
        <div className=" w-full text-center px-4">
          <CustomPackageRequest></CustomPackageRequest>
        </div>
      ) : (
        /* Package Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-7xl w-full">
          {loadingPackages ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 flex flex-col gap-4 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto" />
                <div className="h-12 bg-gray-200 rounded w-1/2 mx-auto" />
                <div className="border-t border-gray-100 my-1" />
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded w-full" />
                ))}
                <div className="mt-auto h-10 bg-gray-200 rounded-xl" />
              </div>
            ))
          ) : filteredPacks.length > 0 ? (
            filteredPacks.map((pack) => (
              <div
                key={pack._id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-transform duration-300 hover:-translate-y-2 border border-gray-100 flex flex-col"
              >
                <div
                  onClick={() => handleProductClick(pack._id)}
                  className="cursor-pointer p-6 flex flex-col flex-grow"
                >
                  <h3 className="text-2xl font-semibold text-gray-800 text-center mb-4">
                    {pack.packageName}
                  </h3>

                  <div className="text-center mb-4">
                    <span className="text-blue-600 text-5xl font-bold">${pack.packagePrice}</span>
                    <span className="text-gray-600 text-lg">/plan</span>
                    <p className="text-blue-500 mt-2">
                      Express: ${Number(pack.packagePrice) + Number(pack.expressDeliveryPrice)}
                    </p>
                  </div>

                  <div className="border-t my-3 border-gray-200" />

                  <ul className="text-gray-700 space-y-2 mb-4">
                    {pack.packageContents &&
                      pack.packageContents
                        .filter((c) => c && c.trim() !== "")
                        .map((content, index) => (
                          <li key={index} className="flex items-start gap-3 text-sm">
                            <IoCheckmarkDoneOutline className="text-blue-500 mt-1 shrink-0" />
                            <span>{content}</span>
                          </li>
                        ))}
                  </ul>

                  <div className="mt-auto">
                    <p className="text-sm text-gray-600 text-center">
                      <span className="font-medium">Regular:</span>{" "}
                      <span className="text-blue-500 font-semibold">{pack.deliveryTime} days</span>
                    </p>
                    <p className="text-sm text-gray-600 text-center">
                      <span className="font-medium">Express:</span>{" "}
                      <span className="text-blue-500 font-semibold">{pack.expressDeliveryTime} days</span>
                    </p>
                  </div>
                </div>

                <div className="p-6 border-t flex justify-center">
                  <button
                    onClick={() => handlePurchaseClick(pack)}
                    className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all"
                  >
                    Purchase Now
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center col-span-full">
              No packages available for the selected category.
            </p>
          )}
        </div>
      )}

      <ToastContainer />
    </section>
  );
};

export default ProfilePacks;
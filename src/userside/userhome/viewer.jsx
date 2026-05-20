import { useContext, useEffect, useRef, useState, lazy, Suspense } from "react";
import { AuthContext } from "../Provider/AuthProvider";
import { base_url } from "../../config/config";
import Navber from "../navBer/navber";
import Footer from "../footer/footer";
import Home3 from "./home/home3";
import SeoHead from "../../Seohead";

const Stats = lazy(() => import("./stats/stats"));
const Tech = lazy(() => import("./tech/tech"));
const Whychooseus = lazy(() => import("./whychooseus/whychooseus"));
const Services = lazy(() => import("./services/services"));
const Faq = lazy(() => import("./faq/faq"));
const Packages = lazy(() => import("../packages/packages"));
const Map = lazy(() => import("./map/map"));
const OurClient = lazy(() => import("./OurClient/OurClient"));
const Process = lazy(() => import("./process/process"));

const SectionLoader = () => (
  <div className="w-full py-10 text-center text-gray-400 text-sm">
    Loading section...
  </div>
);

const useInView = () => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "250px",
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
};

const LazySection = ({ children }) => {
  const [ref, isVisible] = useInView();

  return (
    <div ref={ref} className="min-h-[120px]">
      {isVisible ? (
        <Suspense fallback={<SectionLoader />}>{children}</Suspense>
      ) : null}
    </div>
  );
};

const Viewer = () => {
  const { userEmail, packageId } = useContext(AuthContext);

  const [data, setData] = useState({
    statsData: null,
    packagesData: [],
    faqs: [],
    mapData: [],
    ourClientData: [],
    servicesData: [],
    categoryData: [],
    techData: null,
    socialData: [],
    adsData: [],
  });

  const [secondaryLoading, setSecondaryLoading] = useState(true);

  useEffect(() => {
    document.body.classList.add("react-loaded");

    setTimeout(() => {
      const initialLoader = document.getElementById("initial-loader");
      if (initialLoader) initialLoader.remove();
    }, 300);
  }, []);

  useEffect(() => {
    if (userEmail) {
      localStorage.setItem("isLogin", "true");
    }
  }, [userEmail, packageId]);

  useEffect(() => {
    let isMounted = true;

    const cachedHomeData = localStorage.getItem("homeDataCache");

    if (cachedHomeData) {
      try {
        const parsed = JSON.parse(cachedHomeData);
        setData((prev) => ({
          ...prev,
          ...parsed,
        }));
      } catch {
        localStorage.removeItem("homeDataCache");
      }
    }

    const fetchCriticalData = async () => {
      try {
        const res = await fetch(`${base_url}/home/critical`);

        if (!res.ok) {
          throw new Error("Failed to fetch critical data");
        }

        const critical = await res.json();

        if (!isMounted) return;

        setData((prev) => {
          const updated = {
            ...prev,
            mapData: critical.maps || [],
            socialData: critical.social || [],
            categoryData: critical.category || [],
          };

          localStorage.setItem("homeDataCache", JSON.stringify(updated));
          return updated;
        });
      } catch (error) {
        console.error("Critical data error:", error);
      }
    };

    const fetchSecondaryData = async () => {
      try {
        setSecondaryLoading(true);

        const res = await fetch(`${base_url}/home/secondary`);

        if (!res.ok) {
          throw new Error("Failed to fetch secondary data");
        }

        const secondary = await res.json();

        if (!isMounted) return;

        setData((prev) => {
          const updated = {
            ...prev,
            packagesData: secondary.packages || [],
            faqs: secondary.faqs || [],
            servicesData: secondary.services || [],
            ourClientData: secondary.clients || [],
            adsData: secondary.advertisements || [],
          };

          localStorage.setItem("homeDataCache", JSON.stringify(updated));
          return updated;
        });
      } catch (error) {
        console.error("Secondary data error:", error);
      } finally {
        if (isMounted) {
          setSecondaryLoading(false);
        }
      }
    };

    fetchCriticalData();
    fetchSecondaryData();

    fetch(`${base_url}/vcount`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ increment: 1 }),
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="overflow-x-hidden w-full">
      <SeoHead
        title="Software Development & Digital Solutions Since 2019"
        description="Cloud Company helps businesses grow online with custom web development, app development, graphic design, social media marketing, and product design. Reliable tech since 2019."
        canonical="/"
        ogType="website"
      />

      <Navber />

      {/* This loads instantly */}
      <Home3 />

      {/* These load only when user scrolls near them */}
      <LazySection>
        <Stats statsData={data.statsData} />
      </LazySection>

      <LazySection>
        <Tech techData={data.techData} />
      </LazySection>

      <LazySection>
        <Map mapData={data.mapData} />
      </LazySection>

      <LazySection>
        <Process />
      </LazySection>

      <LazySection>
        <Packages
          category={data.categoryData}
          packages={data.packagesData}
          loading={secondaryLoading}
        />
      </LazySection>

      <LazySection>
        <Whychooseus />
      </LazySection>

      <LazySection>
        <OurClient
          clientData={data.ourClientData}
          loading={secondaryLoading}
        />
      </LazySection>

      <LazySection>
        <Services
          serviceData={data.servicesData}
          loading={secondaryLoading}
        />
      </LazySection>

      <LazySection>
        <Faq faqs={data.faqs} loading={secondaryLoading} />
      </LazySection>

      <Footer />
    </div>
  );
};

export default Viewer;
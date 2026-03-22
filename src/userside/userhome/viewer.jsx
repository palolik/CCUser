import { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../Provider/AuthProvider';
import { base_url } from '../../config/config';
import Navber from '../navBer/navber';
import Footer from '../footer/footer';
import Stats from './stats/stats';
import Tech from './tech/tech';
import Whychooseus from './whychooseus/whychooseus';
import Services from './services/services';
import Faq from './faq/faq';
import Packages from '../packages/packages';
import Map from './map/map';
import Home3 from './home/home3';
import Social from './Social/Social';
import OurClient from './OurClient/OurClient';
import Process from './process/process';
import SupportChat from './supportchat/SupportChat';
import LoadingSpinner from '../utils/loaderSpinner';
import SeoHead from '../../Seohead';




const Viewer = () => {
  const { userEmail, packageId } = useContext(AuthContext);

  const [criticalLoading, setCriticalLoading] = useState(true);
  const [error, setError] = useState(null);

  const [data, setData] = useState({
    statsData: null,
    packagesData: null,
    faqs: null,
    mapData: null,
    ourClientData: null,
    servicesData: null,
    categoryData: null,
    techData: null,
    socialData: null,
    adsData: null,
  });

  useEffect(() => {
    document.body.classList.add('react-loaded');
    
    setTimeout(() => {
      const initialLoader = document.getElementById('initial-loader');
      if (initialLoader) {
        initialLoader.remove();
      }
    }, 300);
  }, []);

  useEffect(() => {
    if (userEmail) {
      localStorage.setItem('isLogin', 'true');
    }
  }, [userEmail, packageId]);

  // Fetch critical data first
  useEffect(() => {
    const fetchCriticalData = async () => {
      try {
        setCriticalLoading(true);
        const response = await fetch(`${base_url}/home/critical`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch critical data');
        }
        
        const result = await response.json();

        setData(prev => ({
          ...prev,
            mapData: result.maps || [],
          socialData: result.social || [],
          categoryData: result.category || [],
         
        }));
        
        setError(null);
      } catch (error) {
        console.error('Error fetching critical data:', error);
        setError(error.message);
      } finally {
        setCriticalLoading(false);
      }
    };

    fetchCriticalData();
  }, []);

 
  useEffect(() => {
    if (criticalLoading) return;

    const fetchSecondaryData = async () => {
      try {
        const response = await fetch(`${base_url}/home/secondary`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch secondary data');
        }
        
        const result = await response.json();

        setData(prev => ({
          ...prev,
          packagesData: result.packages || [],
          faqs: result.faqs || [],
          servicesData: result.services || [],
          ourClientData: result.clients || [],
          adsData: result.advertisements || [],
        }));
        
      } catch (error) {
        console.error('Error fetching secondary data:', error);
      } finally {
        setSecondaryLoading(false);
      }
    };

    const timer = setTimeout(fetchSecondaryData, 100);
    return () => clearTimeout(timer);
  }, [criticalLoading]);

  useEffect(() => {
    const updateVisitorCount = async () => {
      try {
        const response = await fetch(`${base_url}/vcount`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ increment: 1 }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update visitor count');
        }
        
        const result = await response.json();
        setVisitorCount(result.count);
      } catch (error) {
        console.error('Error updating visitor count:', error);
      }
    };
    
    updateVisitorCount();
  }, []);

  if (criticalLoading) {
    return  <LoadingSpinner/>
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50">
          <SeoHead
      title="Software Development & Digital Solutions Since 2019"
      description="Cloud Company helps businesses grow online with custom web development, app development, graphic design, social media marketing, and product design. Reliable tech since 2019."
      canonical="/"
      ogType="website"
    />
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const sections = [
    { component: <Home3 />, key: 'home', critical: true },
    { component: <Stats statsData={data.statsData} />, key: 'stats', critical: false },
    { component: <Tech techData={data.techData} />, key: 'tech', critical: false },
    { component: <Map mapData={data.mapData} />, key: 'map', critical: false },
    { component: <Process />, key: 'process', critical: true },
    { component:  <Packages category={data.categoryData} packages={data.packagesData} />, key: 'packages', critical: false },
    { component: <Whychooseus />, key: 'whychooseus', critical: true },
    { component:  <OurClient clientData={data.ourClientData} />, key: 'clients', critical: false },
    { component:  <Services serviceData={data.servicesData} />, key: 'services', critical: true },
    { component: <Faq faqs={data.faqs} />, key: 'faq', critical: false },
  ];

  return (
    <div className="overflow-x-hidden w-full">
      <Navber />
    

     {sections.map((section) => (
  <div key={section.key}>
    {section.component}
  </div>
))}

      <Footer />
    </div>
  );
};

export default Viewer;
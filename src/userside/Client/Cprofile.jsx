import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../Provider/AuthProvider"; 
import Navber from "../navBer/navber";
import Footer from "../footer/footer";
import Cuser from "./CUser";
import Cproject from "./Cprojects";
import { base_url } from "../../config/config";
import { Shimmer, ShimmerText, ShimmerList } from "../utils/Shimmer";
import SeoHead from "../../Seohead";

const ClientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext); // ← get token from context

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (user === null) {
      navigate("/");
    }
  }, [user, navigate]);

  // ── PING: keep lastActive fresh while client is on their profile ──────────
  useEffect(() => {
    if (!token) return; // not logged in, skip

    const ping = () => {
      fetch(`${base_url}/client-ping`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {}); // silent fail — never block the UI
    };

    ping(); // ping immediately on mount
    const interval = setInterval(ping, 60000); // then every 60 seconds

    return () => clearInterval(interval); // cleanup on unmount
  }, [token]);
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await fetch(`${base_url}/clientprofile/${id}`);
        if (!response.ok) throw new Error("Failed to fetch client data");
        const data = await response.json();
        setEmployee(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id]);

  if (loading)
    return (
      <div className="overflow-hidden min-h-screen bg-gradient-to-br from-slate-50 to-slate-100" role="status" aria-label="Loading">
        <div className="h-16 bg-white border-b border-gray-100 px-4 lg:px-10 flex items-center justify-between">
          <Shimmer className="h-8 w-32 rounded" />
          <Shimmer className="h-8 w-8 rounded-full" />
        </div>
        <div className="lg:w-full lg:px-10 px-4 py-6 flex lg:flex-row flex-col gap-6">
          <div className="w-full lg:w-[400px] p-4 bg-white rounded-md flex-shrink-0 flex flex-col gap-4">
            <div className="flex flex-row items-center gap-4">
              <Shimmer className="lg:w-20 lg:h-20 h-16 w-16 rounded-full shrink-0" />
              <div className="flex-1 min-w-0">
                <Shimmer className="h-4 w-2/3 rounded mb-2" />
                <Shimmer className="h-3 w-1/2 rounded" />
              </div>
            </div>
            <div className="hidden md:block">
              <ShimmerText lines={4} />
            </div>
          </div>
          <div className="flex-1 min-w-0 bg-white rounded-md p-4">
            <ShimmerList rows={5} />
          </div>
        </div>
      </div>
    );
  if (error) return <p>Error: {error}</p>;
  if (!employee) return <p>No client found.</p>;

  return (
    <div className="overflow-hidden h-100vm  bg-gradient-to-br from-slate-50 to-slate-100">
      <SeoHead title="Client Profile" noIndex />
      <Navber employee={employee} />
      <div className="lg:w-full lg:px-10 sm:mx-1 flex lg:flex-row flex-col lg:items-start h-screen">
        <Cuser employee={employee} />
        <Cproject eid={id} />
      </div>
      <Footer />
    </div>
  );
};

export default ClientProfile;
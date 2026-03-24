import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../Provider/AuthProvider"; 
import Navber from "../navBer/navber";
import Footer from "../footer/footer";
import Cuser from "./CUser";
import Cproject from "./Cprojects";
import { base_url } from "../../config/config";
import LoadingSpinner from "../utils/loaderSpinner";

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

  if (loading) return <LoadingSpinner />;
  if (error) return <p>Error: {error}</p>;
  if (!employee) return <p>No client found.</p>;

  return (
    <div className="overflow-hidden h-100vm  bg-gradient-to-br from-slate-50 to-slate-100">
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
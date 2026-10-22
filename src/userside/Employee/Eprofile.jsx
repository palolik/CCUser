import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../Provider/AuthProvider";
import Navber from "../navBer/navber";
import Footer from "../footer/footer";
import Euser from "./User";
import Task from "./Task";
import { base_url } from "../../config/config";
import Portfolio from "./portfolio/portfolio";
import SeoHead from "../../Seohead";
import { Shimmer, ShimmerText, ShimmerList } from "../utils/Shimmer";
const EmployeeProfile = () => {
  const { id } = useParams();
  const { user,token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



useEffect(() => {
  if (!token) return;

  const ping = () => {
    fetch(`${base_url}/employee-ping`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  };

  ping();                                    
  const interval = setInterval(ping, 60000);

  return () => clearInterval(interval);      
}, [token]);
  useEffect(() => {
    if (user === null) {
      navigate("/"); 
    }
  }, [user, navigate]);
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await fetch(`${base_url}/employeeprofile/${id}`);
        if (!response.ok) throw new Error("Failed to fetch employee data");
        const data = await response.json();
        setEmployee(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  if (loading)
    return (
      <div className="overflow-hidden min-h-screen bg-gradient-to-br from-slate-50 to-slate-100" role="status" aria-label="Loading">
        <div className="h-16 bg-white border-b border-gray-100 px-4 lg:px-10 flex items-center justify-between">
          <Shimmer className="h-8 w-32 rounded" />
          <Shimmer className="h-8 w-8 rounded-full" />
        </div>
        <div className="lg:w-full lg:px-10 px-4 py-4 flex lg:flex-row flex-col lg:justify-center gap-4">
          <div className="w-full lg:w-[400px] p-4 bg-white rounded-md flex-shrink-0 flex flex-col gap-4">
            <div className="flex flex-row items-center gap-4">
              <Shimmer className="lg:w-20 lg:h-20 h-16 w-16 rounded-full shrink-0" />
              <div className="flex-1 min-w-0">
                <Shimmer className="h-4 w-2/3 rounded mb-2" />
                <Shimmer className="h-3 w-1/2 rounded" />
              </div>
            </div>
            <div className="hidden md:block">
              <ShimmerText lines={8} />
            </div>
          </div>
          <div className="flex-1 min-w-0 bg-white rounded-md p-4">
            <ShimmerList rows={5} />
          </div>
        </div>
      </div>
    );
  if (error) return <p>Error: {error}</p>;
  if (!employee) return <p>No employee found.</p>;

  return (
    <div className="overflow-hidden h-[70vm] bg-gradient-to-br from-slate-50 to-slate-100">
      <SeoHead title="Employee Profile" noIndex />
      <Navber employee={employee} />
      <div className="lg:w-full lg:px-10 sm:mx-1 flex lg:flex-row flex-col lg:items-start lg:justify-center  h-[70vm]">
        <Euser employee={employee} />
      
        <Task  eid={id} />
      </div>
      <Footer />
    </div>
  );
};

export default EmployeeProfile;

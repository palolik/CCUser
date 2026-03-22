import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../Provider/AuthProvider";
import Navber from "../navBer/navber";
import Footer from "../footer/footer";
import Euser from "./User";
import Task from "./Task";
import { base_url } from "../../config/config";
import Portfolio from "./portfolio/portfolio";
const EmployeeProfile = () => {
  const { id } = useParams();
  const { user,token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


// Add this useEffect alongside your existing ones:
useEffect(() => {
  if (!token) return;

  const ping = () => {
    fetch(`${base_url}/employee-ping`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  };

  ping();                                    // ping immediately on mount
  const interval = setInterval(ping, 60000); // then every 60 seconds

  return () => clearInterval(interval);      // cleanup on unmount
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!employee) return <p>No employee found.</p>;

  return (
    <div className="overflow-hidden h-100vm bg-gradient-to-br from-slate-50 to-slate-100">
      <Navber employee={employee} />
      <div className="lg:w-full lg:px-10 sm:mx-1 flex lg:flex-row flex-col lg:items-start h-full">
        <Euser employee={employee} />
      
        <Task userSpecialty={employee.rdep} eid={id} />
      </div>
      <Footer />
    </div>
  );
};

export default EmployeeProfile;

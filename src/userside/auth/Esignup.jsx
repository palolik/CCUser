/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { base_url } from "../../config/config";
import {
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaLock,
  FaBuilding,
  FaLayerGroup,
  FaStar,
} from "react-icons/fa";

const ESignUp = () => {
  const loaderEmployee = useLoaderData();
  const [employees, setEmployees] = useState(loaderEmployee || []);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedSubDepartment, setSelectedSubDepartment] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState("");
  const [availableExpertise, setAvailableExpertise] = useState([]);
  const navigate = useNavigate();

 const departmentData = [
  {
    department: "Web Development",
    subDepartments: [
      "Frontend",
       "Backend", 
       "Full Stack",
       "CMS Development"],
  },
  {
    department: "Graphic Design",
    subDepartments: [
      "Social Media Design",
      "Post Design",
      "Logo Design",
      "UI/UX Design",
      "Print Design",
    ],
  },
  {
    department: "Digital Marketing",
    subDepartments: [
      "Cloud Company Marketing",
      "SEO",
      "Social Media Marketing",
      "Content Marketing",
      "Email Marketing",
      "Paid Ads (PPC)",
    ],
  },
  {
    department: "Mobile App Development",
    subDepartments: [
      "Android Development",
      "iOS Development",
      "Cross-Platform Development",
    ],
  },
  {
    department: "Video & Animation",
    subDepartments: [
      "2D Animation",
      "3D Animation",
      "Explainer Videos",
      "Video Editing",
      "Motion Graphics",
    ],
  },
  {
    department: "Content Writing",
    subDepartments: [
      "Blog Writing",
      "Copywriting",
      "Technical Writing",
      "Product Descriptions",
    ],
  },
  {
    department: "Data & Analytics",
    subDepartments: [
      "Data Analysis",
      "Data Visualization",
      "Machine Learning",
      "AI Model Training",
    ],
  },
  {
    department: "IT & Support",
    subDepartments: [
      "Server Management",
      "Cloud Support",
      "Networking",
      "Technical Support",
    ],
  },
];

const subdepartmentData = {
  // Web Development
  Frontend: ["React", "Angular", "Vue.js", "Next.js", "Tailwind CSS"],
  Backend: ["Laravel", "Node.js", "PHP", "Python", "Express.js"],
  "Full Stack": ["MERN Stack", "MEAN Stack", "LAMP Stack"],
  "CMS Development": ["WordPress", "Shopify", "Wix", "Joomla"],

  // Graphic Design
  "Social Media Design": ["DP", "Cover", "Instagram Posts", "Story Templates"],
  "Post Design": ["Banner", "Flyer", "Poster", "Brochure"],
  "Logo Design": ["Logo Creation", "Branding", "Icon Design"],
  "UI/UX Design": ["Wireframing", "Prototyping", "Figma", "Adobe XD"],
  "Print Design": ["Business Cards", "Letterheads", "Magazine Layouts"],

  // Digital Marketing
  "SEO": ["On-Page SEO", "Off-Page SEO", "Keyword Research", "Technical SEO"],
  "Social Media Marketing": [
    "Facebook Ads",
    "Instagram Growth",
    "LinkedIn Marketing",
  ],
  "Content Marketing": ["Blog Strategy", "Content Planning", "Copy Optimization"],
  "Email Marketing": ["Mailchimp", "Automation", "Cold Outreach"],
  "Paid Ads (PPC)": ["Google Ads", "YouTube Ads", "Facebook Ads"],

  "Android Development": ["Kotlin", "Java", "Android Studio"],
  "iOS Development": ["Swift", "Objective-C", "Xcode"],
  "Cross-Platform Development": ["Flutter", "React Native", "Ionic"],

  "2D Animation": ["Character Animation", "Explainer Animations"],
  "3D Animation": ["Modeling", "Rendering", "Rigging"],
  "Explainer Videos": ["Storyboard", "Voice Over", "Motion Graphics"],
  "Video Editing": ["Premiere Pro", "After Effects", "DaVinci Resolve"],
  "Motion Graphics": ["Text Animation", "Logo Animation", "Transitions"],

  "Blog Writing": ["SEO Blogs", "Technical Blogs", "Long-form Articles"],
  "Copywriting": ["Sales Copy", "Website Copy", "Ad Copy"],
  "Technical Writing": ["API Docs", "Software Manuals", "User Guides"],
  "Product Descriptions": ["E-commerce Copy", "Amazon Listings"],

  "Data Analysis": ["Excel", "Python", "Power BI", "SQL"],
  "Data Visualization": ["Tableau", "Google Data Studio", "D3.js"],
  "Machine Learning": ["TensorFlow", "Scikit-learn", "Keras"],
  "AI Model Training": ["Data Labeling", "Model Tuning", "Evaluation"],

  "Server Management": ["Linux", "cPanel", "AWS EC2"],
  "Cloud Support": ["AWS", "Azure", "Google Cloud"],
  "Networking": ["Cisco", "Network Setup", "Troubleshooting"],
  "Technical Support": ["Remote Support", "System Maintenance", "Bug Fixing"],
};


  useEffect(() => {
    setSelectedSubDepartment("");
    setAvailableExpertise([]);
  }, [selectedDepartment]);

  useEffect(() => {
    setAvailableExpertise(subdepartmentData[selectedSubDepartment] || []);
    setSelectedExpertise("");
  }, [selectedSubDepartment]);

  const handleAddPost = async (event) => {
    event.preventDefault();
    const form = event.target;

    const postData = {
      rppic:
        "https://p1.hiclipart.com/preview/359/957/100/face-icon-user-profile-user-account-avatar-icon-design-head-silhouette-neck-png-clipart.jpg",
      role: "emp",
      isReady: false,
      rname: form.rname.value.trim(),
      remail: form.remail.value.trim(),
      rphone: form.rphone.value.trim(),
      rpass: form.rpass.value.trim(),
      rdep: selectedDepartment,
      rsubdep: selectedSubDepartment,
      esprts: selectedExpertise,
      bkash: "N/A",
      nogod: "N/A",
      bankn: "N/A",
      bacc: "N/A",
      atime: 0,
      ecc: 0,
      xp: 0,
    };

    try {
      const response = await fetch(`${base_url}/addemployee`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });
      const data = await response.json();

      if (data.insertedId) {
        Swal.fire({
          title: "Success!",
          text: "Employee account created successfully.",
          icon: "success",
          confirmButtonText: "Go to Sign In",
        }).then(() => {
          navigate("/signin"); // Redirect to sign-in page
        });

        setEmployees([...employees, { ...postData, _id: data.insertedId }]);
        form.reset();
        setSelectedDepartment("");
        setSelectedSubDepartment("");
        setSelectedExpertise("");
      } else {
        Swal.fire("Error", "Could not add employee", "error");
      }
    } catch (error) {
      console.error("Error adding employee:", error);
      Swal.fire("Error", "An unexpected error occurred", "error");
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white shadow-xl rounded-2xl w-full sm:w-[420px] p-8 border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Employee Sign Up
        </h2>

        <form onSubmit={handleAddPost} className="space-y-4">
          {/* Name */}
          <div className="relative">
            <FaUser className="absolute left-3 top-3 text-gray-400 text-lg" />
            <input
              type="text"
              name="rname"
              placeholder="Full Name"
              required
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-3 text-gray-400 text-lg" />
            <input
              type="email"
              name="remail"
              placeholder="Email Address"
              required
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* Phone */}
          <div className="relative">
            <FaPhoneAlt className="absolute left-3 top-3 text-gray-400 text-lg" />
            <input
              type="tel"
              name="rphone"
              placeholder="Phone Number"
              required
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <FaLock className="absolute left-3 top-3 text-gray-400 text-lg" />
            <input
              type="password"
              name="rpass"
              placeholder="Password"
              required
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          <div className="relative">
            <FaBuilding className="absolute left-3 top-3 text-gray-400 text-lg" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              id="department"
              required
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              <option value="">Select Department</option>
              {departmentData.map((dep) => (
                <option key={dep.department} value={dep.department}>
                  {dep.department}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <FaLayerGroup className="absolute left-3 top-3 text-gray-400 text-lg" />
            <select
              value={selectedSubDepartment}
              onChange={(e) => setSelectedSubDepartment(e.target.value)}
              id="subDepartment"
              required
              disabled={!selectedDepartment}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              <option value="">Select Sub Department</option>
              {departmentData
                .find((dep) => dep.department === selectedDepartment)
                ?.subDepartments.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
            </select>
          </div>

          <div className="relative">
            <FaStar className="absolute left-3 top-3 text-gray-400 text-lg" />
            <select
              value={selectedExpertise}
              onChange={(e) => setSelectedExpertise(e.target.value)}
              id="expertise"
              disabled={!selectedSubDepartment}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              <option value="">Select Expertise</option>
              {availableExpertise.map((expert) => (
                <option key={expert} value={expert}>
                  {expert}
                </option>
              ))}
            </select>
          </div>

         
          <button
            type="submit"
            className="w-full py-3  text-white rounded-lg mt-4 hover:scale-105 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200 font-medium"
          style={{
    background:
      "linear-gradient(150deg,#050d1f 0%,#0d1b3e 55%,#091528 100%)",
  }}  >
            Sign Up
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/signin")}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
};

export default ESignUp;

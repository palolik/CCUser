import { useEffect, useState } from "react";
import { base_url } from "../../../config/config";

const Social = () => {
  const [socialData, setSocialData] = useState([]);

  useEffect(() => {
    fetch(`${base_url}/socialmedia`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSocialData(data);
      })
      .catch((err) => console.error("Error fetching social links:", err));
  }, []);

  if (socialData.length === 0) return null;

  return (
    <div className="flex flex-col md:w-12 w-10 gap-2 fixed p-1 border-red-100 border-r-[1px] mt-40 md:mt-80 rounded-r-3xl z-50">
      {socialData.map((item) => (
        <a key={item._id} href={item.link} target="_blank" rel="noopener noreferrer">
          <img
            src={item.certilink}
            className="md:h-10 md:w-10 rounded-full transform transition-transform duration-500 hover:scale-125"
            alt={`Social link for ${item.link}`}
          />
        </a>
      ))}
    </div>
  );
};

export default Social;
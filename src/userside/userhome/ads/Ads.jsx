/* eslint-disable react/prop-types */
const Ads = ({ adsData = [], location }) => {
  const filteredAds = adsData.filter(
    (ad) =>
      ad.location?.toLowerCase() === location?.toLowerCase() &&
      ad.status === "pending"
  );

  const getAdStyle = () => {
    switch (location) {
      case "Sidebar":
        return {
          container:
            "fixed left-0 top-1/2 transform -translate-y-1/2 flex flex-col gap-3 p-2 border-r border-red-100 rounded-r-3xl bg-white/50 backdrop-blur-md shadow-md",
          img: "w-40 h-60 object-cover rounded-2xl hover:scale-105 transition-transform duration-500",
        };
      case "Header":
        return {
          container:
            "w-full flex flex-row justify-center items-center border-b border-red-100 py-2 bg-white/70 backdrop-blur-md shadow-sm",
          img: "w-full max-w-5xl h-28 object-cover rounded-xl hover:scale-[1.02] transition-transform duration-500",
        };
      case "Footer":
        return {
          container:
            "w-full flex flex-row justify-center items-center border-t border-red-100 py-3 bg-white/70 backdrop-blur-md shadow-sm",
          img: "w-full max-w-5xl h-24 object-cover rounded-xl hover:scale-[1.02] transition-transform duration-500",
        };
      default:
        return {
          container: "flex flex-col gap-2",
          img: "w-32 h-32 object-cover rounded-lg hover:scale-105 transition-transform duration-500",
        };
    }
  };

  const { container, img } = getAdStyle();

  return (
    <div className={`z-50 ${container}`}>
      {filteredAds.length > 0 ? (
        filteredAds.map((ad) => (
          <a
            key={ad._id}
            href={ad.rdlink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={ad.imglink} className={img} alt={`Ad for ${ad.rdlink}`} />
          </a>
        ))
      ) : (
        <p className="hidden"></p>
      )}
    </div>
  );
};

export default Ads;

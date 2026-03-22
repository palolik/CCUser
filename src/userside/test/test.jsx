import React, { useState } from 'react';
import { IoIosLocate } from "react-icons/io";

const Test = () => {
  const [hoverStates, setHoverStates] = useState({
    icon1: false,
    icon2: false,
  });

  const handleMouseEnterIcon = (iconId) => {
    setHoverStates({ ...hoverStates, [iconId]: true });
  };

  const handleMouseLeaveIcon = (iconId) => {
    setHoverStates({ ...hoverStates, [iconId]: false });
  };

  return (
    <div className="h-500 w-1200 relative top-0 left-0 z-40">
      <IoIosLocate
        onMouseEnter={() => handleMouseEnterIcon('icon1')}
        onMouseLeave={() => handleMouseLeaveIcon('icon1')}
        className="h-6 w-6 relative  text-blue-700 top-200 left-880 "
      />
      {hoverStates.icon1 && (
        <div className="tooltip absolute bg-red-500 top-220 left-900 h-20 w-40">
          This div is baal
        </div>
      )}

      <IoIosLocate
        onMouseEnter={() => handleMouseEnterIcon('icon2')} onMouseLeave={() => handleMouseLeaveIcon('icon2')}
        className="h-6 w-6 relative  text-blue-700 top-200 left-880 "
      />
      {hoverStates.icon2 && (
        <div className="tooltip absolute bg-red-500 top-220 left-900 h-20 w-40">
          This div appears on hover!
        </div>
      )}
    </div>
  );
};

export default Test;

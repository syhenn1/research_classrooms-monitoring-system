import { useState } from "react";
import { FaHome, FaClipboardList, FaCog } from "react-icons/fa";

const SideBar = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="fixed top-1/4 left-0 z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`${
          isHovered ? "w-48" : "w-12"
        } h-1/2 bg-red-400 text-white transition-all duration-300 rounded-r-lg shadow-lg flex flex-col justify-center`}
      >
          INI GAK TAU BUAT APA
        <ul className="space-y-4 px-3">
          <li className="flex items-center space-x-2 cursor-pointer hover:bg-red-500 px-2 py-1 rounded-md">
            <FaHome />
            {isHovered && <span>Home</span>}
          </li>
          <li className="flex items-center space-x-2 cursor-pointer hover:bg-red-500 px-2 py-1 rounded-md">
            <FaClipboardList />
            {isHovered && <span>Logs</span>}
          </li>
          <li className="flex items-center space-x-2 cursor-pointer hover:bg-red-500 px-2 py-1 rounded-md">
            <FaCog />
            {isHovered && <span>Settings</span>}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SideBar;

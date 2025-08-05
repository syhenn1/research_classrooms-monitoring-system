import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiMonitor, FiBarChart2 } from 'react-icons/fi';

const SideBar = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen
        flex items-center justify-center
        transition-all duration-300 ease-in-out
        ${isExpanded ? 'w-48' : 'w-2'}
        group
        z-50
      `}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div
        className={`
          flex flex-col items-center
          transition-all duration-300 ease-in-out
          space-y-4
          ${isExpanded ? 'bg-dark-blue p-4 rounded-2xl shadow-lg' : ''}
        `}
      >
        <SideBarLink to="/home" icon={FiHome} isExpanded={isExpanded} />
        <SideBarLink to="/monitoring" icon={FiMonitor} isExpanded={isExpanded} />
        <SideBarLink to="/result" icon={FiBarChart2} isExpanded={isExpanded} />
      </div>
    </aside>
  );
};

const SideBarLink = ({ to, icon: Icon, isExpanded }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `
          flex items-center justify-center
          transition-all duration-300 ease-in-out
          w-10 h-10 rounded-lg
          ${isActive ? 'bg-white' : 'hover:bg-indigo-600'}
        `
      }
    >
      {({ isActive }) => (
        <Icon
          size={20}
          className={`
            transition-opacity duration-200
            ${isActive ? 'text-dark-blue' : 'text-white'}
            ${isExpanded ? 'opacity-100' : 'opacity-0'}
          `}
        />
      )}
    </NavLink>
  );
};

export default SideBar;

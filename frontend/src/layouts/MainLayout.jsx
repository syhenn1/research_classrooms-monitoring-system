import React from 'react';
import { Outlet } from 'react-router-dom';
import SideBar from '../components/SideBar';

const MainLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <SideBar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
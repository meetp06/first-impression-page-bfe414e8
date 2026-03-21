import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ToastContainer from '../components/Toast';
import './DashboardLayout.css';
import { useApp } from '../context/AppContext';

export default function DashboardLayout() {
  const { state } = useApp();

  return (
    <div className={`dashboard-layout ${!state.isSidebarOpen ? 'dashboard-layout--collapsed' : ''}`}>
      <Sidebar />
      <main className="dashboard-layout__main">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  );
}

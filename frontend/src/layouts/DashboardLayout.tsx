import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import RightPanel from '../components/RightPanel';

export default function DashboardLayout() {
  return (
    <div className="flex h-screen w-full bg-bg-color overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <TopNav />
        <main className="flex-1 overflow-y-auto bg-bg-color">
          <Outlet />
        </main>
      </div>
      <RightPanel />
    </div>
  );
}

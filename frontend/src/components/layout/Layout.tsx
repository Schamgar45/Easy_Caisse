import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface LayoutProps { children: React.ReactNode }
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  return <div className="min-h-screen bg-[#F8FAFC]"><div className="flex min-h-screen">
    <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
    <div className="min-w-0 flex-1">
      <Header />
      <main className="mx-auto w-full max-w-[1700px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  </div></div>;
};
export default Layout;

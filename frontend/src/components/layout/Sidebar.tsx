import { NavLink } from "react-router-dom";
import { AlertCircle, BarChart3, ChevronLeft, CreditCard, LayoutDashboard, LogOut, Package, ShoppingCart, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const mainLinks = [
  { name: "Tableau de bord", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Produits & stocks", icon: Package, path: "/produits" },
  { name: "Clients", icon: Users, path: "/clients" },
  { name: "Ventes", icon: CreditCard, path: "/ventes" },
];
const salesLinks = [
  { name: "Point de vente", icon: ShoppingCart, path: "/point-de-vente" },
  { name: "Caisse", icon: CreditCard, path: "/caisse" },
  { name: "Alertes stock", icon: AlertCircle, path: "/alertes-stock" },
  { name: "Rapports", icon: BarChart3, path: "/rapports" },
];
interface SidebarProps { collapsed: boolean; setCollapsed: (collapsed: boolean) => void }

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();
  const displayName = user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : user?.username || "Utilisateur";
  const role = ({ admin: "Administrateur", caissier: "Caissier", gestionnaire: "Gestionnaire" } as Record<string, string>)[user?.role || ""] || "Équipe boutique";
  const linkClass = ({ isActive }: { isActive: boolean }) => `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? "bg-[#102044] text-white shadow-sm" : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"}`;
  const links = (items: typeof mainLinks) => items.map(({ name, icon: Icon, path }) => <NavLink key={path} to={path} title={collapsed ? name : undefined} aria-label={name} className={linkClass}>{({ isActive }) => <><Icon className={`h-[18px] w-[18px] shrink-0 transition ${isActive ? "text-white" : "text-slate-400 group-hover:text-emerald-700"}`} /><span className={`${collapsed ? "hidden" : "hidden sm:inline"}`}>{name}</span></>}</NavLink>);
  return <aside className={`sticky top-0 z-20 flex h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-200 ${collapsed ? "w-16" : "w-16 sm:w-60 xl:w-[300px]"}`}>
    <div className={`flex h-[72px] shrink-0 items-center border-b border-slate-100 ${collapsed ? "justify-center px-2" : "justify-between px-3 sm:px-5"}`}>
      <span className={`${collapsed ? "hidden" : "hidden sm:inline"} text-xs font-bold uppercase tracking-[.2em] text-slate-600`}>Navigation</span>
      <button onClick={() => setCollapsed(!collapsed)} aria-label="Réduire ou développer la navigation" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`} /></button>
    </div>
    <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4 sm:px-3" aria-label="Navigation principale">
      {!collapsed && <p className="hidden px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400 sm:block">Boutique</p>}{links(mainLinks)}
      {!collapsed && <p className="hidden px-3 pb-2 pt-5 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400 sm:block">Ventes & gestion</p>}{links(salesLinks)}
    </nav>
    <div className="shrink-0 border-t border-slate-100 p-3 sm:p-4">
      <div className={`${collapsed ? "hidden" : "hidden sm:flex"} mb-3 items-center gap-3 px-1`}><span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-800">{displayName.slice(0, 2).toUpperCase()}</span><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{displayName}</p><p className="text-xs text-slate-500">{role}</p></div></div>
      <button onClick={logout} title={collapsed ? "Déconnexion" : undefined} className={`flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 px-3 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 ${collapsed ? "sm:justify-start" : ""}`}><LogOut className="h-4 w-4" /><span className={collapsed ? "hidden" : "hidden sm:inline"}>Déconnexion</span></button>
    </div>
  </aside>;
};
export default Sidebar;

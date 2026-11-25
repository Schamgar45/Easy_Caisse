import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const roleLabels: Record<string, string> = { admin: "Administrateur", caissier: "Caissier", gestionnaire: "Gestionnaire" };
const Header = () => {
  const { user } = useAuth(); const navigate = useNavigate(); const [search, setSearch] = useState("");
  const displayName = user?.first_name || user?.username || "Utilisateur";
  const initials = displayName.slice(0, 2).toUpperCase();
  const searchProducts = (event: FormEvent) => { event.preventDefault(); navigate(`/produits${search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ""}`); };
  return <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
    <div className="flex min-h-[72px] flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap sm:px-6 lg:px-8">
      <div className="flex min-w-[190px] items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2450e8] text-sm font-extrabold text-white">EC</span><div><p className="whitespace-nowrap text-base font-bold leading-tight text-[#0F172A] sm:text-lg">Easycaisse</p><p className="whitespace-nowrap text-xs font-medium text-slate-500">Ventes, caisse & stocks</p></div></div>
      <form onSubmit={searchProducts} className="relative order-3 w-full flex-1 sm:order-none sm:mx-5 sm:w-auto"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Rechercher dans les produits" placeholder="Rechercher un produit, un code-barres…" className="h-10 w-full rounded-xl border border-slate-200 bg-[#F8FAFC] pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50" /></form>
      <div className="ml-auto flex shrink-0 items-center gap-2 border-l border-slate-200 pl-3 sm:gap-3 sm:pl-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#102044] text-xs font-bold text-white">{initials}</span><div className="hidden min-w-0 sm:block"><p className="max-w-36 truncate text-sm font-semibold text-slate-800">{displayName}</p><p className="text-xs text-slate-500">{roleLabels[user?.role || ""] || "Équipe boutique"}</p></div>
      </div>
    </div>
  </header>;
};
export default Header;

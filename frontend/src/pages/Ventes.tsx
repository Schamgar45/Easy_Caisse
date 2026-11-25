import { useEffect, useState } from "react";
import { Search, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EmptyState from "@/components/ui/EmptyState";
import { venteAPI } from "@/api";
import { Vente } from "@/types";

const formatMoney = (value: number | string) => `${Number(value).toLocaleString("fr-FR")} FC`;
const Ventes = () => {
  const navigate = useNavigate();
  const [ventes, setVentes] = useState<Vente[]>([]); const [search, setSearch] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  useEffect(() => { const timer = window.setTimeout(() => { setLoading(true); venteAPI.list({ search }).then(({ data }) => { setVentes(data.results ?? data); setError(""); }).catch(() => setError("Impossible de charger les ventes. Vérifiez le serveur." )).finally(() => setLoading(false)); }, 250); return () => window.clearTimeout(timer); }, [search]);
  const annuler = async (vente: Vente) => { if (!window.confirm(`Annuler la vente ${vente.numero_vente} ?`)) return; try { await venteAPI.annuler(vente.id); setVentes((items) => items.map((v) => v.id === vente.id ? { ...v, statut: "annulee" } : v)); } catch { setError("Cette vente ne peut pas être annulée."); } };
  return <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6"><div><h1 className="text-2xl font-bold text-slate-900">Ventes</h1><p className="mt-1 text-sm text-slate-500">Historique des ventes enregistrées</p></div>
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 p-4 sm:p-5"><label className="relative block w-full max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input placeholder="Rechercher par numéro ou client…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:bg-white" /></label></div>
      {error && <p role="alert" className="p-4 bg-rose-50 text-rose-700">{error}</p>}
      {loading ? <div className="px-4 py-12 text-center text-sm text-slate-500">Chargement des ventes…</div> : ventes.length === 0 ? <EmptyState icon={ShoppingBag} title={search ? "Aucune vente trouvée" : "Aucune vente pour l’instant"} description={search ? "Essayez un autre numéro de ticket ou nom de client." : "Les ventes enregistrées au point de vente apparaîtront ici."} actionLabel={search ? "Effacer la recherche" : "Créer une vente"} onAction={() => search ? setSearch("") : navigate("/point-de-vente")} /> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-slate-50"><tr>{["N° vente", "Client", "Date", "Total TTC", "Paiement", "Statut", ""].map((v, i) => <th key={i} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{v}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">
        {ventes.map((v) => <tr key={v.id} className="hover:bg-slate-50"><td className="px-5 py-4 font-semibold text-slate-800">{v.numero_vente}</td><td className="px-5 py-4">{v.client_nom || "Client de passage"}</td><td className="px-5 py-4">{new Date(v.date_vente).toLocaleString("fr-FR")}</td><td className="px-5 py-4 font-medium">{formatMoney(v.total_ttc)}</td><td className="px-5 py-4">{v.mode_paiement.replace("_", " ")}</td><td className="px-5 py-4">{v.statut}</td><td className="px-5 py-4">{v.statut === "validee" && <button className="text-rose-600 text-sm" onClick={() => void annuler(v)}>Annuler</button>}</td></tr>)}
      </tbody></table></div>}
    </div>
  </div>;
};
export default Ventes;

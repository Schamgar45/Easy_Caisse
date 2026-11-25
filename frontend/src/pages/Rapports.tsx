import { useEffect, useState } from "react";
import { BarChart3, CreditCard, Package, Users } from "lucide-react";
import { clientAPI, produitAPI, venteAPI } from "@/api";
import { Statistiques, TopProduit, VenteParJour } from "@/types";

const Rapports = () => {
  const [stats, setStats] = useState<Statistiques | null>(null); const [top, setTop] = useState<TopProduit[]>([]); const [jours, setJours] = useState<VenteParJour[]>([]); const [totaux, setTotaux] = useState({ clients: 0, produits: 0 }); const [error, setError] = useState("");
  useEffect(() => { Promise.all([venteAPI.stats(), venteAPI.topProduits(), venteAPI.ventesParJour(), clientAPI.list(), produitAPI.list()]).then(([s, t, j, c, p]) => { setStats(s.data); setTop(t.data); setJours(j.data); setTotaux({ clients: c.data.count ?? c.data.length, produits: p.data.count ?? p.data.length }); }).catch(() => setError("Impossible de charger les rapports. Vérifiez le backend.")); }, []);
  const cards = [{ label: "Ventes enregistrées", value: stats?.total_ventes ?? "—", icon: CreditCard }, { label: "Chiffre d’affaires", value: stats ? `${Number(stats.chiffre_affaire).toLocaleString("fr-FR")} FC` : "—", icon: BarChart3 }, { label: "Clients", value: totaux.clients, icon: Users }, { label: "Produits catalogués", value: totaux.produits, icon: Package }];
  const max = Math.max(...jours.map((j) => Number(j.ca)), 1);
  return <div className="space-y-6"><div><h1 className="text-2xl font-bold">Rapports</h1><p className="text-slate-500 mt-1">Synthèse des ventes et du stock de la boutique</p></div>{error && <p role="alert" className="p-4 bg-rose-50 text-rose-700 rounded-xl">{error}</p>}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">{cards.map((c) => <div key={c.label} className="bg-white rounded-2xl border p-6"><div className="flex justify-between"><div><p className="text-sm text-slate-500">{c.label}</p><p className="text-2xl font-bold mt-2">{c.value}</p></div><c.icon className="text-emerald-600" /></div></div>)}</div>
    <div className="grid lg:grid-cols-2 gap-6"><section className="bg-white rounded-2xl border p-6"><h2 className="font-semibold mb-6">Chiffre d’affaires des 7 derniers jours</h2>{jours.length ? <div className="h-64 flex items-end gap-3">{jours.map((j) => <div key={j.date} className="flex-1 h-full flex flex-col justify-end items-center gap-2"><div title={`${Number(j.ca).toLocaleString("fr-FR")} FC`} className="w-full max-w-14 bg-emerald-500 rounded-t-lg" style={{ height: `${Math.max(3, Number(j.ca) / max * 80)}%` }} /><span className="text-xs">{j.date}</span><span className="text-xs text-slate-500">{j.nb_ventes}</span></div>)}</div> : <p className="py-12 text-center text-slate-500">Pas encore de ventes sur cette période.</p>}</section>
      <section className="bg-white rounded-2xl border p-6"><h2 className="font-semibold mb-4">Meilleures ventes produits</h2>{top.length ? <div className="divide-y">{top.map((p) => <div key={p.nom} className="py-3 flex justify-between gap-4"><div><p className="font-medium">{p.nom}</p><p className="text-xs text-slate-500">{p.categorie} · {p.quantite_vendue} vendu(s)</p></div><strong>{Number(p.ca).toLocaleString("fr-FR")} FC</strong></div>)}</div> : <p className="py-12 text-center text-slate-500">Aucune vente enregistrée.</p>}</section>
    </div>
  </div>;
};
export default Rapports;

import { useEffect, useState } from "react";
import { PackageCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { produitAPI } from "@/api";
import EmptyState from "@/components/ui/EmptyState";
import { Produit } from "@/types";

const AlertesStock = () => {
  const navigate = useNavigate();
  const [produits, setProduits] = useState<Produit[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => { produitAPI.stockBas().then(({ data }) => setProduits(data.results ?? data)).catch(() => setError("Impossible de charger les alertes de stock.")).finally(() => setLoading(false)); }, []);
  return <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6"><div><h1 className="text-2xl font-bold text-slate-900">Alertes stock</h1><p className="mt-1 text-sm text-slate-500">Produits au seuil d’alerte ou en rupture</p></div>
    {error && <p role="alert" className="rounded-xl bg-rose-50 p-4 text-rose-700">{error}</p>}
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {loading ? <p className="py-12 text-center text-sm text-slate-500">Chargement des alertes…</p> : produits.length === 0 ? <EmptyState icon={PackageCheck} title="Aucun réapprovisionnement urgent" description="Tous les produits sont au-dessus de leur seuil d’alerte. Les nouveaux besoins apparaîtront ici." actionLabel="Consulter les produits" onAction={() => navigate("/produits")} /> : <div className="divide-y divide-slate-100">{produits.map((p) => <div key={p.id} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50"><div><p className="font-medium text-slate-900">{p.nom}</p><p className="mt-1 text-sm text-slate-500">{p.categorie || "Sans catégorie"} · seuil : {p.seuil_alerte}</p></div><span className={`h-fit rounded-full px-3 py-1 text-sm font-semibold ${p.quantite_stock === 0 ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"}`}>{p.quantite_stock === 0 ? "Rupture" : `Stock : ${p.quantite_stock}`}</span></div>)}</div>}
    </section>
  </div>;
};
export default AlertesStock;

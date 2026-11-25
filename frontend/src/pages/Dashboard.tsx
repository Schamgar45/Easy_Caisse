import { useEffect, useState } from "react";
import { ArrowUpRight, Banknote, PackageX, Plus, RefreshCw, ShoppingBag, Ticket, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { produitAPI, venteAPI } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { Produit, Statistiques, Vente, VenteParJour } from "@/types";

type DashboardSale = Pick<Vente, "id" | "numero_vente" | "date_vente" | "mode_paiement" | "statut" | "total_ttc">;
type StockAlert = Pick<Produit, "id" | "nom" | "categorie" | "quantite_stock" | "seuil_alerte">;
const money = (value: number | string | undefined) => `${Number(value || 0).toLocaleString("fr-FR")} FC`;
const exampleSales: Omit<DashboardSale, "date_vente">[] = [
  { id: -1, numero_vente: "VTE-000064", mode_paiement: "mobile_money", statut: "validee", total_ttc: 24500 },
  { id: -2, numero_vente: "VTE-000063", mode_paiement: "especes", statut: "validee", total_ttc: 12000 },
  { id: -3, numero_vente: "VTE-000062", mode_paiement: "carte", statut: "validee", total_ttc: 38750 },
  { id: -4, numero_vente: "VTE-000061", mode_paiement: "especes", statut: "validee", total_ttc: 9500 },
];
const exampleStock: StockAlert[] = [
  { id: -1, nom: "Huile de cuisson 1 L", categorie: "Épicerie", quantite_stock: 0, seuil_alerte: 8 },
  { id: -2, nom: "Riz parfumé 5 kg", categorie: "Céréales", quantite_stock: 0, seuil_alerte: 10 },
  { id: -3, nom: "Lait en poudre 500 g", categorie: "Produits laitiers", quantite_stock: 0, seuil_alerte: 5 },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Statistiques | null>(null);
  const [activity, setActivity] = useState<VenteParJour[]>([]);
  const [recentSales, setRecentSales] = useState<DashboardSale[]>([]);
  const [lowStock, setLowStock] = useState<StockAlert[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [statsResponse, activityResponse, salesResponse, stockResponse] = await Promise.all([
        venteAPI.stats(), venteAPI.ventesParJour(), venteAPI.list({ page: 1 }), produitAPI.stockBas(),
      ]);
      setStats(statsResponse.data);
      setActivity(activityResponse.data);
      setRecentSales((salesResponse.data.results ?? salesResponse.data).slice(0, 5));
      setLowStock((stockResponse.data.results ?? stockResponse.data).slice(0, 3));
    } catch (e: any) {
      setError(e.response ? `Erreur ${e.response.status} lors du chargement des données.` : "Le serveur de la boutique est momentanément inaccessible.");
    } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  if (error) return <div className="space-y-5"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-emerald-700">Vue d’ensemble</p><h1 className="mt-2 text-2xl font-bold text-slate-900">Tableau de bord</h1></div><section role="alert" className="rounded-xl border border-rose-200 bg-white p-6"><h2 className="font-semibold text-slate-900">Données indisponibles</h2><p className="mt-2 text-sm text-slate-600">{error}</p><button onClick={() => void load()} className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Réessayer</button></section></div>;
  if (loading || !stats) return <div className="space-y-5"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-emerald-700">Vue d’ensemble</p><h1 className="mt-2 text-2xl font-bold text-slate-900">Tableau de bord</h1></div><div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Chargement des données de la boutique…</div></div>;

  const demoMode = stats.total_ventes === 0;
  const demoActivity: VenteParJour[] = [142000, 158000, 169000, 177000, 190000, 205000, 204000].map((ca, index) => {
    const date = new Date(); date.setDate(date.getDate() - (6 - index));
    return { date: date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }), ca, nb_ventes: [7, 8, 8, 9, 10, 11, 11][index] };
  });
  const shownActivity = demoMode ? demoActivity : activity;
  const shownSales: DashboardSale[] = demoMode
    ? exampleSales.map((sale, index) => ({ ...sale, date_vente: new Date(Date.now() - index * 11 * 60_000).toISOString() }))
    : recentSales;
  const shownStock = demoMode ? exampleStock : lowStock;
  const metrics = [
    { label: "Chiffre d’affaires", value: demoMode ? money(1245000) : money(stats.chiffre_affaire), note: demoMode ? "Exemple · ventes cumulées" : "Ventes validées", icon: Banknote },
    { label: "Panier moyen", value: demoMode ? money(19450) : money(stats.panier_moyen), note: "Montant moyen par ticket", icon: Ticket },
    { label: "Ventes", value: demoMode ? "64 tickets" : `${stats.total_ventes} tickets`, note: demoMode ? "Exemple · activité boutique" : "Tickets validés", icon: ShoppingBag },
    { label: "Ruptures", value: demoMode ? "3 références" : `${stats.ruptures} référence${stats.ruptures === 1 ? "" : "s"}`, note: "Produits indisponibles", icon: PackageX },
  ];
  const maxRevenue = Math.max(...shownActivity.map((day) => Number(day.ca)), 1);
  const points = shownActivity.map((day, index) => `${shownActivity.length <= 1 ? 350 : 20 + index * (660 / (shownActivity.length - 1))},${160 - (Number(day.ca) / maxRevenue) * 130}`).join(" ");

  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-emerald-700">{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Tableau de bord</h1><p className="mt-1 text-sm text-slate-500">Bonjour {user?.first_name || user?.username || ""} · activité de votre boutique</p></div><div className="flex flex-wrap gap-2"><Link to="/produits" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-emerald-400"><Plus className="h-4 w-4" />Nouveau produit</Link><Link to="/point-de-vente" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"><ShoppingBag className="h-4 w-4" />Nouvelle vente</Link><button onClick={() => void load()} aria-label="Actualiser" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-600 hover:bg-slate-100"><RefreshCw className="h-4 w-4" /></button></div></div>
    {demoMode && <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">Aucune vente enregistrée : affichage d’un aperçu avec des données d’exemple.</p>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((metric, index) => <article key={metric.label} className={`rounded-2xl border bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,.04)] ${index === 0 ? "border-l-4 border-l-emerald-600" : "border-slate-200"}`}><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-slate-500">{metric.label}</p><p className="mt-4 text-2xl font-bold tracking-tight text-slate-900">{metric.value}</p></div><span className="rounded-xl bg-slate-100 p-2.5 text-emerald-700"><metric.icon className="h-5 w-5" /></span></div><p className="mt-3 text-xs text-slate-500">{metric.note}</p></article>)}</div>
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,.9fr)]">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-start justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-semibold text-slate-900">Évolution des ventes</h2><p className="mt-1 text-xs text-slate-500">Chiffre d’affaires · 7 derniers jours{demoMode ? " · exemple" : ""}</p></div><span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"><TrendingUp className="h-3.5 w-3.5 text-emerald-600" />7 jours</span></div>
        <div className="px-5 pb-4 pt-5">{shownActivity.length ? <><div className="h-48 w-full"><svg viewBox="0 0 700 180" preserveAspectRatio="none" className="h-full w-full"><defs><linearGradient id="salesFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#059669" stopOpacity=".15" /><stop offset="100%" stopColor="#059669" stopOpacity="0" /></linearGradient></defs>{shownActivity.map((day, index) => { const x = shownActivity.length <= 1 ? 350 : 20 + index * (660 / (shownActivity.length - 1)); const barHeight = Math.max(4, Number(day.ca) / maxRevenue * 95); return <rect key={`bar-${day.date}`} x={x - 14} y={170 - barHeight} width="28" height={barHeight} rx="4" fill="#f1f5f9" />; })}<polygon points={`20,170 ${points} 680,170`} fill="url(#salesFill)" /><polyline points={points} fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />{shownActivity.map((day, index) => { const x = shownActivity.length <= 1 ? 350 : 20 + index * (660 / (shownActivity.length - 1)); const y = 160 - (Number(day.ca) / maxRevenue) * 130; return <circle key={`point-${day.date}`} cx={x} cy={y} r="4" fill="white" stroke="#059669" strokeWidth="2" />; })}</svg></div><div className="mt-2 flex justify-between text-[11px] text-slate-500">{shownActivity.map((day) => <span key={day.date} className="text-center">{day.date}</span>)}</div></> : <div className="flex h-48 items-center justify-center text-sm text-slate-400">Aucune vente enregistrée sur cette période.</div>}</div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="font-semibold text-slate-900">À réapprovisionner</h2><p className="mt-1 text-xs text-slate-500">Articles sous le seuil minimum</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{demoMode ? exampleStock.length : stats.stock_bas} article(s)</span></div>
        <div className="mt-4 divide-y divide-slate-100">{shownStock.map((product) => <div key={product.id} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-800">{product.nom}</p><p className="mt-1 text-xs text-slate-500">{product.categorie || "Sans catégorie"}</p></div><div className="shrink-0 text-right"><p className="text-sm font-semibold text-rose-700">{product.quantite_stock} / {product.seuil_alerte}</p><p className="text-[10px] text-slate-400">en stock</p></div></div>)}{!shownStock.length && <p className="py-8 text-center text-sm text-slate-500">Aucun article sous le seuil.</p>}</div><Link to="/alertes-stock" className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-[#102044] px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">Voir les stocks <ArrowUpRight className="h-4 w-4" /></Link>
      </section>
    </div>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-semibold text-slate-900">Dernières transactions</h2><p className="mt-1 text-xs text-slate-500">{demoMode ? "Exemples de tickets récents" : "Ventes les plus récentes"}</p></div><Link to="/ventes" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">Toutes les ventes <ArrowUpRight className="inline h-3.5 w-3.5" /></Link></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left"><thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Ticket</th><th className="px-5 py-3">Heure</th><th className="px-5 py-3">Règlement</th><th className="px-5 py-3">Statut</th><th className="px-5 py-3 text-right">Montant</th></tr></thead><tbody className="divide-y divide-slate-100 text-sm">{shownSales.map((sale) => <tr key={sale.id} className="hover:bg-slate-50"><td className="px-5 py-3 font-semibold text-slate-900">#{sale.numero_vente}</td><td className="px-5 py-3 text-slate-600">{new Date(sale.date_vente).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</td><td className="px-5 py-3 text-slate-600">{sale.mode_paiement.replace("_", " ")}</td><td className="px-5 py-3"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{sale.statut === "validee" ? "Encaissée" : sale.statut}</span></td><td className="px-5 py-3 text-right font-semibold text-slate-800">{money(sale.total_ttc)}</td></tr>)}</tbody></table></div>
    </section>
  </div>;
};
export default Dashboard;

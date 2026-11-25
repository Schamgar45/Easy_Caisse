import { FormEvent, useEffect, useMemo, useState } from "react";
import { Download, Edit, Package, Plus, PlusCircle, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useLocation } from "react-router-dom";
import { produitAPI } from "@/api";
import { Produit } from "@/types";

type ProduitForm = Pick<Produit, "nom" | "description" | "prix_achat" | "prix_vente" | "quantite_stock" | "seuil_alerte" | "categorie" | "code_barre" | "actif">;
const emptyProduit: ProduitForm = { nom: "", description: "", prix_achat: 0, prix_vente: 0, quantite_stock: 0, seuil_alerte: 5, categorie: "", code_barre: "", actif: true };
const errorMessage = (error: any) => Object.values(error.response?.data || {}).flat().join(" ") || "Impossible de communiquer avec le serveur.";
const money = (value: number | string) => `${Number(value).toLocaleString("fr-FR")} FC`;

const Produits = () => {
  const location = useLocation();
  const [products, setProducts] = useState<Produit[]>([]);
  const [search, setSearch] = useState(() => new URLSearchParams(window.location.search).get("search") || "");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [category, setCategory] = useState("Toutes les catégories");
  const [stockFilter, setStockFilter] = useState("Tous");
  const [modal, setModal] = useState(false);
  const [stockModal, setStockModal] = useState(false);
  const [adjusting, setAdjusting] = useState<Produit | null>(null);
  const [stockQuantity, setStockQuantity] = useState("1");
  const [stockMovement, setStockMovement] = useState<"entree" | "sortie">("entree");
  const [editing, setEditing] = useState<Produit | null>(null);
  const [form, setForm] = useState<ProduitForm>(emptyProduit);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { const { data } = await produitAPI.list({ search, page }); setProducts(data.results ?? data); setTotalCount(data.count ?? data.length); setError(""); }
    catch (e) { setError(errorMessage(e)); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [search, page]);
  useEffect(() => { const nextSearch = new URLSearchParams(location.search).get("search") || ""; setSearch(nextSearch); setPage(1); }, [location.search]);
  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.categorie).filter(Boolean)),), [products]);
  const visible = products.filter((p) =>
    (category === "Toutes les catégories" || p.categorie === category) &&
    (stockFilter === "Tous" || (stockFilter === "Rupture" ? p.quantite_stock === 0 : stockFilter === "Faible" ? p.quantite_stock > 0 && p.quantite_stock <= p.seuil_alerte : p.quantite_stock > p.seuil_alerte)),
  );

  const openForm = (product?: Produit) => {
    setEditing(product ?? null);
    setForm(product ? { ...product, code_barre: product.code_barre || "" } : emptyProduit);
    setError(""); setModal(true);
  };
  const save = async (event: FormEvent) => {
    event.preventDefault(); setError("");
    const data = { ...form, code_barre: form.code_barre?.trim() || null };
    try { if (editing) await produitAPI.update(editing.id, data); else await produitAPI.create(data); setModal(false); await load(); }
    catch (e) { setError(errorMessage(e)); }
  };
  const remove = async (product: Produit) => {
    if (!window.confirm(`Supprimer « ${product.nom} » ?`)) return;
    try { await produitAPI.delete(product.id); await load(); } catch (e) { setError(errorMessage(e)); }
  };
  const adjustStock = async (event: FormEvent) => {
    event.preventDefault(); if (!adjusting) return;
    try { await produitAPI.ajusterStock(adjusting.id, Number(stockQuantity), stockMovement); setStockModal(false); setAdjusting(null); await load(); }
    catch (e) { setError(errorMessage(e)); }
  };
  const exportCsv = () => {
    const rows = [["Produit", "Catégorie", "Prix de vente", "Prix d'achat", "Stock", "Seuil d'alerte"], ...visible.map((p) => [p.nom, p.categorie, String(p.prix_vente), String(p.prix_achat), String(p.quantite_stock), String(p.seuil_alerte)])];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(";")).join("\r\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "inventaire-easycaisse.csv"; link.click(); URL.revokeObjectURL(url);
  };
  const setField = (key: keyof ProduitForm, value: string | number | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const pills = ["Tous", "Rupture", "Faible", "Normal"];
  const countFor = (status: string) => status === "Tous" ? products.length : status === "Rupture" ? products.filter((p) => p.quantite_stock === 0).length : status === "Faible" ? products.filter((p) => p.quantite_stock > 0 && p.quantite_stock <= p.seuil_alerte).length : products.filter((p) => p.quantite_stock > p.seuil_alerte).length;

  return <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-emerald-700">Inventaire & suivi des stocks</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Produits</h1><p className="mt-1 text-sm text-slate-500">{totalCount} référence(s) dans le catalogue</p></div><div className="flex gap-2"><Button variant="outline" onClick={exportCsv}><Download className="mr-2 h-4 w-4" />Exporter</Button><Button onClick={() => openForm()}><Plus className="mr-2 h-4 w-4" />Nouveau produit</Button></div></div>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 p-3 sm:p-4"><label className="relative min-w-[220px] max-w-md flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input placeholder="Filtrer par nom ou SKU…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-emerald-400 focus:bg-white" /></label><select aria-label="Filtrer par catégorie" value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600"><option>Toutes les catégories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3"><div className="flex flex-wrap gap-2">{pills.map((status) => <button key={status} onClick={() => setStockFilter(status)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${stockFilter === status ? "bg-emerald-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-emerald-300"}`}>{status} <span className="opacity-70">{countFor(status)}</span></button>)}</div><p className="text-xs text-slate-500">{visible.length} référence(s) affichée(s)</p></div>
      {error && <p role="alert" className="border-b border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left"><thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500"><tr>{["Produit", "Catégorie", "Prix de vente", "Prix d’achat", "Marge", "Stock", "État", ""].map((label) => <th key={label} className="px-4 py-3 font-semibold">{label}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-100 text-sm">{visible.map((p) => { const status = p.quantite_stock === 0 ? "Rupture" : p.quantite_stock <= p.seuil_alerte ? "Faible" : "Normal"; const margin = Number(p.prix_vente) - Number(p.prix_achat); return <tr key={p.id} className="transition hover:bg-slate-50">
          <td className="border-l-2 border-transparent px-4 py-3 hover:border-emerald-500"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-400"><Package className="h-4 w-4" /></span><div><p className="font-semibold text-slate-800">{p.nom}</p><p className="text-[11px] text-slate-400">{p.code_barre || "Sans code-barres"}</p></div></div></td><td className="px-4 py-3.5 text-slate-600">{p.categorie || "—"}</td><td className="px-4 py-3.5 font-semibold text-slate-800">{money(p.prix_vente)}</td><td className="px-4 py-3.5 text-slate-600">{money(p.prix_achat)}</td><td className="px-4 py-3.5 text-slate-600">{money(margin)}</td>
          <td className="px-4 py-3.5"><div className="flex items-center gap-2"><span className="font-medium text-slate-700">{p.quantite_stock} <span className="text-slate-400">/ {p.seuil_alerte}</span></span><span className="h-1.5 w-12 overflow-hidden rounded-full bg-slate-100"><span className={`block h-full rounded-full ${status === "Normal" ? "bg-emerald-500" : status === "Faible" ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${Math.min(100, p.seuil_alerte ? p.quantite_stock / (p.seuil_alerte * 2) * 100 : 100)}%` }} /></span></div></td>
          <td className="px-4 py-3.5"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${status === "Normal" ? "bg-emerald-100 text-emerald-800" : status === "Faible" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"}`}>{status === "Normal" ? "✓ Normal" : status === "Faible" ? "! Faible" : "× Rupture"}</span></td><td className="px-4 py-3.5 text-right whitespace-nowrap"><button aria-label="Ajuster le stock" title="Ajuster le stock" onClick={() => { setAdjusting(p); setStockQuantity("1"); setStockMovement("entree"); setError(""); setStockModal(true); }} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-emerald-700"><PlusCircle className="h-4 w-4" /></button><button aria-label="Modifier" onClick={() => openForm(p)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-emerald-700"><Edit className="h-4 w-4" /></button><button aria-label="Supprimer" onClick={() => void remove(p)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button></td>
        </tr>; })}{!loading && visible.length === 0 && <tr><td colSpan={8} className="p-10 text-center text-slate-500">Aucun produit ne correspond à ces filtres.</td></tr>}{loading && <tr><td colSpan={8} className="p-10 text-center text-slate-400">Chargement du catalogue…</td></tr>}</tbody>
      </table></div><footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-500"><span>Affichage de {totalCount === 0 ? 0 : (page - 1) * 20 + 1} à {Math.min(page * 20, totalCount)} sur {totalCount} référence(s)</span><div className="flex items-center gap-2"><button disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 disabled:opacity-40">Précédent</button><span className="rounded-md bg-emerald-600 px-2.5 py-1.5 font-semibold text-white">{page}</span><button disabled={page * 20 >= totalCount} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 disabled:opacity-40">Suivant</button></div></footer>
    </section>
    <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? "Modifier le produit" : "Nouveau produit"}><form onSubmit={save} className="max-h-[70vh] overflow-y-auto">
      {([ ["nom", "Nom du produit", "text"], ["categorie", "Catégorie", "text"], ["code_barre", "Code-barres / SKU", "text"], ["prix_achat", "Prix d’achat (FC)", "number"], ["prix_vente", "Prix de vente (FC)", "number"], ["quantite_stock", "Quantité en stock", "number"], ["seuil_alerte", "Seuil d’alerte", "number"] ] as const).map(([key, label, type]) => <Input key={key} label={label} type={type} min={type === "number" ? 0 : undefined} required={key === "nom" || key === "prix_vente"} value={form[key] as string | number} onChange={(e) => setField(key, type === "number" ? Number(e.target.value) : e.target.value)} />)}
      <label className="mb-4 block text-sm text-slate-700">Description<textarea className="mt-1 w-full rounded-xl border border-slate-200 p-3 focus:border-emerald-400 focus:outline-none" value={form.description} onChange={(e) => setField("description", e.target.value)} /></label>
      {error && <p role="alert" className="mb-3 text-sm text-rose-700">{error}</p>}<div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setModal(false)}>Annuler</Button><Button type="submit">Enregistrer</Button></div>
    </form></Modal>
    <Modal isOpen={stockModal} onClose={() => setStockModal(false)} title={`Ajuster le stock${adjusting ? ` · ${adjusting.nom}` : ""}`}><form onSubmit={adjustStock}>
      <label className="mb-4 block text-sm font-medium text-slate-700">Mouvement<select value={stockMovement} onChange={(e) => setStockMovement(e.target.value as "entree" | "sortie")} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3"><option value="entree">Entrée en stock</option><option value="sortie">Sortie de stock</option></select></label>
      <Input label="Quantité" type="number" min="1" required value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} />
      {adjusting && <p className="mb-4 text-xs text-slate-500">Stock actuel : {adjusting.quantite_stock} unité(s)</p>}{error && <p role="alert" className="mb-3 text-sm text-rose-700">{error}</p>}
      <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setStockModal(false)}>Annuler</Button><Button type="submit">Confirmer</Button></div>
    </form></Modal>
  </div>;
};
export default Produits;

import { Package, Plus } from "lucide-react";
import { Produit } from "@/types";

interface ProductCardProps { produit: Produit; onAdd: (produit: Produit) => void; inCart?: boolean; cartQty?: number }
const money = (value: number | string) => `${Number(value).toLocaleString("fr-FR")} FC`;
const ProductCard: React.FC<ProductCardProps> = ({ produit, onAdd, inCart = false, cartQty = 0 }) => {
  const outOfStock = produit.quantite_stock <= 0;
  const lowStock = !outOfStock && produit.quantite_stock <= produit.seuil_alerte;
  return <article className={`group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${inCart ? "border-emerald-500 ring-2 ring-emerald-100" : "border-slate-200 hover:border-emerald-200"}`}>
    <div className="relative m-2 flex h-24 items-center justify-center rounded-xl bg-slate-50 text-slate-300"><Package className="h-9 w-9" /><span className={`absolute bottom-2 left-2 rounded-full px-2 py-1 text-[10px] font-semibold ${outOfStock ? "bg-rose-100 text-rose-700" : lowStock ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-700"}`}>{outOfStock ? "Rupture" : `${produit.quantite_stock} en stock`}</span>{inCart && <span className="absolute right-2 top-2 rounded-full bg-emerald-700 px-2 py-1 text-[10px] font-bold text-white">× {cartQty}</span>}</div>
    <div className="px-3 pb-3 pt-1"><p className="truncate text-sm font-semibold text-slate-800" title={produit.nom}>{produit.nom}</p><p className="mt-0.5 truncate text-[11px] text-slate-400">{produit.code_barre || produit.categorie || "Produit"}</p>
      <div className="mt-2 flex items-center justify-between gap-2"><span className="text-sm font-bold text-slate-900">{money(produit.prix_vente)}</span><button aria-label={`Ajouter ${produit.nom} au panier`} onClick={() => onAdd(produit)} disabled={outOfStock || cartQty >= produit.quantite_stock} className="rounded-lg bg-emerald-600 p-1.5 text-white hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400"><Plus className="h-4 w-4" /></button></div>
    </div>
  </article>;
};
export { ProductCard };

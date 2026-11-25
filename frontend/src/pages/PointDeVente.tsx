import { useEffect, useMemo, useState } from "react";
import { Check, CircleAlert, Search, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { ProductCard } from "@/components/pos/ProductCard";
import { CartItem, CartItemLocal } from "@/components/pos/CartItem";
import { CartSummary } from "@/components/pos/CartSummary";
import { Client, Produit } from "@/types";
import { clientAPI, produitAPI, venteAPI } from "@/api";

const PointDeVente = () => {
  const [products, setProducts] = useState<Produit[]>([]); const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState(""); const [cart, setCart] = useState<CartItemLocal[]>([]);
  const [search, setSearch] = useState(""); const [category, setCategory] = useState("Tous");
  const [payment, setPayment] = useState("especes"); const [clientInfo, setClientInfo] = useState<{ nom: string; telephone: string } | undefined>();
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const loadProducts = async () => { try { const { data } = await produitAPI.list({ actif: true }); setProducts(data.results ?? data); setError(""); } catch { setError("Le catalogue n’a pas pu être chargé. Vérifiez la connexion au serveur."); } };
  useEffect(() => { void loadProducts(); clientAPI.list().then(({ data }) => setClients(data.results ?? data)).catch(() => undefined); }, []);
  const categories = useMemo(() => ["Tous", ...Array.from(new Set(products.map((p) => p.categorie).filter(Boolean)))], [products]);
  const filtered = products.filter((p) => (category === "Tous" || p.categorie === category) && `${p.nom} ${p.categorie} ${p.code_barre || ""}`.toLowerCase().includes(search.toLowerCase()));
  const subtotal = cart.reduce((sum, item) => sum + Number(item.produit.prix_vente) * item.quantite, 0); const tax = Math.trunc(subtotal * .18); const total = subtotal + tax;
  const add = (product: Produit) => { const current = cart.find((item) => item.produit.id === product.id); if (current && current.quantite >= product.quantite_stock) { setError(`Stock disponible pour ${product.nom} : ${product.quantite_stock}.`); return; } setError(""); setCart((items) => current ? items.map((item) => item.produit.id === product.id ? { ...item, quantite: item.quantite + 1 } : item) : [...items, { id: Date.now() + Math.random(), produit: product, quantite: 1 }]); };
  const changeQuantity = (item: CartItemLocal, quantity: number) => { if (quantity <= 0) { setCart((items) => items.filter((row) => row.id !== item.id)); return; } if (quantity > item.produit.quantite_stock) { setError(`Stock disponible pour ${item.produit.nom} : ${item.produit.quantite_stock}.`); return; } setCart((items) => items.map((row) => row.id === item.id ? { ...row, quantite: quantity } : row)); };
  const clearCart = () => { setCart([]); setClientId(""); setClientInfo(undefined); setError(""); };
  const checkout = async () => {
    if (!cart.length || loading) return; setLoading(true); setError("");
    try { await venteAPI.create({ mode_paiement: payment, client: clientId ? Number(clientId) : null, lignes: cart.map(({ produit, quantite }) => ({ produit: produit.id, quantite })) }); clearCart(); setPayment("especes"); await loadProducts(); }
    catch (e: any) { setError(Object.values(e.response?.data || {}).flat().join(" ") || "La vente n’a pas pu être enregistrée. Vérifiez le stock puis réessayez."); }
    finally { setLoading(false); }
  };

  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-emerald-700">Point de vente & encaissement</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Nouvelle vente</h1><p className="mt-1 text-sm text-slate-500">Sélectionnez les articles et encaissez le panier</p></div><div className="flex items-center gap-2"><button onClick={clearCart} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Vider le panier</button></div></div>
    {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center gap-2"><label className="relative min-w-[220px] flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input aria-label="Rechercher un produit" placeholder="Nom, catégorie ou code-barres…" value={search} onChange={(e) => setSearch(e.target.value)} className="mb-0 h-10 rounded-xl bg-slate-50 pl-9" /></label>
          <select aria-label="Sélectionner le client" value={clientId} onChange={(e) => { setClientId(e.target.value); const client = clients.find((c) => String(c.id) === e.target.value); setClientInfo(client ? { nom: `${client.prenom} ${client.nom}`, telephone: client.telephone } : undefined); }} className="h-10 max-w-52 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600"><option value="">Client comptoir</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.prenom} {client.nom}</option>)}</select>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition ${category === item ? "bg-emerald-700 text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"}`}>{item}</button>)}</div>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-4">{filtered.map((product) => <ProductCard key={product.id} produit={product} onAdd={add} inCart={cart.some((item) => item.produit.id === product.id)} cartQty={cart.find((item) => item.produit.id === product.id)?.quantite || 0} />)}{!filtered.length && <div className="col-span-full rounded-xl border border-dashed border-slate-200 py-14 text-center text-sm text-slate-400">{products.length ? "Aucun article ne correspond à cette recherche." : "Aucun produit disponible dans le catalogue."}</div>}</div>
      </section>
      <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-[84px]">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4"><div><div className="flex items-center gap-2"><ShoppingCart className="h-4 w-4 text-emerald-700" /><h2 className="font-semibold text-slate-900">Ticket en cours</h2></div><p className="mt-1 text-xs text-slate-500">{cart.reduce((sum, item) => sum + item.quantite, 0)} article(s)</p></div><button onClick={clearCart} disabled={!cart.length} className="text-xs font-medium text-emerald-700 hover:text-emerald-900 disabled:text-slate-300">Vider</button></div>
        <div className="max-h-[34vh] min-h-28 divide-y divide-slate-100 overflow-y-auto px-4">{cart.length ? cart.map((item) => <CartItem key={item.id} item={item} onQtyChange={changeQuantity} onRemove={(id) => setCart((items) => items.filter((row) => row.id !== id))} />) : <div className="flex h-28 flex-col items-center justify-center text-center text-slate-400"><ShoppingCart className="mb-2 h-5 w-5" /><p className="text-xs">Le ticket est vide</p></div>}</div>
        <div className="border-t border-slate-100 p-4"><CartSummary total={subtotal} tva={tax} totalTTC={total} modePaiement={payment} setModePaiement={setPayment} onValider={() => void checkout()} disabled={!cart.length || loading} clientInfo={clientInfo} />{loading && <p className="mt-2 flex items-center justify-center gap-2 text-xs text-emerald-700"><Check className="h-3.5 w-3.5" />Enregistrement de la vente…</p>}</div>
      </aside>
    </div>
  </div>;
};
export default PointDeVente;

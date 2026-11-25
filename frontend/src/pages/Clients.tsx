import { FormEvent, useEffect, useState } from "react";
import { Edit, Plus, Search, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { clientAPI } from "@/api";
import { Client } from "@/types";

type ClientForm = Pick<Client, "nom" | "prenom" | "email" | "telephone" | "adresse" | "ville">;
const initial: ClientForm = { nom: "", prenom: "", email: "", telephone: "", adresse: "", ville: "" };
const errorText = (error: any) => Object.values(error.response?.data || {}).flat().join(" ") || "Impossible de communiquer avec le serveur.";

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]); const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false); const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientForm>(initial); const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  const charger = async () => { setLoading(true); try { const { data } = await clientAPI.list({ search }); setClients(data.results ?? data); setError(""); } catch (e) { setError(errorText(e)); } finally { setLoading(false); } };
  useEffect(() => { void charger(); }, [search]);
  const ouvrir = (client?: Client) => { setEditing(client ?? null); setForm(client ? { nom: client.nom, prenom: client.prenom, email: client.email, telephone: client.telephone, adresse: client.adresse || "", ville: client.ville || "" } : initial); setError(""); setModal(true); };
  const enregistrer = async (e: FormEvent) => { e.preventDefault(); try { if (editing) await clientAPI.update(editing.id, form); else await clientAPI.create(form); setModal(false); await charger(); } catch (err) { setError(errorText(err)); } };
  const supprimer = async (client: Client) => { if (!window.confirm(`Supprimer ${client.prenom} ${client.nom} ?`)) return; try { await clientAPI.delete(client.id); await charger(); } catch (err) { setError(errorText(err)); } };
  return <div className="mx-auto w-full max-w-6xl space-y-6 px-4 animate-slide-up sm:px-6">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-bold text-slate-900">Clients</h1><p className="mt-1 text-sm text-slate-500">Fichier clients de la boutique</p></div><Button onClick={() => ouvrir()}><Plus className="mr-2 h-4 w-4" />Nouveau client</Button></div>
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 p-4 sm:p-5"><label className="relative block w-full max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input placeholder="Rechercher un client…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:bg-white" /></label></div>
      {error && <p role="alert" className="p-4 bg-rose-50 text-rose-700">{error}</p>}
      {loading ? <div className="px-4 py-12 text-center text-sm text-slate-500">Chargement des clients…</div> : clients.length === 0 ? <EmptyState icon={Users} title={search ? "Aucun résultat" : "Aucun client pour l’instant"} description={search ? "Modifie ta recherche ou crée une nouvelle fiche client." : "Ajoute les coordonnées de tes clients pour les retrouver facilement lors d’une vente."} actionLabel={search ? "Effacer la recherche" : "Créer un client"} onAction={() => search ? setSearch("") : ouvrir()} /> : <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-slate-50"><tr>{["Client", "Email", "Téléphone", "Ville", "Actions"].map((x) => <th key={x} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{x}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">
        {clients.map((c) => <tr key={c.id} className="hover:bg-slate-50"><td className="px-5 py-4 font-medium text-slate-800">{c.prenom} {c.nom}</td><td className="px-5 py-4 text-slate-600">{c.email || "—"}</td><td className="px-5 py-4 text-slate-600">{c.telephone || "—"}</td><td className="px-5 py-4 text-slate-600">{c.ville || "—"}</td><td className="px-5 py-4 text-right"><Button variant="outline" size="sm" aria-label="Modifier" onClick={() => ouvrir(c)}><Edit className="h-4 w-4" /></Button><Button variant="outline" size="sm" aria-label="Supprimer" className="ml-2" onClick={() => void supprimer(c)}><Trash2 className="h-4 w-4" /></Button></td></tr>)}
      </tbody></table></div>}
    </div>
    <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? "Modifier le client" : "Nouveau client"}><form onSubmit={enregistrer}>
      {([["prenom", "Prénom"], ["nom", "Nom"], ["email", "Email"], ["telephone", "Téléphone"], ["ville", "Ville"]] as const).map(([key, label]) => <Input key={key} label={label} type={key === "email" ? "email" : "text"} required={key === "nom" || key === "prenom"} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />)}
      <label className="block text-sm text-slate-700 mb-4">Adresse<textarea className="mt-1 w-full rounded-xl border border-slate-200 p-3" value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} /></label>
      {error && <p role="alert" className="text-sm text-rose-700 mb-3">{error}</p>}<div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setModal(false)}>Annuler</Button><Button type="submit">Enregistrer</Button></div>
    </form></Modal>
  </div>;
};
export default Clients;

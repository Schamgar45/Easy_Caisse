import { FormEvent, useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import { caisseAPI } from "@/api";
import { CaisseOuverte } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import EmptyState from "@/components/ui/EmptyState";

const Caisse = () => {
  const [caisse, setCaisse] = useState<CaisseOuverte | null>(null);
  const [historique, setHistorique] = useState<CaisseOuverte[]>([]);
  const [montant, setMontant] = useState("0");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const charger = async () => {
    setLoading(true);
    try { const [etat, hist] = await Promise.all([caisseAPI.etat(), caisseAPI.historique()]); setCaisse(etat.data.statut === "ouverte" ? etat.data : null); setHistorique(hist.data.results ?? hist.data); setError(""); }
    catch { setError("Impossible de charger l’état de caisse."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void charger(); }, []);
  const soumettre = async (event: FormEvent) => {
    event.preventDefault(); setError("");
    try { if (caisse) await caisseAPI.fermer({ montant_fermeture: Number(montant) }); else await caisseAPI.ouvrir({ montant_initial: Number(montant) }); setMontant("0"); await charger(); }
    catch (err: any) { setError(err.response?.data?.error || "Opération impossible."); }
  };
  const focusForm = () => document.getElementById("montant-caisse")?.focus();
  return <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6"><div><h1 className="text-2xl font-bold text-slate-900">Gestion de caisse</h1><p className="mt-1 text-sm text-slate-500">Ouverture, clôture et historique des sessions</p></div>
    {error && <p role="alert" className="rounded-xl bg-rose-50 p-4 text-rose-700">{error}</p>}
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1"><div className="flex items-center justify-between gap-3"><h2 className="font-semibold text-slate-900">{caisse ? "Caisse ouverte" : "Fond de caisse"}</h2><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${caisse ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{caisse ? "Ouverte" : "Fermée"}</span></div>
        {caisse && <p className="mt-3 text-xs leading-5 text-slate-500">Ouverte le {new Date(caisse.date_ouverture).toLocaleString("fr-FR")}<br />Fond initial : {Number(caisse.montant_initial).toLocaleString("fr-FR")} FC</p>}
        <form onSubmit={soumettre} className="mt-5"><Input id="montant-caisse" type="number" min="0" required label={caisse ? "Montant compté à la fermeture (FC)" : "Fond initial (FC)"} value={montant} onChange={(e) => setMontant(e.target.value)} /><Button type="submit" disabled={loading} className="w-full">{caisse ? "Fermer la caisse" : "Ouvrir la caisse"}</Button></form>
      </section>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-slate-900">Historique des sessions</h2><p className="mt-1 text-xs text-slate-500">Ouvertures et clôtures précédentes</p></div>
        {loading ? <p className="py-12 text-center text-sm text-slate-500">Chargement de l’historique…</p> : historique.length === 0 ? <EmptyState icon={Clock3} title="Aucune session enregistrée" description="Les ouvertures et clôtures de caisse apparaîtront ici." actionLabel="Ouvrir la caisse" onAction={focusForm} /> : <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left"><thead className="bg-slate-50"><tr className="text-xs font-semibold uppercase tracking-wide text-slate-500"><th className="px-4 py-3">Ouverture</th><th className="px-4 py-3">Fermeture</th><th className="px-4 py-3">Fond initial</th><th className="px-4 py-3">Fond final</th><th className="px-4 py-3">Statut</th></tr></thead><tbody className="divide-y divide-slate-100 text-sm">{historique.map((session) => <tr key={session.id} className="hover:bg-slate-50"><td className="px-4 py-3">{new Date(session.date_ouverture).toLocaleString("fr-FR")}</td><td className="px-4 py-3">{session.date_fermeture ? new Date(session.date_fermeture).toLocaleString("fr-FR") : "—"}</td><td className="px-4 py-3">{Number(session.montant_initial).toLocaleString("fr-FR")} FC</td><td className="px-4 py-3">{session.montant_fermeture == null ? "—" : `${Number(session.montant_fermeture).toLocaleString("fr-FR")} FC`}</td><td className="px-4 py-3">{session.statut}</td></tr>)}</tbody></table></div>}
      </section>
    </div>
  </div>;
};
export default Caisse;

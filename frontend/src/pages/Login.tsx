import { FormEvent, useState } from "react";
import { ArrowRight, LockKeyhole, Mail, ShoppingBasket, TicketCheck, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const errorMessage = (error: any) => {
  const data = error.response?.data;
  if (typeof data?.detail === "string") return data.detail;
  if (Array.isArray(data?.non_field_errors)) return data.non_field_errors.join(" ");
  if (data && typeof data === "object") return Object.values(data).flat().join(" ");
  return "Connexion impossible. Vérifiez vos identifiants puis réessayez.";
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSignup, setShowSignup] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      if (showSignup) await register({ username: email, email, password, role: "caissier" });
      else await login(email, password);
      navigate("/dashboard");
    } catch (e) { setError(errorMessage(e)); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[100dvh] overflow-x-hidden bg-[#e8e8e6] p-0 sm:p-3">
      <div className="relative mx-auto flex min-h-[100dvh] max-w-[1440px] flex-col overflow-x-hidden rounded-none bg-[#fcfcfa] px-5 text-[#111d38] shadow-[0_12px_35px_rgba(15,23,42,.15)] sm:min-h-[calc(100dvh-24px)] sm:rounded-[28px] sm:px-8 lg:px-12">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100/80 text-xs sm:text-[13px]">
          <div className="flex items-center gap-2.5 font-semibold"><span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#102044] text-[10px] font-bold text-white">EC</span>EasyCaisse</div>
          <a href="mailto:support@easycaisse.bi" className="text-slate-500 transition hover:text-[#214de0]">Besoin d’aide ?</a>
        </header>

        <section className="grid shrink-0 grid-cols-1 items-end gap-2 border-b border-slate-200/80 py-4 sm:grid-cols-[1fr_260px] sm:gap-6 sm:py-6 [@media(max-height:760px)]:py-3">
          <h1 className="login-entrance font-serif text-[clamp(1.9rem,min(6.1vw,8vh),4.2rem)] leading-[.91] tracking-[-.06em]">La journée<br className="hidden sm:block" /> commence <span className="font-serif italic text-[#2450e8]">ici.</span></h1>
<div className="absolute top-0 right-0 -rotate-6 w-[500px] h-[500px] bg-gradient-to-tr from-[#102044] to-transparent opacity-10 login-float opacity-50 mix-blend-multiply rounded-full filter blur-[80px] mask-[circle] mask-mode[luminance] mask-position[center] mask-size[cover]" aria-hidden="true" />
          <p className="hidden max-w-[260px] pb-1 text-xs leading-relaxed text-slate-500 sm:block sm:text-[13px]">Votre caisse, vos ventes et votre stock, réunis dès l’ouverture de la boutique.</p>
        </section>

        <main className="grid min-h-0 flex-1 grid-cols-1 content-center gap-5 py-5 sm:gap-6 sm:py-6 md:grid-cols-[minmax(270px,330px)_minmax(0,1fr)] md:items-center lg:grid-cols-[minmax(300px,360px)_minmax(0,1fr)_minmax(170px,200px)] lg:gap-10 [@media(max-height:760px)]:py-3">
          <section className="w-full max-w-[420px]">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[.22em] text-[#526b9b]">{showSignup ? "Créer un compte" : "Connexion"}</p>
            <form onSubmit={submit} autoComplete="off" className="space-y-4 login-entrance" style={{ animationDelay: "180ms" }}>
              <label className="block text-[13px] font-medium text-[#1c2a45]">
                <span className="mb-2 block">Adresse e-mail</span>
                <span className="flex h-11 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3.5 transition focus-within:border-[#2450e8] focus-within:ring-2 focus-within:ring-[#2450e8]/15">
                  <Mail className="h-4 w-4 shrink-0 text-slate-400"/>
                  <input autoComplete="off" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#111d38] outline-none"/>
                </span>
              </label>
              <label className="block text-[13px] font-medium text-[#1c2a45]">
                <span className="mb-2 flex items-baseline justify-between gap-3">
                  <span>Mot de passe</span>
                  {!showSignup && <button type="button" onClick={() => setError("Contactez votre administrateur pour réinitialiser le mot de passe.")} className="text-[12px] font-medium text-[#2450e8] hover:underline">Mot de passe oublié</button>}
                </span>
                <span className="flex h-11 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3.5 transition focus-within:border-[#2450e8] focus-within:ring-2 focus-within:ring-[#2450e8]/15">
                  <LockKeyhole className="h-4 w-4 shrink-0 text-slate-400"/>
                  <input autoComplete="off" type="password" required minLength={showSignup ? 6 : undefined} value={password} onChange={(e) => setPassword(e.target.value)} className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#111d38] outline-none"/>
                </span>
              </label>
              {error && <p role="alert" className="rounded-md bg-rose-50 px-3 py-2 text-xs leading-relaxed text-rose-600">{error}</p>}
              <button disabled={loading} type="submit" className="flex h-11 w-full items-center justify-between rounded-lg bg-[#2450e8] px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(36,80,232,.25)] transition hover:bg-[#183dca] disabled:opacity-60"><span>{loading ? "Patientez…" : showSignup ? "Créer mon compte" : "Ouvrir ma caisse"}</span><ArrowRight className="h-4 w-4"/></button>
            </form>
            <div className="my-3 flex items-center gap-3 text-[10px] uppercase tracking-widest text-slate-400"><span className="h-px flex-1 bg-slate-200"/>ou<span className="h-px flex-1 bg-slate-200"/></div>
            <p className="text-xs text-slate-500">{showSignup ? "Déjà inscrit ?" : "Nouveau commerçant ?"} <button onClick={() => {setShowSignup(!showSignup);setError("");}} className="font-semibold text-[#102044] underline underline-offset-2">{showSignup ? "Se connecter" : "Créer un compte"}</button></p>
          </section>

          <section aria-label="Aperçu de ticket et de produit" className="relative hidden h-[220px] login-entrance items-center justify-center sm:flex md:h-[250px] lg:h-[280px]" style={{animationDelay: "150ms"}}>
            <div className="absolute left-0 top-[20%] z-10 w-[31%] login-float" style={{animationDelay: "0.3s"}}>
              <div className="-rotate-2 rounded-md border border-slate-200 bg-white p-2.5 shadow-sm">
                <div className="mb-2 flex h-[64px] items-center justify-center rounded bg-[#f2f4f7] text-slate-400"><ShoppingBasket className="h-6 w-6"/></div>
                <p className="truncate text-[9px] font-medium">Carnet A5</p><div className="flex justify-between text-[8px] text-slate-500"><span>Stock 24</span><span>8,90 €</span></div>
              </div>
            </div>
            <div className="relative z-20 ml-8 w-[44%] login-float">
              <div className="rotate-[2deg] bg-white px-3.5 py-3.5 shadow-[0_12px_24px_rgba(15,23,42,.13)]">
                <div className="border-b border-dashed border-slate-200 pb-2 text-center"><p className="text-[7px] uppercase tracking-[.16em]">Papeterie Mercier</p><p className="text-[7px] text-slate-400">Ticket N° 0412 · 08:14</p></div>
                <div className="space-y-1.5 py-2.5 text-[8px]"><div className="flex justify-between"><span>1× Carnet A5</span><span>8 900 FC</span></div><div className="flex justify-between"><span>2× Stylo laiton</span><span>24 000 FC</span></div><div className="flex justify-between"><span>1× Encre bleue</span><span>6 500 FC</span></div></div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-[8px] font-bold"><span>TOTAL</span><span>39 400 FC</span></div>
                <div className="mt-2.5 flex h-6 items-end justify-center gap-[1px]">{Array.from({length:28},(_,i)=><i key={i} className="bg-[#102044]" style={{width:i%4===0?2:1,height:`${9+(i*13)%14}px`}}/>)}</div>
              </div>
            </div>
            <div className="absolute bottom-[2%] left-[20%] z-30 w-[30%] login-float" style={{animationDelay: "0.8s"}}>
              <div className="rounded-md border border-slate-200 bg-white p-2.5 shadow-sm">
                <p className="truncate text-[8px] font-medium">Stylo laiton</p><div className="mt-1.5 h-1.5 rounded bg-slate-100"><span className="block h-1.5 w-2/3 rounded bg-[#2450e8]"/></div><p className="mt-1.5 text-[8px] text-slate-500">3 restants</p>
              </div>
            </div>
          </section>

          <aside className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4 md:col-span-2 lg:col-span-1 lg:grid-cols-1 lg:gap-6 lg:border-l lg:border-t-0 lg:py-2 lg:pl-6">
            <div className="login-entrance" style={{animationDelay: "120ms"}}><p className="font-serif text-2xl leading-none">2 s</p><p className="mt-1.5 text-[11px] leading-snug text-slate-500">pour encaisser une vente</p></div>
            <div className="login-entrance" style={{animationDelay: "240ms"}}><Wallet className="mb-1.5 h-4 w-4 text-[#2450e8]"/><p className="font-serif text-xl leading-none">Temps réel</p><p className="mt-1.5 text-[11px] leading-snug text-slate-500">stock mis à jour à chaque ticket</p></div>
            <div className="login-entrance" style={{animationDelay: "360ms"}}><TicketCheck className="mb-1.5 h-4 w-4 text-[#2450e8]"/><p className="font-serif text-xl leading-none">NFE25</p><p className="mt-1.5 text-[11px] leading-snug text-slate-500">caisse certifiée conforme</p></div>
          </aside>
        </main>
        <footer className="hidden h-8 shrink-0 items-center justify-between border-t border-slate-100 text-[11px] text-slate-400 sm:flex"><span>© {new Date().getFullYear()} Easycaisse</span><span>Gestion de boutique</span></footer>
      </div>
    </div>
  );
}

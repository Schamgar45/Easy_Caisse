import React from "react";
import { CreditCard, Phone, Mail } from "lucide-react";

interface CartSummaryProps {
  total: number;
  tva: number;
  totalTTC: number;
  modePaiement: string;
  setModePaiement: (v: string) => void;
  onValider: () => void;
  disabled: boolean;
  clientInfo?: { nom: string; telephone: string };
}

const CartSummary: React.FC<CartSummaryProps> = ({
  total,
  tva,
  totalTTC,
  modePaiement,
  setModePaiement,
  onValider,
  disabled,
  clientInfo,
}) => {
  const modes = [
    { value: "especes", label: "Espèces", icon: <CreditCard className="w-4 h-4" /> },
    { value: "carte", label: "Carte bancaire", icon: <CreditCard className="w-4 h-4" /> },
    { value: "mobile_money", label: "Mobile Money", icon: <Phone className="w-4 h-4" /> },
    { value: "cheque", label: "Chèque", icon: <Mail className="w-4 h-4" /> },
  ];

  return (
    <div className="rounded-xl bg-white">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Récapitulatif</h3>

      {clientInfo && (
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="mb-1 text-sm font-medium text-slate-800">{clientInfo.nom}</p>
          <p className="text-xs text-slate-500">{clientInfo.telephone}</p>
        </div>
      )}

      <div className="mb-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Sous-total HT</span>
          <span className="font-medium text-slate-700">{total.toLocaleString("fr-FR")} FC</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">TVA (18%)</span>
          <span className="font-medium text-slate-700">{tva.toLocaleString("fr-FR")} FC</span>
        </div>
        <div className="flex justify-between border-t border-slate-100 pt-3 text-lg font-bold text-slate-900">
          <span>Total</span>
          <span>{totalTTC.toLocaleString("fr-FR")} FC</span>
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Mode de paiement</label>
        <div className="grid grid-cols-2 gap-2">
          {modes.map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => setModePaiement(mode.value)}
              className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-medium transition ${
                modePaiement === mode.value
                  ? "border-slate-300 bg-slate-100 text-slate-900"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {mode.icon}
              <span>{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onValider}
        disabled={disabled || totalTTC <= 0}
        className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
          disabled || totalTTC <= 0
          ? "bg-slate-200 text-slate-400"
            : "bg-emerald-700 text-white hover:bg-emerald-800 shadow-emerald-200/50"
        }`}
      >
        Valider la vente
      </button>
    </div>
  );
};

export { CartSummary };

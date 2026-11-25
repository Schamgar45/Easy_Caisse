import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Produit } from "@/types";

interface CartItemLocal {
  id: number;
  produit: Produit;
  quantite: number;
}

interface CartItemProps {
  item: CartItemLocal;
  onQtyChange: (item: CartItemLocal, qty: number) => void;
  onRemove: (id: number) => void;
}

const CartItem = ({ item, onQtyChange, onRemove }: CartItemProps) => {
  const { produit, quantite, id } = item;

  return (
    <div className="flex items-center justify-between gap-2 py-3 last:border-0">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <ShoppingBag className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-slate-800">{produit.nom}</p>
          <p className="truncate text-[10px] text-slate-500">{produit.categorie}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onQtyChange(item, quantite - 1)}
          className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="w-5 text-center text-xs font-medium text-slate-700">{quantite}</span>
        <button
          onClick={() => onQtyChange(item, quantite + 1)}
          className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
      <div className="min-w-[70px] text-right">
        <p className="text-xs font-semibold text-slate-900">
          {(produit.prix_vente * quantite).toLocaleString("fr-FR")} FC
        </p>
      </div>
      <button
        onClick={() => onRemove(id)}
        aria-label={`Retirer ${produit.nom} du ticket`}
        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export type { CartItemLocal };
export { CartItem };

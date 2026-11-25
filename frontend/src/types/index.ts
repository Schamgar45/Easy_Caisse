export interface User {
  id: number;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  role: "admin" | "caissier" | "gestionnaire";
  token?: string;
}

export interface Produit {
  id: number;
  nom: string;
  description: string;
  prix_achat: number;
  prix_vente: number;
  quantite_stock: number;
  seuil_alerte: number;
  categorie: string;
  code_barre?: string;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  created_at: string;
}

export interface LigneVente {
  id: number;
  produit: Produit;
  quantite: number;
  prix_unitaire: number;
  total: number;
}

export interface Vente {
  id: number;
  numero_vente: string;
  client?: Client;
  client_nom?: string;
  caissier: User;
  date_vente: string;
  total_ht: number;
  tva: number;
  total_ttc: number;
  mode_paiement: "especes" | "carte" | "mobile_money" | "cheque";
  statut: "brouillon" | "validee" | "annulee" | "remboursee";
  lignes: LigneVente[];
  created_at: string;
}

export interface CaisseOuverte {
  id: number;
  caissier: User;
  date_ouverture: string;
  montant_initial: number;
  montant_fermeture?: number;
  date_fermeture?: string;
  statut: "ouverte" | "fermee";
}

export interface Statistiques {
  total_ventes: number;
  chiffre_affaire: number;
  panier_moyen: number;
  produits_vendus: number;
  stock_bas: number;
  ruptures: number;
  ventes_aujourdhui: number;
  ca_aujourdhui: number;
}

export interface VenteParJour {
  date: string;
  nb_ventes: number;
  ca: number;
}

export interface TopProduit {
  nom: string;
  categorie: string;
  quantite_vendue: number;
  ca: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}

export interface ApiResponse<T> {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
}

export interface PaginationParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
}

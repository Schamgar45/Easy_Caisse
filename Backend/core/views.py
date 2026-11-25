from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta

from .models import Client, Produit, Vente, LigneVente, CaisseOuverte
from .serializers import (
    UserSerializer, UserLoginSerializer, UserRegisterSerializer,
    ClientSerializer, VenteSerializer, VenteCreateSerializer,
    CaisseOuverteSerializer, LigneVenteSerializer,
)

User = get_user_model()


class AuthViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    @action(detail=False, methods=["post"])
    def login(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)
        return Response({
            "token": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data,
        })

    @action(detail=False, methods=["post"])
    def register(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            "token": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def me(self, request):
        return Response(UserSerializer(request.user).data)

    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def logout(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            pass
        return Response({"detail": "Déconnexion réussie"})

    @action(detail=False, methods=["post"])
    def token_refresh(self, request):
        from rest_framework_simplejwt.views import TokenRefreshView
        view = TokenRefreshView.as_view()
        return view(request._request)


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Client.objects.all()
        search = self.request.query_params.get("search", None)
        if search:
            queryset = queryset.filter(
                models.Q(nom__icontains=search) |
                models.Q(prenom__icontains=search) |
                models.Q(email__icontains=search)
            )
        return queryset


from django.db import models


class ProduitViewSet(viewsets.ModelViewSet):
    queryset = Produit.objects.all()

    def get_serializer_class(self):
        from .serializers import ProduitSerializer
        return ProduitSerializer

    def get_queryset(self):
        queryset = Produit.objects.all()
        search = self.request.query_params.get("search", None)
        categorie = self.request.query_params.get("categorie", None)
        actif = self.request.query_params.get("actif", None)
        if search:
            queryset = queryset.filter(
                models.Q(nom__icontains=search) |
                models.Q(categorie__icontains=search) |
                models.Q(code_barre__icontains=search)
            )
        if categorie:
            queryset = queryset.filter(categorie=categorie)
        if actif is not None:
            queryset = queryset.filter(actif=actif.lower() == "true")
        return queryset

    @action(detail=False, methods=["get"], url_path="stock-bas")
    def stock_bas(self, request):
        produits = Produit.objects.filter(
            quantite_stock__lte=models.F("seuil_alerte")
        )
        from .serializers import ProduitSerializer
        serializer = ProduitSerializer(produits, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="ajuster-stock")
    def ajuster_stock(self, request, pk=None):
        produit = self.get_object()
        quantite = request.data.get("quantite")
        type_mvt = request.data.get("type")

        if quantite is None or type_mvt not in ("entree", "sortie"):
            return Response({"error": "quantite et type requis"}, status=400)

        quantite = int(quantite)
        if type_mvt == "entree":
            produit.quantite_stock += quantite
        else:
            if produit.quantite_stock < quantite:
                return Response({"error": "Stock insuffisant"}, status=400)
            produit.quantite_stock -= quantite
        produit.save()

        from .serializers import ProduitSerializer
        return Response(ProduitSerializer(produit).data)


class VenteViewSet(viewsets.ModelViewSet):
    queryset = Vente.objects.all()

    def get_serializer_class(self):
        if self.action == "create":
            return VenteCreateSerializer
        return VenteSerializer

    def get_queryset(self):
        queryset = Vente.objects.all()
        search = self.request.query_params.get("search", None)
        date_debut = self.request.query_params.get("date_debut", None)
        date_fin = self.request.query_params.get("date_fin", None)

        if search:
            queryset = queryset.filter(
                models.Q(numero_vente__icontains=search) |
                models.Q(client__nom__icontains=search)
            )
        if date_debut:
            queryset = queryset.filter(date_vente__gte=date_debut)
        if date_fin:
            queryset = queryset.filter(date_vente__lte=date_fin)

        return queryset

    @action(detail=True, methods=["post"])
    def annuler(self, request, pk=None):
        vente = self.get_object()
        if vente.statut == Vente.Statut.ANNULEE:
            return Response({"error": "Déjà annulée"}, status=400)
        for ligne in vente.lignes.all():
            ligne.produit.quantite_stock += ligne.quantite
            ligne.produit.save()
        vente.statut = Vente.Statut.ANNULEE
        vente.save()
        return Response(VenteSerializer(vente).data)

    @action(detail=True, methods=["get"])
    def ticket(self, request, pk=None):
        vente = self.get_object()
        serializer = VenteSerializer(vente)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def stats(self, request):
        aujourdhui = timezone.now().date()
        ventes_auj = Vente.objects.filter(
            date_vente__date=aujourdhui, statut=Vente.Statut.VALIDEE
        )
        total_ventes = Vente.objects.filter(statut=Vente.Statut.VALIDEE).count()
        ca_total = Vente.objects.filter(
            statut=Vente.Statut.VALIDEE
        ).aggregate(total=Sum("total_ttc"))["total"] or 0
        ca_auj = ventes_auj.aggregate(total=Sum("total_ttc"))["total"] or 0
        nb_ventes_auj = ventes_auj.count()
        panier_moyen = ca_total / total_ventes if total_ventes else 0
        produits_vendus = LigneVente.objects.filter(
            vente__statut=Vente.Statut.VALIDEE
        ).aggregate(total=Sum("quantite"))["total"] or 0
        stock_bas = Produit.objects.filter(
            quantite_stock__lte=models.F("seuil_alerte")
        ).count()
        ruptures = Produit.objects.filter(quantite_stock=0).count()

        return Response({
            "total_ventes": total_ventes,
            "chiffre_affaire": ca_total,
            "panier_moyen": round(panier_moyen),
            "produits_vendus": produits_vendus,
            "stock_bas": stock_bas,
            "ruptures": ruptures,
            "ventes_aujourdhui": nb_ventes_auj,
            "ca_aujourdhui": ca_auj,
        })

    @action(detail=False, methods=["get"], url_path="par-jour")
    def par_jour(self, request):
        aujourdhui = timezone.now()
        debut = aujourdhui - timedelta(days=6)
        ventes = Vente.objects.filter(
            date_vente__gte=debut,
            statut=Vente.Statut.VALIDEE,
        ).extra(select={"jour": "date(date_vente)"}).values("jour").annotate(
            nb_ventes=Count("id"),
            ca=Sum("total_ttc"),
        ).order_by("jour")

        result = []
        for i in range(7):
            jour = (aujourdhui - timedelta(days=6 - i)).date()
            jour_str = jour.strftime("%a")
            data = next(
                (v for v in ventes if v["jour"] == jour.strftime("%Y-%m-%d")),
                None,
            )
            result.append({
                "date": jour_str,
                "nb_ventes": data["nb_ventes"] if data else 0,
                "ca": data["ca"] if data else 0,
            })
        return Response(result)

    @action(detail=False, methods=["get"], url_path="top-produits")
    def top_produits(self, request):
        top = LigneVente.objects.filter(
            vente__statut=Vente.Statut.VALIDEE,
        ).values(
            "produit__nom",
            "produit__categorie",
        ).annotate(
            quantite_vendue=Sum("quantite"),
            ca=Sum("total"),
        ).order_by("-quantite_vendue")[:10]

        result = []
        for item in top:
            result.append({
                "nom": item["produit__nom"],
                "categorie": item["produit__categorie"] or "",
                "quantite_vendue": item["quantite_vendue"],
                "ca": item["ca"],
            })
        return Response(result)


class CaisseViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["post"])
    def ouvrir(self, request):
        montant_initial = request.data.get("montant_initial", 0)
        caisse = CaisseOuverte.objects.create(
            caissier=request.user,
            montant_initial=montant_initial,
        )
        return Response(CaisseOuverteSerializer(caisse).data)

    @action(detail=False, methods=["post"])
    def fermer(self, request):
        montant_fermeture = request.data.get("montant_fermeture", 0)
        caisse = CaisseOuverte.objects.filter(
            caissier=request.user, statut="ouverte"
        ).last()
        if not caisse:
            return Response({"error": "Aucune caisse ouverte"}, status=400)
        caisse.montant_fermeture = montant_fermeture
        caisse.date_fermeture = timezone.now()
        caisse.statut = "fermee"
        caisse.save()
        return Response(CaisseOuverteSerializer(caisse).data)

    @action(detail=False, methods=["get"])
    def etat(self, request):
        caisse = CaisseOuverte.objects.filter(
            caissier=request.user, statut="ouverte"
        ).last()
        if not caisse:
            return Response({"statut": "fermee"})
        return Response(CaisseOuverteSerializer(caisse).data)

    @action(detail=False, methods=["get"])
    def historique(self, request):
        caisses = CaisseOuverte.objects.filter(caissier=request.user)
        return Response(CaisseOuverteSerializer(caisses, many=True).data)

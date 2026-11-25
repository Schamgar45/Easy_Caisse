from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Client, Produit, Vente, LigneVente, CaisseOuverte

User = get_user_model()


class ProduitSerializer(serializers.ModelSerializer):
    stock_bas = serializers.BooleanField(read_only=True)

    class Meta:
        model = Produit
        fields = [
            "id", "nom", "description", "prix_achat", "prix_vente",
            "quantite_stock", "seuil_alerte", "categorie", "code_barre",
            "actif", "stock_bas", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "stock_bas"]


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "username", "first_name", "last_name", "role", "phone"]
        read_only_fields = ["id", "email"]


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        from django.contrib.auth import authenticate
        user = authenticate(username=attrs["email"], password=attrs["password"])
        if not user:
            raise serializers.ValidationError("Email ou mot de passe incorrect.")
        if not user.is_active:
            raise serializers.ValidationError("Compte désactivé.")
        attrs["user"] = user
        return attrs


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=User.Role.choices, default=User.Role.CAISSIER)

    class Meta:
        model = User
        fields = ["username", "email", "password", "first_name", "last_name", "role"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            role=validated_data.get("role", User.Role.CAISSIER),
        )
        return user


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ["id", "nom", "prenom", "email", "telephone", "adresse", "ville", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class LigneVenteSerializer(serializers.ModelSerializer):
    produit_nom = serializers.CharField(source="produit.nom", read_only=True)

    class Meta:
        model = LigneVente
        fields = ["id", "produit", "produit_nom", "quantite", "prix_unitaire", "total"]
        read_only_fields = ["id", "total"]


class VenteSerializer(serializers.ModelSerializer):
    lignes = LigneVenteSerializer(many=True, read_only=True)
    caissier_nom = serializers.CharField(source="caissier.username", read_only=True)
    client_nom = serializers.CharField(source="client.nom", read_only=True)

    class Meta:
        model = Vente
        fields = [
            "id", "numero_vente", "client", "client_nom", "caissier", "caissier_nom",
            "date_vente", "total_ht", "tva", "total_ttc",
            "mode_paiement", "statut", "lignes", "created_at",
        ]
        read_only_fields = ["id", "numero_vente", "date_vente", "total_ht", "tva", "total_ttc", "created_at"]


class LigneVenteCreateSerializer(serializers.Serializer):
    produit = serializers.PrimaryKeyRelatedField(queryset=Produit.objects.all())
    quantite = serializers.IntegerField(min_value=1)


class VenteCreateSerializer(serializers.ModelSerializer):
    lignes = LigneVenteCreateSerializer(many=True, allow_empty=False)

    class Meta:
        model = Vente
        fields = ["client", "mode_paiement", "lignes"]

    def create(self, validated_data):
        from django.db import transaction

        lignes_data = validated_data.pop("lignes")
        caissier = self.context["request"].user
        total_ht = 0

        with transaction.atomic():
            vente = Vente.objects.create(caissier=caissier, **validated_data)
            for ligne_data in lignes_data:
                produit = Produit.objects.select_for_update().get(pk=ligne_data["produit"].pk)
                quantite = ligne_data["quantite"]
                if not produit.actif:
                    raise serializers.ValidationError(f"{produit.nom} n'est plus disponible.")
                if produit.quantite_stock < quantite:
                    raise serializers.ValidationError(f"Stock insuffisant pour {produit.nom} (disponible : {produit.quantite_stock}).")
                prix_unitaire = produit.prix_vente
                total = prix_unitaire * quantite
                total_ht += total
                LigneVente.objects.create(vente=vente, produit=produit, quantite=quantite, prix_unitaire=prix_unitaire, total=total)
                produit.quantite_stock -= quantite
                produit.save(update_fields=["quantite_stock", "updated_at"])

            tva = int(total_ht * 0.18)
            vente.total_ht = total_ht
            vente.tva = tva
            vente.total_ttc = total_ht + tva
            vente.save(update_fields=["total_ht", "tva", "total_ttc"])
            return vente


class CaisseOuverteSerializer(serializers.ModelSerializer):
    caissier_nom = serializers.CharField(source="caissier.username", read_only=True)

    class Meta:
        model = CaisseOuverte
        fields = [
            "id", "caissier", "caissier_nom", "date_ouverture",
            "montant_initial", "montant_fermeture", "date_fermeture", "statut",
        ]
        read_only_fields = ["id", "date_ouverture", "date_fermeture"]

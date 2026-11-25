from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "admin", _("Administrateur")
        CAISSIER = "caissier", _("Caissier")
        GESTIONNAIRE = "gestionnaire", _("Gestionnaire")

    email = models.EmailField(_("email address"), unique=True)
    role = models.CharField(
        _("rôle"),
        max_length=20,
        choices=Role.choices,
        default=Role.CAISSIER,
    )
    phone = models.CharField(_("téléphone"), max_length=20, blank=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        verbose_name = _("utilisateur")
        verbose_name_plural = _("utilisateurs")

    def __str__(self):
        return self.email


class Client(models.Model):
    nom = models.CharField(_("nom"), max_length=100)
    prenom = models.CharField(_("prénom"), max_length=100)
    email = models.EmailField(_("email"), blank=True)
    telephone = models.CharField(_("téléphone"), max_length=20, blank=True)
    adresse = models.TextField(_("adresse"), blank=True)
    ville = models.CharField(_("ville"), max_length=100, blank=True)
    created_at = models.DateTimeField(_("créé le"), auto_now_add=True)
    updated_at = models.DateTimeField(_("modifié le"), auto_now=True)

    class Meta:
        verbose_name = _("client")
        verbose_name_plural = _("clients")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.prenom} {self.nom}"


class Produit(models.Model):
    nom = models.CharField(_("nom"), max_length=200)
    description = models.TextField(_("description"), blank=True)
    prix_achat = models.DecimalField(_("prix d'achat"), max_digits=12, decimal_places=0, default=0)
    prix_vente = models.DecimalField(_("prix de vente"), max_digits=12, decimal_places=0)
    quantite_stock = models.PositiveIntegerField(_("quantité en stock"), default=0)
    seuil_alerte = models.PositiveIntegerField(_("seuil d'alerte"), default=5)
    categorie = models.CharField(_("catégorie"), max_length=100, blank=True)
    code_barre = models.CharField(_("code-barres"), max_length=50, blank=True, unique=True, null=True)
    actif = models.BooleanField(_("actif"), default=True)
    created_at = models.DateTimeField(_("créé le"), auto_now_add=True)
    updated_at = models.DateTimeField(_("modifié le"), auto_now=True)

    class Meta:
        verbose_name = _("produit")
        verbose_name_plural = _("produits")
        ordering = ["-created_at"]

    def __str__(self):
        return self.nom

    @property
    def stock_bas(self):
        return self.quantite_stock <= self.seuil_alerte


class Vente(models.Model):
    class ModePaiement(models.TextChoices):
        ESPECES = "especes", _("Espèces")
        CARTE = "carte", _("Carte bancaire")
        MOBILE_MONEY = "mobile_money", _("Mobile Money")
        CHEQUE = "cheque", _("Chèque")

    class Statut(models.TextChoices):
        BROUILLON = "brouillon", _("Brouillon")
        VALIDEE = "validee", _("Validée")
        ANNULEE = "annulee", _("Annulée")
        REMBOURSEE = "remboursee", _("Remboursée")

    numero_vente = models.CharField(_("numéro de vente"), max_length=50, unique=True, blank=True)
    client = models.ForeignKey(
        Client,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="ventes",
        verbose_name=_("client"),
    )
    caissier = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="ventes",
        verbose_name=_("caissier"),
    )
    date_vente = models.DateTimeField(_("date de vente"), auto_now_add=True)
    total_ht = models.DecimalField(_("total HT"), max_digits=12, decimal_places=0, default=0)
    tva = models.DecimalField(_("TVA"), max_digits=12, decimal_places=0, default=0)
    total_ttc = models.DecimalField(_("total TTC"), max_digits=12, decimal_places=0, default=0)
    mode_paiement = models.CharField(
        _("mode de paiement"),
        max_length=20,
        choices=ModePaiement.choices,
        default=ModePaiement.ESPECES,
    )
    statut = models.CharField(
        _("statut"),
        max_length=20,
        choices=Statut.choices,
        default=Statut.VALIDEE,
    )
    created_at = models.DateTimeField(_("créé le"), auto_now_add=True)

    class Meta:
        verbose_name = _("vente")
        verbose_name_plural = _("ventes")
        ordering = ["-date_vente"]

    def __str__(self):
        return self.numero_vente or f"Vente #{self.pk}"

    def save(self, *args, **kwargs):
        if not self.numero_vente:
            last = Vente.objects.order_by("-id").first()
            num = (last.id + 1) if last else 1
            self.numero_vente = f"VTE-{num:06d}"
        super().save(*args, **kwargs)


class LigneVente(models.Model):
    vente = models.ForeignKey(
        Vente,
        on_delete=models.CASCADE,
        related_name="lignes",
        verbose_name=_("vente"),
    )
    produit = models.ForeignKey(
        Produit,
        on_delete=models.PROTECT,
        related_name="lignes_vente",
        verbose_name=_("produit"),
    )
    quantite = models.PositiveIntegerField(_("quantité"))
    prix_unitaire = models.DecimalField(_("prix unitaire"), max_digits=12, decimal_places=0)
    total = models.DecimalField(_("total"), max_digits=12, decimal_places=0)

    class Meta:
        verbose_name = _("ligne de vente")
        verbose_name_plural = _("lignes de vente")

    def __str__(self):
        return f"{self.produit.nom} x{self.quantite}"

    def save(self, *args, **kwargs):
        self.total = self.prix_unitaire * self.quantite
        super().save(*args, **kwargs)


class CaisseOuverte(models.Model):
    caissier = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="caisses",
        verbose_name=_("caissier"),
    )
    date_ouverture = models.DateTimeField(_("date d'ouverture"), auto_now_add=True)
    montant_initial = models.DecimalField(_("montant initial"), max_digits=12, decimal_places=0, default=0)
    montant_fermeture = models.DecimalField(
        _("montant de clôture"),
        max_digits=12,
        decimal_places=0,
        null=True,
        blank=True,
    )
    date_fermeture = models.DateTimeField(_("date de clôture"), null=True, blank=True)
    statut = models.CharField(
        _("statut"),
        max_length=20,
        choices=[("ouverte", "Ouverte"), ("fermee", "Fermée")],
        default="ouverte",
    )

    class Meta:
        verbose_name = _("caisse")
        verbose_name_plural = _("caisses")
        ordering = ["-date_ouverture"]

    def __str__(self):
        return f"Caisse {self.caissier.email} - {self.statut}"
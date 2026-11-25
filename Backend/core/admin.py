from django.contrib import admin
from .models import Client, Produit, Vente, LigneVente, CaisseOuverte

admin.site.register(Client)
admin.site.register(Produit)
admin.site.register(Vente)
admin.site.register(LigneVente)
admin.site.register(CaisseOuverte)
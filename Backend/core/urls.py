from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuthViewSet, ClientViewSet, ProduitViewSet, VenteViewSet, CaisseViewSet

router = DefaultRouter()
router.register(r"clients", ClientViewSet, basename="client")
router.register(r"produits", ProduitViewSet, basename="produit")
router.register(r"ventes", VenteViewSet, basename="vente")
router.register(r"caisse", CaisseViewSet, basename="caisse")

auth_urls = [
    path("login/", AuthViewSet.as_view({"post": "login"}), name="auth-login"),
    path("register/", AuthViewSet.as_view({"post": "register"}), name="auth-register"),
    path("me/", AuthViewSet.as_view({"get": "me"}), name="auth-me"),
    path("logout/", AuthViewSet.as_view({"post": "logout"}), name="auth-logout"),
    path("token/refresh/", AuthViewSet.as_view({"post": "token_refresh"}), name="auth-token-refresh"),
]

urlpatterns = [
    path("auth/", include(auth_urls)),
    path("", include(router.urls)),
]
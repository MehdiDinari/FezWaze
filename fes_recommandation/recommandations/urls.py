from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AxeRoutierViewSet, TempsTrajetViewSet, ItineraireViewSet, carte_axes, carte_itineraire_dynamique, liste_points

router = DefaultRouter()
router.register(r'axes', AxeRoutierViewSet)
router.register(r'temps', TempsTrajetViewSet)
router.register(r'itineraire', ItineraireViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('carte_axes/', carte_axes),
    path('itineraire_carte/<int:itineraire_id>/', carte_itineraire_dynamique),
    path('points/', liste_points),
]

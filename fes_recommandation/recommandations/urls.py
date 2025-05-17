from django.urls import path, include
from rest_framework.routers import DefaultRouter
<<<<<<< HEAD
from . import views

router = DefaultRouter()
router.register(r'axes', views.AxeRoutierViewSet)
router.register(r'temps', views.TempsTrajetViewSet)
router.register(r'itineraires', views.ItineraireViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/points/', views.liste_points, name='liste_points'),
    path('api/itineraires/calculer/', views.calculer_itineraire, name='calculer_itineraire'),
    path('api/trafic/prediction/', views.prediction_trafic, name='prediction_trafic'),
    path('carte/axes/', views.carte_axes, name='carte_axes'),
    path('carte/itineraire/<int:itineraire_id>/', views.carte_itineraire, name='carte_itineraire'),
    path('carte/itineraire_dynamique/<int:itineraire_id>/', views.carte_itineraire_dynamique, name='carte_itineraire_dynamique'),
=======
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
>>>>>>> 1379eb69c40c8b8b40e0a8f90dbd037ea1900970
]

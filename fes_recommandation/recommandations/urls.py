from django.urls import path, include
from rest_framework.routers import DefaultRouter
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
]

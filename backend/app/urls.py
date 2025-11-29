from django.contrib import admin
# Customize Django admin branding for local development
admin.site.site_header = "Tech with Ndimih"
admin.site.site_title = "Tech with Ndimih"
admin.site.index_title = "Site administration — Tech with Ndimih"
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('content.urls')),
    # JWT token endpoints
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

    # Serve built frontend assets (vite build) at /assets/ so index.html's
    # absolute asset paths ("/assets/...") resolve correctly during local dev.
    # The frontend build output lives at <repo>/frontend/dist/assets
    try:
        frontend_assets = settings.BASE_DIR.parent / 'frontend' / 'dist' / 'assets'
        urlpatterns += static('/assets/', document_root=str(frontend_assets))
    except Exception:
        # Best-effort: if BASE_DIR isn't a Path or path does not exist, skip
        pass

# Serve the SPA index (built frontend) for all non-API/admin paths so
# client-side routing (React Router) works when navigating directly to
# routes like /services or /portfolio/xyz. Exclude API, admin, media and
# assets paths so those are handled by Django or static file serving.
# IMPORTANT: This catch-all must come LAST so API routes are matched first
urlpatterns.append(
    re_path(r'^(?!api/|admin/|media/|assets/|static/).*$', TemplateView.as_view(template_name='index.html'))
)

"""
FILE:     backend/apps/enquiries/views.py
PURPOSE:  Enquiry endpoints.
  POST   /api/v1/enquiries/           — anyone can submit (AllowAny)
  GET    /api/v1/enquiries/           — agent sees own property enquiries; admin sees all
  GET    /api/v1/enquiries/<uuid>/    — detail (owner agent or admin)
  PATCH  /api/v1/enquiries/<uuid>/    — update status (owner agent or admin)
"""
from rest_framework import generics, permissions, filters, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Enquiry
from .serializers import EnquiryCreateSerializer, EnquirySerializer
from apps.accounts.permissions import IsAdmin


class EnquiryListCreateView(generics.ListCreateAPIView):

    filter_backends  = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["status", "property"]
    ordering_fields  = ["created_at"]
    ordering         = ["-created_at"]

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return EnquiryCreateSerializer
        return EnquirySerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Enquiry.objects.none()
        if user.role == "admin":
            return Enquiry.objects.select_related("property", "sender").all()
        # Agents see enquiries on their own listings only
        return Enquiry.objects.select_related("property", "sender").filter(
            property__listed_by=user
        )

    def create(self, request, *args, **kwargs):
        s = EnquiryCreateSerializer(
            data=request.data, context={"request": request}
        )
        s.is_valid(raise_exception=True)
        enquiry = s.save()
        return Response(
            EnquirySerializer(enquiry).data,
            status=status.HTTP_201_CREATED,
        )


class EnquiryDetailView(generics.RetrieveUpdateAPIView):
    serializer_class   = EnquirySerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names  = ["get", "patch"]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return Enquiry.objects.all()
        return Enquiry.objects.filter(property__listed_by=user)
from django.contrib import admin
from .models import Enquiry

@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    list_display  = ["sender_name", "sender_email", "property", "status", "created_at"]
    list_filter   = ["status"]
    search_fields = ["sender_name", "sender_email", "message"]
    readonly_fields = ["created_at", "updated_at"]
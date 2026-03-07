"""Auto-generated initial migration for enquiries app."""
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("properties", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Enquiry",
            fields=[
                ("id",           models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                ("sender_name",  models.CharField(max_length=150)),
                ("sender_email", models.EmailField()),
                ("sender_phone", models.CharField(blank=True, max_length=30)),
                ("message",      models.TextField()),
                ("status",       models.CharField(
                    choices=[("new","New"),("read","Read"),("replied","Replied"),("archived","Archived")],
                    default="new", max_length=15,
                )),
                ("created_at",   models.DateTimeField(auto_now_add=True)),
                ("updated_at",   models.DateTimeField(auto_now=True)),
                ("property",     models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="enquiries",
                    to="properties.property",
                )),
                ("sender",       models.ForeignKey(
                    blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name="enquiries_sent",
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={"db_table": "enquiries", "ordering": ["-created_at"]},
        ),
        migrations.AddIndex(
            model_name="enquiry",
            index=models.Index(fields=["property", "status"], name="enquiry_prop_status_idx"),
        ),
        migrations.AddIndex(
            model_name="enquiry",
            index=models.Index(fields=["sender_email"], name="enquiry_email_idx"),
        ),
    ]
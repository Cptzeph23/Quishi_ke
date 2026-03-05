"""
FILE:     backend/apps/properties/management/commands/seed_amenities.py
PURPOSE:  Management command to populate the amenities table with default values.
USAGE:    python manage.py seed_amenities
          Run this once after `python manage.py migrate`
"""
from django.core.management.base import BaseCommand
from apps.properties.models import Amenity


AMENITIES = [
    ("WiFi",              "wifi"),
    ("Parking",           "car"),
    ("Gym",               "dumbbell"),
    ("Swimming Pool",     "waves"),
    ("24/7 Security",     "shield"),
    ("Elevator",          "arrow-up"),
    ("Balcony",           "home"),
    ("Air Conditioning",  "wind"),
    ("Rooftop Access",    "star"),
    ("Pet Friendly",      "heart"),
    ("CCTV",              "camera"),
    ("Generator",         "zap"),
    ("Water Tank",        "droplets"),
    ("Furnished",         "sofa"),
    ("Garden",            "trees"),
]


class Command(BaseCommand):
    help = "Seed the amenities table with default property amenity options."

    def handle(self, *args, **options):
        created_count = 0
        for name, icon in AMENITIES:
            _, created = Amenity.objects.get_or_create(
                name=name,
                defaults={"icon": icon},
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"  ✓ Created: {name}"))
            else:
                self.stdout.write(f"  – Already exists: {name}")

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone. {created_count} new amenities created, "
                f"{len(AMENITIES) - created_count} already existed."
            )
        )
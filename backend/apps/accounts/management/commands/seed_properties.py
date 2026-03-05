"""
FILE:     backend/apps/properties/management/commands/seed_properties.py
PURPOSE:  Seed realistic demo property listings for local development.
          Requires seed_users and seed_amenities to have been run first.
USAGE:    python manage.py seed_properties
          python manage.py seed_properties --reset   ← wipe and re-seed
"""
from decimal import Decimal
from django.core.management.base import BaseCommand
from apps.accounts.models import User
from apps.properties.models import Amenity, Property


LISTINGS = [
    {
        "title":         "Modern 2-Bed Apartment in Westlands",
        "description":   "A bright, fully-furnished apartment with floor-to-ceiling windows and stunning city views. Minutes from Westgate Mall and major corporate offices.",
        "property_type": "apartment",
        "address":       "14 Ring Road, Westlands",
        "city":          "Nairobi",
        "neighborhood":  "Westlands",
        "floor_number":  5,
        "house_number":  "5A",
        "bedrooms":      2,
        "bathrooms":     2,
        "area_sqm":      Decimal("85.00"),
        "price":         Decimal("120000.00"),
        "is_negotiable": True,
        "status":        "available",
        "is_featured":   True,
        "amenities":     ["WiFi", "Parking", "Gym", "Elevator", "Air Conditioning"],
    },
    {
        "title":         "Spacious 4-Bed Family Home in Karen",
        "description":   "Elegant family home set on a lush half-acre lot in the leafy Karen suburb. Features a large garden, servants quarters, and double garage.",
        "property_type": "house",
        "address":       "Karen Hardy Estate, House 7",
        "city":          "Nairobi",
        "neighborhood":  "Karen",
        "floor_number":  0,
        "house_number":  "7",
        "bedrooms":      4,
        "bathrooms":     3,
        "area_sqm":      Decimal("320.00"),
        "price":         Decimal("580000.00"),
        "is_negotiable": False,
        "status":        "available",
        "is_featured":   True,
        "amenities":     ["Parking", "24/7 Security", "Garden", "CCTV"],
    },
    {
        "title":         "Executive Penthouse, Upper Hill",
        "description":   "The crown jewel of Upper Hill. Private rooftop terrace, smart home automation, private elevator access, and panoramic views of Nairobi National Park.",
        "property_type": "penthouse",
        "address":       "Upper Hill Towers, Top Floor",
        "city":          "Nairobi",
        "neighborhood":  "Upper Hill",
        "floor_number":  22,
        "house_number":  "PH1",
        "bedrooms":      4,
        "bathrooms":     4,
        "area_sqm":      Decimal("420.00"),
        "price":         Decimal("1200000.00"),
        "is_negotiable": False,
        "status":        "available",
        "is_featured":   True,
        "amenities":     ["WiFi", "Parking", "Gym", "Swimming Pool", "Rooftop Access",
                          "24/7 Security", "Elevator", "Air Conditioning", "CCTV"],
    },
    {
        "title":         "Cosy Studio in Kilimani",
        "description":   "Perfect for young professionals. Fully serviced studio with built-in wardrobe, modern kitchenette, and access to a rooftop lounge.",
        "property_type": "studio",
        "address":       "Argwings Kodhek Road, Block C",
        "city":          "Nairobi",
        "neighborhood":  "Kilimani",
        "floor_number":  2,
        "house_number":  "C4",
        "bedrooms":      1,
        "bathrooms":     1,
        "area_sqm":      Decimal("38.00"),
        "price":         Decimal("45000.00"),
        "is_negotiable": True,
        "status":        "available",
        "is_featured":   False,
        "amenities":     ["WiFi", "Elevator", "Air Conditioning", "Rooftop Access"],
    },
    {
        "title":         "Grade-A Office Space, Upperhill",
        "description":   "Open-plan office floor suitable for 40–60 staff. Fibre-ready, raised floors, 24/7 access control, and underground parking for 10 vehicles.",
        "property_type": "office",
        "address":       "Hospital Road, Upperhill",
        "city":          "Nairobi",
        "neighborhood":  "Upper Hill",
        "floor_number":  8,
        "house_number":  "801",
        "bedrooms":      0,
        "bathrooms":     4,
        "area_sqm":      Decimal("600.00"),
        "price":         Decimal("350000.00"),
        "is_negotiable": True,
        "status":        "available",
        "is_featured":   False,
        "amenities":     ["WiFi", "Parking", "Elevator", "24/7 Security", "CCTV",
                          "Generator", "Air Conditioning"],
    },
    {
        "title":         "3-Bed Apartment, Lavington",
        "description":   "Quiet residential apartment in sought-after Lavington. Secure compound, borehole water supply, and backup generator.",
        "property_type": "apartment",
        "address":       "James Gichuru Road, Lavington",
        "city":          "Nairobi",
        "neighborhood":  "Lavington",
        "floor_number":  3,
        "house_number":  "3B",
        "bedrooms":      3,
        "bathrooms":     2,
        "area_sqm":      Decimal("140.00"),
        "price":         Decimal("185000.00"),
        "is_negotiable": True,
        "status":        "available",
        "is_featured":   True,
        "amenities":     ["Parking", "24/7 Security", "Generator", "Water Tank", "CCTV"],
    },
    {
        "title":         "Compact 1-Bed, Ngong Road",
        "description":   "Affordable and well-maintained apartment ideal for a single professional or young couple. Close to bus routes and shopping centres.",
        "property_type": "apartment",
        "address":       "Ngong Road, Prestige Plaza",
        "city":          "Nairobi",
        "neighborhood":  "Ngong Road",
        "floor_number":  1,
        "house_number":  "1C",
        "bedrooms":      1,
        "bathrooms":     1,
        "area_sqm":      Decimal("52.00"),
        "price":         Decimal("55000.00"),
        "is_negotiable": False,
        "status":        "available",
        "is_featured":   False,
        "amenities":     ["WiFi", "Parking"],
    },
    {
        "title":         "Furnished Studio, Kilimani",
        "description":   "Fully furnished and serviced studio apartment. Ideal for short-stay or expatriate professionals. Weekly housekeeping included.",
        "property_type": "studio",
        "address":       "Kindaruma Road, Kilimani",
        "city":          "Nairobi",
        "neighborhood":  "Kilimani",
        "floor_number":  4,
        "house_number":  "4F",
        "bedrooms":      1,
        "bathrooms":     1,
        "area_sqm":      Decimal("42.00"),
        "price":         Decimal("65000.00"),
        "is_negotiable": False,
        "status":        "rented",
        "is_featured":   False,
        "amenities":     ["WiFi", "Air Conditioning", "Elevator", "Furnished"],
    },
    {
        "title":         "5-Bed Villa with Pool, Runda",
        "description":   "Luxury Runda villa on a 1-acre plot. Heated swimming pool, staff quarters, outdoor entertainment area, and borehole.",
        "property_type": "house",
        "address":       "Runda Close, House 12",
        "city":          "Nairobi",
        "neighborhood":  "Runda",
        "floor_number":  0,
        "house_number":  "12",
        "bedrooms":      5,
        "bathrooms":     5,
        "area_sqm":      Decimal("580.00"),
        "price":         Decimal("2500000.00"),
        "is_negotiable": True,
        "status":        "available",
        "is_featured":   True,
        "amenities":     ["Swimming Pool", "Parking", "24/7 Security", "Garden",
                          "CCTV", "Generator", "Water Tank"],
    },
    {
        "title":         "2-Bed Apartment, Mombasa Road",
        "description":   "Modern apartment complex near JKIA with excellent transport links. Fitted kitchen, ample storage, and children's play area.",
        "property_type": "apartment",
        "address":       "Mombasa Road, Gateway Park",
        "city":          "Nairobi",
        "neighborhood":  "Mlolongo",
        "floor_number":  2,
        "house_number":  "2D",
        "bedrooms":      2,
        "bathrooms":     1,
        "area_sqm":      Decimal("78.00"),
        "price":         Decimal("75000.00"),
        "is_negotiable": True,
        "status":        "available",
        "is_featured":   False,
        "amenities":     ["Parking", "24/7 Security", "CCTV"],
    },
]


class Command(BaseCommand):
    help = (
        "Seed demo property listings. "
        "Run seed_users and seed_amenities first."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete all existing properties before seeding.",
        )

    def handle(self, *args, **options):
        # ── Guard: need at least one agent ────────────────────────────────────
        agent = User.objects.filter(role=User.Role.AGENT).first()
        if not agent:
            self.stdout.write(self.style.ERROR(
                "\n✖  No agent users found. Run `python manage.py seed_users` first.\n"
            ))
            return

        if options["reset"]:
            deleted, _ = Property.objects.all().delete()
            self.stdout.write(f"  🗑  Deleted {deleted} existing properties.\n")

        # Pre-load amenity lookup to avoid N+1 queries
        amenity_map = {a.name: a for a in Amenity.objects.all()}
        if not amenity_map:
            self.stdout.write(self.style.WARNING(
                "  ⚠  No amenities found. Run `python manage.py seed_amenities` first.\n"
                "     Properties will be created without amenities.\n"
            ))

        agents = list(User.objects.filter(role=User.Role.AGENT))
        created_count = 0

        for i, data in enumerate(LISTINGS):
            amenity_names = data.pop("amenities", [])
            # Round-robin assign listings to available agents
            data["listed_by"] = agents[i % len(agents)]

            prop, created = Property.objects.get_or_create(
                title   = data["title"],
                city    = data["city"],
                defaults = data,
            )

            if created:
                # Attach amenities
                for name in amenity_names:
                    if name in amenity_map:
                        prop.amenities.add(amenity_map[name])
                created_count += 1
                featured_tag = " ⭐" if prop.is_featured else ""
                self.stdout.write(
                    self.style.SUCCESS(
                        f"  ✓  [{prop.property_type:10s}] {prop.title}{featured_tag}"
                    )
                )
            else:
                self.stdout.write(f"  –  Already exists: {prop.title}")

        self.stdout.write(self.style.SUCCESS(
            f"\nDone. {created_count} properties seeded "
            f"({len(LISTINGS) - created_count} already existed).\n"
        ))
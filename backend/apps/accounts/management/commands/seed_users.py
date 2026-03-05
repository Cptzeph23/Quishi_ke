"""
FILE:     backend/apps/accounts/management/commands/seed_users.py
PURPOSE:  Seed demo users for local development and staging environments.
          Creates one admin, two agents, and three clients with known passwords.
USAGE:    python manage.py seed_users
WARNING:  Never run this in production — demo passwords are intentionally weak.
"""
from django.core.management.base import BaseCommand
from apps.accounts.models import User


DEMO_USERS = [
    # (email, full_name, phone, role, password, is_staff)
    (
        "admin@smartrealty.dev",
        "Admin User",
        "+254 700 000 001",
        User.Role.ADMIN,
        "Admin@1234",
        True,
    ),
    (
        "agent1@smartrealty.dev",
        "Alice Kamau",
        "+254 700 000 002",
        User.Role.AGENT,
        "Agent@1234",
        False,
    ),
    (
        "agent2@smartrealty.dev",
        "Brian Otieno",
        "+254 700 000 003",
        User.Role.AGENT,
        "Agent@1234",
        False,
    ),
    (
        "client1@smartrealty.dev",
        "Carol Wanjiku",
        "+254 700 000 004",
        User.Role.CLIENT,
        "Client@1234",
        False,
    ),
    (
        "client2@smartrealty.dev",
        "David Mwangi",
        "+254 700 000 005",
        User.Role.CLIENT,
        "Client@1234",
        False,
    ),
    (
        "client3@smartrealty.dev",
        "Eva Njeri",
        "+254 700 000 006",
        User.Role.CLIENT,
        "Client@1234",
        False,
    ),
]


class Command(BaseCommand):
    help = "Seed demo users for local development. DO NOT run in production."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete all existing demo users before seeding.",
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING(
            "\n⚠️  Seeding demo users — for development only!\n"
        ))

        if options["reset"]:
            emails = [u[0] for u in DEMO_USERS]
            deleted, _ = User.objects.filter(email__in=emails).delete()
            self.stdout.write(f"  🗑  Deleted {deleted} existing demo users.\n")

        created_count = 0
        for email, full_name, phone, role, password, is_staff in DEMO_USERS:
            if User.objects.filter(email=email).exists():
                self.stdout.write(f"  –  Already exists: {email}")
                continue

            User.objects.create_user(
                email          = email,
                full_name      = full_name,
                phone          = phone,
                role           = role,
                password       = password,
                is_staff       = is_staff,
                is_superuser   = is_staff,
                email_verified = True,
            )
            created_count += 1
            self.stdout.write(
                self.style.SUCCESS(f"  ✓  Created [{role:6s}]: {email}")
            )

        self.stdout.write(self.style.SUCCESS(
            f"\nDone. {created_count} demo users created.\n"
        ))
        self.stdout.write("  Demo credentials:")
        self.stdout.write("    Admin  → admin@smartrealty.dev  / Admin@1234")
        self.stdout.write("    Agent  → agent1@smartrealty.dev / Agent@1234")
        self.stdout.write("    Client → client1@smartrealty.dev / Client@1234\n")
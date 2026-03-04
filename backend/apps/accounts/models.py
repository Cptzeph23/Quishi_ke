"""
FILE:     backend/apps/accounts/models.py
PURPOSE:  Custom User model with UUID primary key and role-based access control
ROLES:    admin → full platform access
          agent → create/manage property listings
          client → browse, save, chat
"""
import uuid
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email address is required")
        email = self.normalize_email(email)
        user  = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault("role",         User.Role.ADMIN)
        extra_fields.setdefault("is_staff",     True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        ADMIN  = "admin",  "Admin"
        AGENT  = "agent",  "Agent"
        CLIENT = "client", "Client"

    # ── Identity ──────────────────────────────────────────────────────────────
    id        = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email     = models.EmailField(unique=True)
    full_name = models.CharField(max_length=150)
    phone     = models.CharField(max_length=20, blank=True)
    avatar    = models.ImageField(upload_to="avatars/", null=True, blank=True)

    # ── Roles & Flags ─────────────────────────────────────────────────────────
    role           = models.CharField(max_length=10, choices=Role.choices, default=Role.CLIENT)
    is_active      = models.BooleanField(default=True)
    is_staff       = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False)

    # ── Audit ─────────────────────────────────────────────────────────────────
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    created_at    = models.DateTimeField(auto_now_add=True)
    updated_at    = models.DateTimeField(auto_now=True)

    USERNAME_FIELD  = "email"
    REQUIRED_FIELDS = ["full_name"]
    objects = UserManager()

    class Meta:
        db_table = "users"
        indexes  = [
            models.Index(fields=["email"]),
            models.Index(fields=["role"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"{self.full_name} <{self.email}> [{self.role}]"

    # ── Convenience properties ─────────────────────────────────────────────────
    @property
    def is_admin(self):  return self.role == self.Role.ADMIN

    @property
    def is_agent(self):  return self.role == self.Role.AGENT

    @property
    def is_client(self): return self.role == self.Role.CLIENT
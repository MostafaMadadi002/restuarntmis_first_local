from decimal import Decimal
from django.db import models
from apps.restaurants.models import Restaurant

class KitchenStation(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='kitchen_stations')
    name = models.CharField(max_length=80)
    code = models.CharField(max_length=30)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'catalog_kitchenstation'

    def __str__(self):
        return f"{self.name} ({self.code})"

class Category(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100)
    description = models.TextField(blank=True, default='')
    image = models.ImageField(upload_to='menu_categories/', null=True, blank=True)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'catalog_category'
        ordering = ['display_order', 'id']

    def __str__(self):
        return self.name

class CourseType(models.TextChoices):
    COURSE_1 = 'COURSE_1', 'Course 1 (Starters & Beverages)'
    COURSE_2 = 'COURSE_2', 'Course 2 (Main Course)'
    COURSE_3 = 'COURSE_3', 'Course 3 (Desserts & After)'

class MenuItem(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='menu_items')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='items')
    station = models.ForeignKey(KitchenStation, on_delete=models.SET_NULL, null=True, blank=True, related_name='items')
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True, default='')
    image = models.ImageField(upload_to='menu_items/', null=True, blank=True)
    base_price = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    default_course = models.CharField(max_length=20, choices=CourseType.choices, default=CourseType.COURSE_2)
    is_available = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'catalog_menuitem'
        indexes = [
            models.Index(fields=['category', 'is_active', 'is_available']),
        ]

    def __str__(self):
        return self.name

class MenuItemPrice(models.Model):
    """Immutable price snapshot history."""
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, related_name='price_history')
    price = models.DecimalField(max_digits=12, decimal_places=2)
    effective_from = models.DateTimeField(auto_now_add=True)
    effective_to = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'catalog_menuitemprice'
        ordering = ['-effective_from']

class ModifierGroup(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='modifier_groups')
    name = models.CharField(max_length=100) # e.g. "Doneness", "Sauce", "Extra Toppings"
    min_selection = models.PositiveSmallIntegerField(default=0)
    max_selection = models.PositiveSmallIntegerField(default=1)
    is_required = models.BooleanField(default=False)

    class Meta:
        db_table = 'catalog_modifiergroup'

class Modifier(models.Model):
    group = models.ForeignKey(ModifierGroup, on_delete=models.CASCADE, related_name='modifiers')
    name = models.CharField(max_length=100)
    price_addition = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    is_available = models.BooleanField(default=True)

    class Meta:
        db_table = 'catalog_modifier'

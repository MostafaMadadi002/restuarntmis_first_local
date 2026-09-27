from decimal import Decimal
from django.db import models
from apps.catalog.models import MenuItem
from apps.inventory.models import InventoryItem, UnitType

class Recipe(models.Model):
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, related_name='recipes')
    version = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'recipes_recipe'
        constraints = [
            models.UniqueConstraint(fields=['menu_item', 'version'], name='unique_menu_item_recipe_version')
        ]

    def __str__(self):
        return f"Recipe {self.menu_item.name} v{self.version}"

class RecipeIngredient(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='ingredients')
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name='recipe_usages')
    quantity = models.DecimalField(max_digits=12, decimal_places=3, help_text="Amount in ingredient's base unit")
    unit = models.CharField(max_length=20, choices=UnitType.choices)

    class Meta:
        db_table = 'recipes_recipeingredient'

    def __str__(self):
        return f"{self.quantity} {self.unit} of {self.inventory_item.name}"

from django.db import models

class Restaurant(models.Model):
    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=150, unique=True)
    address = models.TextField(blank=True, default='')
    phone = models.CharField(max_length=50, blank=True, default='')
    currency = models.CharField(max_length=10, default='AFN')
    logo = models.ImageField(upload_to='restaurant_logos/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'restaurants_restaurant'

    def __str__(self):
        return self.name

class Section(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='sections')
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'restaurants_section'
        ordering = ['display_order', 'id']

    def __str__(self):
        return f"{self.restaurant.name} - {self.name}"

from decimal import Decimal
from django.db import transaction
from apps.inventory.models import InventoryItem, StockMovement, StockMovementType
from common.exceptions import InsufficientStockError
from common.utils.decimal_math import to_qty

class InventoryService:
    @staticmethod
    def adjust_stock(restaurant_id: int, inventory_item_id: int, quantity_delta: Decimal, movement_type: str, reference_type: str = '', reference_id: str = '', actor=None, notes: str = '') -> StockMovement:
        """
        Atomically changes inventory item stock and records an immutable ledger entry.
        quantity_delta: positive for addition, negative for deduction.
        """
        with transaction.atomic():
            item = InventoryItem.objects.select_for_update().get(id=inventory_item_id, restaurant_id=restaurant_id)
            new_balance = item.current_stock + to_qty(quantity_delta)

            if new_balance < Decimal('0.000') and movement_type in [StockMovementType.SALE_CONSUMPTION, StockMovementType.WASTE]:
                raise InsufficientStockError(item.name, requested=abs(quantity_delta), available=item.current_stock)

            item.current_stock = new_balance
            item.save(update_fields=['current_stock', 'updated_at'])

            movement = StockMovement.objects.create(
                restaurant_id=restaurant_id,
                inventory_item=item,
                movement_type=movement_type,
                quantity=quantity_delta,
                balance_after=new_balance,
                reference_type=reference_type,
                reference_id=reference_id,
                actor=actor,
                notes=notes
            )
            return movement

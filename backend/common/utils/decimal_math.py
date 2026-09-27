from decimal import Decimal, ROUND_HALF_UP

def to_money(val) -> Decimal:
    """Converts input to financial Decimal rounded to 2 decimal places."""
    if val is None:
        return Decimal("0.00")
    if isinstance(val, (int, float, str)):
        d = Decimal(str(val))
    elif isinstance(val, Decimal):
        d = val
    else:
        d = Decimal("0.00")
    return d.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

def to_qty(val, places: int = 3) -> Decimal:
    """Converts input to inventory/portion Decimal with configurable precision (default 3 places)."""
    if val is None:
        return Decimal("0.000")
    if isinstance(val, (int, float, str)):
        d = Decimal(str(val))
    elif isinstance(val, Decimal):
        d = val
    else:
        d = Decimal("0.000")
    quantizer = Decimal(f"1e-{places}")
    return d.quantize(quantizer, rounding=ROUND_HALF_UP)

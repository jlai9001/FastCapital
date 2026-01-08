# server/enums.py
import enum

class FinancialType(str, enum.Enum):
    income = "income"
    expense = "expense"
    asset = "asset"
    liability = "liability"

import calendar
from datetime import datetime, timedelta
from typing import List, Dict, Any
import math

def calculate_cashflow(scenario: Dict[str, Any]) -> Dict[str, Any]:
    initial_balance = scenario.get("initial_balance", 0)
    items = scenario.get("items", [])
    installments = scenario.get("installments", [])
    time_unit = scenario.get("time_unit", "month")
    time_range = scenario.get("time_range", 12)
    
    start_date = datetime.now()
    end_date = calculate_end_date(start_date, time_unit, time_range)
    
    points = []
    current_date = start_date
    
    while current_date <= end_date:
        date_str = current_date.strftime("%Y-%m-%d")
        label = format_label(current_date, time_unit)
        
        income = 0
        expense = 0
        
        for item in items:
            amount = calculate_item_amount(item, current_date)
            if amount > 0:
                if item.get("type") == "income":
                    income += amount
                else:
                    expense += amount
        
        for inst in installments:
            payment = calculate_installment_payment(inst, current_date)
            if payment > 0:
                expense += payment
        
        periodic_net = income - expense
        
        prev_balance = points[-1]["cumulative_balance"] if points else initial_balance
        cumulative_balance = prev_balance + periodic_net
        
        points.append({
            "date": date_str,
            "label": label,
            "cumulative_balance": round(cumulative_balance, 2),
            "periodic_net": round(periodic_net, 2),
            "income": round(income, 2),
            "expense": round(expense, 2),
        })
        
        current_date = advance_date(current_date, time_unit)
    
    balances = [p["cumulative_balance"] for p in points]
    total_income = sum(p["income"] for p in points)
    total_expense = sum(p["expense"] for p in points)
    
    return {
        "points": points,
        "min_balance": round(min(balances), 2),
        "max_balance": round(max(balances), 2),
        "final_balance": round(points[-1]["cumulative_balance"], 2) if points else initial_balance,
        "total_income": round(total_income, 2),
        "total_expense": round(total_expense, 2),
    }

def add_months(date: datetime, months: int) -> datetime:
    month = date.month - 1 + months
    year = date.year + month // 12
    month = month % 12 + 1
    day = min(date.day, calendar.monthrange(year, month)[1])
    return date.replace(year=year, month=month, day=day)

def calculate_end_date(start: datetime, unit: str, range_val: int) -> datetime:
    if unit == "day":
        return start + timedelta(days=range_val)
    elif unit == "week":
        return start + timedelta(weeks=range_val)
    elif unit == "month":
        return add_months(start, range_val)
    elif unit == "year":
        return start.replace(year=start.year + range_val)
    return start

def format_label(date: datetime, unit: str) -> str:
    if unit == "day":
        return f"{date.month}/{date.day}"
    elif unit == "week":
        week_num = (date.day - 1) // 7 + 1
        return f"{date.year}年{date.month}月第{week_num}周"
    elif unit == "month":
        return f"{date.year}年{date.month}月"
    elif unit == "year":
        return f"{date.year}年"
    return date.strftime("%Y-%m-%d")

def advance_date(date: datetime, unit: str) -> datetime:
    if unit == "day":
        return date + timedelta(days=1)
    elif unit == "week":
        return date + timedelta(weeks=1)
    elif unit == "month":
        return add_months(date, 1)
    elif unit == "year":
        return date.replace(year=date.year + 1)
    return date

def calculate_item_amount(item: Dict[str, Any], current_date: datetime) -> float:
    start = datetime.strptime(item["startDate"], "%Y-%m-%d")
    
    if current_date < start:
        return 0
    if item.get("endDate") and current_date > datetime.strptime(item["endDate"], "%Y-%m-%d"):
        return 0
    if item.get("occurrences"):
        occurrences = count_occurrences(item, current_date)
        if occurrences > item["occurrences"]:
            return 0
    
    if is_occurrence_date(item, current_date):
        return item["amount"]
    return 0

def is_occurrence_date(item: Dict[str, Any], date: datetime) -> bool:
    start = datetime.strptime(item["startDate"], "%Y-%m-%d")
    period = item["period"]
    
    if period == "daily":
        return True
    elif period == "weekly":
        return date.weekday() == start.weekday()
    elif period == "biweekly":
        week_diff = (date - start).days // 7
        return week_diff >= 0 and week_diff % 2 == 0 and date.weekday() == start.weekday()
    elif period == "monthly":
        return date.day == item.get("periodDay", start.day)
    elif period == "bimonthly":
        month_diff = (date.year - start.year) * 12 + date.month - start.month
        return month_diff >= 0 and month_diff % 2 == 0 and date.day == item.get("periodDay", start.day)
    elif period == "quarterly":
        month_diff = (date.year - start.year) * 12 + date.month - start.month
        return month_diff >= 0 and month_diff % 3 == 0 and date.day == item.get("periodDay", start.day)
    elif period == "yearly":
        return date.month == start.month and date.day == item.get("periodDay", start.day)
    elif period == "custom":
        custom_days = item.get("customDays", 0)
        if not custom_days:
            return False
        days_diff = (date - start).days
        return days_diff >= 0 and days_diff % custom_days == 0
    return False

def count_occurrences(item: Dict[str, Any], until_date: datetime) -> int:
    count = 0
    start = datetime.strptime(item["startDate"], "%Y-%m-%d")
    current = start
    
    while current <= until_date:
        if is_occurrence_date(item, current):
            count += 1
        current = advance_date(current, "day")
    
    return count

def calculate_installment_payment(inst: Dict[str, Any], current_date: datetime) -> float:
    start = datetime.strptime(inst["startDate"], "%Y-%m-%d")
    if current_date < start:
        return 0
    
    month_diff = (current_date.year - start.year) * 12 + current_date.month - start.month
    if month_diff < 0 or month_diff >= inst["periods"]:
        return 0
    
    target_day = min(start.day, calendar.monthrange(current_date.year, current_date.month)[1])
    if current_date.day != target_day:
        return 0
    
    payment = inst["totalAmount"] / inst["periods"]
    
    if inst.get("interestRate") and inst["interestRate"] > 0:
        if inst.get("interestType") == "simple":
            total_interest = inst["totalAmount"] * (inst["interestRate"] / 100)
            payment = (inst["totalAmount"] + total_interest) / inst["periods"]
        else:
            monthly_rate = inst["interestRate"] / 100 / 12
            payment = inst["totalAmount"] * (monthly_rate * math.pow(1 + monthly_rate, inst["periods"])) / (math.pow(1 + monthly_rate, inst["periods"]) - 1)
    
    return payment

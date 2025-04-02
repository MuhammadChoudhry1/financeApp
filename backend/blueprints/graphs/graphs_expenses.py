from flask import Blueprint, jsonify, make_response
from globals import cursor, conn
from datetime import datetime
from decorators import jwt_required

expense_graph_bp = Blueprint('expense_graph_bp', __name__)

def parse_date(date_input):
    """Helper function to handle both string and datetime dates"""
    if isinstance(date_input, datetime):
        return date_input
    try:
        return datetime.strptime(date_input, '%Y-%m-%d')
    except (TypeError, ValueError):
        return None

@expense_graph_bp.route("/api/v1.0/expenses/summary", methods=["GET"])
@jwt_required
def expense_summary(username):
    """GET: Return total amount spent per category for the logged-in user"""
    try:
        cursor.execute("SELECT category, amount FROM expenses WHERE username = ?", (username,))
        expenses = cursor.fetchall()
        
        if not expenses:
            return make_response(jsonify({"error": "No expenses found"}), 404)
        
        summary = {}
        for category, amount in expenses:
            if not category:
                continue
            if category not in summary:
                summary[category] = 0.0
            try:
                summary[category] += float(amount)
            except (TypeError, ValueError):
                continue
                
        return make_response(jsonify(summary), 200)
        
    except Exception as e:
        return make_response(jsonify({"error": str(e)}), 500)

@expense_graph_bp.route("/api/v1.0/expenses/monthly", methods=["GET"])
@jwt_required
def monthly_summary(username):
    """GET: Return total expenses per month (format: YYYY-MM) for the logged-in user"""
    try:
        cursor.execute("SELECT date, amount FROM expenses WHERE username = ? ORDER BY date", (username,))
        expenses = cursor.fetchall()
        
        if not expenses:
            return make_response(jsonify({"error": "No expenses found"}), 404)
        
        monthly_data = {}
        for date_value, amount in expenses:
            date_obj = parse_date(date_value)
            if not date_obj:
                continue
                
            month_key = date_obj.strftime('%Y-%m')
            
            try:
                amount_float = float(amount)
            except (TypeError, ValueError):
                continue
                
            if month_key not in monthly_data:
                monthly_data[month_key] = 0.0
            monthly_data[month_key] += amount_float
        
        result = [{"month": month, "amount": total} 
                 for month, total in sorted(monthly_data.items())]
        
        return make_response(jsonify(result), 200)
        
    except Exception as e:
        return make_response(jsonify({"error": str(e)}), 500)
    
@expense_graph_bp.route("/api/v1.0/expenses/monthly-category", methods=["GET"])
@jwt_required
def monthly_category_summary(username):
    """GET: Return total expenses per category per month (format: YYYY-MM) for the logged-in user"""
    try:
        cursor.execute("SELECT date, category, amount FROM expenses WHERE username = ? ORDER BY date", (username,))
        rows = cursor.fetchall()
        
        if not rows:
            return make_response(jsonify({"error": "No expenses found"}), 404)
        
        monthly_category_data = {}
        
        for date_value, category, amount in rows:
            date_obj = parse_date(date_value)
            if not date_obj or not category:
                continue
            
            month_key = date_obj.strftime('%Y-%m')
            key = (month_key, category)

            try:
                amount_float = float(amount)
            except (TypeError, ValueError):
                continue

            if key not in monthly_category_data:
                monthly_category_data[key] = 0.0
            monthly_category_data[key] += amount_float
        
        # Format result
        result = [
            {"month": month, "category": category, "total": total}
            for (month, category), total in sorted(monthly_category_data.items())
        ]
        
        return make_response(jsonify(result), 200)
    
    except Exception as e:
        return make_response(jsonify({"error": str(e)}), 500)

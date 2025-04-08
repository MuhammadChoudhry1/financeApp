from flask import Blueprint, jsonify, make_response
from flask_cors import CORS
from globals import conn
from decorators import login_required

totals_bp = Blueprint('totals_bp', __name__)
CORS(totals_bp)

@totals_bp.route("/api/v1.0/account_balance", methods=["GET"])
@login_required
def get_total_balance(username):
    try:
        if conn is None:
            print("Database connection is None")
            return make_response(jsonify({"error": "Database connection error"}), 500)

        cursor1 = conn.cursor()
        cursor2 = conn.cursor()
        cursor3 = conn.cursor()

        # Total income from salaries (user-specific)
        cursor1.execute("SELECT SUM(amount) FROM salaries WHERE username = ?", (username,))
        total_income = cursor1.fetchone()[0] or 0

        # Total expenses (user-specific)
        cursor2.execute("SELECT SUM(amount) FROM expenses WHERE username = ?", (username,))
        total_expenses = cursor2.fetchone()[0] or 0

        # Total savings (user-specific)
        cursor3.execute("SELECT SUM(amount) FROM saving_goals WHERE username = ?", (username,))
        total_savings = cursor3.fetchone()[0] or 0

        final_balance = total_income - total_expenses - total_savings

        print(f"User: {username} | Income: {total_income}, Expenses: {total_expenses}, Savings: {total_savings}, Final: {final_balance}")

        return make_response(jsonify({
            "account_balance": round(final_balance, 2),
            "total_income": round(total_income, 2),
            "total_expenses": round(total_expenses, 2),
            "total_savings": round(total_savings, 2)
        }), 200)

    except Exception as e:
        print("Error in get_total_balance:", str(e))
        return make_response(jsonify({"error": str(e)}), 500)
    finally:
        if cursor1:
            cursor1.close()
        if cursor2:
            cursor2.close()
        if cursor3:
            cursor3.close()

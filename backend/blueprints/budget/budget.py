import uuid
from flask import Blueprint, request, jsonify, make_response
from datetime import datetime
from globals import cursor, conn
from decorators import login_required

budget_bp = Blueprint('budget_bp', __name__)

# Allowed budget categories
allowed_categories = ['Entertainment', 'Groceries', 'Transport', 'Dining']

# ✅ GET all budgets for a user
@budget_bp.route("/api/v1.0/budgets", methods=["GET"])
@login_required
def get_budgets(username):
    try:
        cursor.execute("""
            SELECT id, category, monthly_limit, used_amount, created_at, updated_at 
            FROM budgets 
            WHERE username = ?
        """, (username,))
        rows = cursor.fetchall()

        budgets = [
            {
                "id": row[0],
                "category": row[1],
                "monthly_limit": float(row[2]),
                "used_amount": float(row[3]),
                "created_at": row[4].strftime("%Y-%m-%d %H:%M:%S"),
                "updated_at": row[5].strftime("%Y-%m-%d %H:%M:%S")
            } for row in rows if row[1] in allowed_categories
        ]
        return make_response(jsonify(budgets), 200)
    except Exception as e:
        return make_response(jsonify({"error": str(e)}), 500)

# ✅ POST a new budget
@budget_bp.route("/api/v1.0/budgets", methods=["POST"])
@login_required
def add_budget(username):
    data = request.json if request.is_json else request.form.to_dict()

    category = data.get("category")
    limit = data.get("monthly_limit")

    if not category or not limit:
        return make_response(jsonify({"error": "Missing category or limit"}), 400)

    category = category.strip().capitalize()
    if category not in allowed_categories:
        return make_response(jsonify({"error": f"Invalid category '{category}'. Allowed categories: {', '.join(allowed_categories)}"}), 400)

    try:
        # Check if a budget for this category already exists for the current month
        now = datetime.now()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        cursor.execute(
            "SELECT COUNT(*) FROM budgets WHERE username = ? AND category = ? AND created_at >= ?",
            (username, category, start_of_month)
        )
        if cursor.fetchone()[0] > 0:
            return make_response(jsonify({"error": f"A budget for category '{category}' already exists for this month."}), 400)

        # Insert the new budget with used_amount initialized to 0
        new_id = str(uuid.uuid4())
        now_str = now.strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute(
            "INSERT INTO budgets (id, username, category, monthly_limit, used_amount, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (new_id, username, category, float(limit), 0.0, now_str, now_str)
        )
        conn.commit()
        return make_response(jsonify({"message": "Budget created", "id": new_id}), 201)
    except Exception as e:
        return make_response(jsonify({"error": str(e)}), 500)

# ✅ PUT update budget
@budget_bp.route("/api/v1.0/budgets/<string:id>", methods=["PUT"])
@login_required
def update_budget(id, username):
    data = request.json if request.is_json else request.form.to_dict()
    limit = data.get("monthly_limit")
    category = data.get("category")

    if not limit:
        return make_response(jsonify({"error": "Missing limit"}), 400)

    if category:
        category = category.strip().capitalize()
        if category not in allowed_categories:
            return make_response(jsonify({"error": f"Invalid category '{category}'. Allowed categories: {', '.join(allowed_categories)}"}), 400)

    try:
        cursor.execute("SELECT COUNT(*) FROM budgets WHERE id = ? AND username = ?", (id, username))
        if cursor.fetchone()[0] == 0:
            return make_response(jsonify({"error": "Budget not found or unauthorized"}), 404)

        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        if category:
            cursor.execute(
                "UPDATE budgets SET category = ?, monthly_limit = ?, updated_at = ? WHERE id = ? AND username = ?",
                (category, float(limit), now, id, username)
            )
        else:
            cursor.execute(
                "UPDATE budgets SET monthly_limit = ?, updated_at = ? WHERE id = ? AND username = ?",
                (float(limit), now, id, username)
            )

        conn.commit()
        return make_response(jsonify({"message": "Budget updated"}), 200)
    except Exception as e:
        return make_response(jsonify({"error": str(e)}), 500)

# ✅ DELETE budget
@budget_bp.route("/api/v1.0/budgets/<string:id>", methods=["DELETE"])
@login_required
def delete_budget(id, username):
    try:
        cursor.execute("DELETE FROM budgets WHERE id = ? AND username = ?", (id, username))
        conn.commit()

        if cursor.rowcount > 0:
            return make_response(jsonify({"message": "Budget deleted"}), 204)
        else:
            return make_response(jsonify({"error": "Budget not found or unauthorized"}), 404)
    except Exception as e:
        return make_response(jsonify({"error": str(e)}), 500)

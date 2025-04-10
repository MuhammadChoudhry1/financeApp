import uuid
from flask import Blueprint, request, jsonify, make_response, url_for
from datetime import datetime
from globals import cursor, conn  
from decorators import jwt_required 

expense_bp = Blueprint('expense_bp', __name__)

allowed_categories = ['Entertainment', 'Groceries', 'Transport', 'Dining', 'Utilities']
allowed_descriptions = ['Movie', 'Shopping', 'Bus Fare', 'Dinner', 'Electricity Bill']

@expense_bp.route("/api/v1.0/expenses", methods=["GET"])
@jwt_required
def show_all_expenses(username):
    try:
        page_num = int(request.args.get('pn', 1))
        page_size = int(request.args.get('ps', 10))
        offset = (page_num - 1) * page_size

        cursor.execute(
            "SELECT id, description, amount, category, date FROM expenses WHERE username = ? ORDER BY id OFFSET ? ROWS FETCH NEXT ? ROWS ONLY",
            (username, offset, page_size)
        )
        expenses = cursor.fetchall()

        data_to_return = [{
            "id": row[0],
            "description": row[1],
            "amount": float(row[2]),
            "category": row[3],
            "date": row[4].strftime("%Y-%m-%d %H:%M:%S") if isinstance(row[4], datetime) else str(row[4])
        } for row in expenses]

        return make_response(jsonify(data_to_return), 200)
    except Exception as e:
        return make_response(jsonify({"error": "Database error: " + str(e)}), 500)

@expense_bp.route("/api/v1.0/expenses/<string:id>", methods=["GET"])
@jwt_required
def show_one_expense(id, username):
    try:
        cursor.execute(
            "SELECT id, description, amount, category, date FROM expenses WHERE id = ? AND username = ?",
            (id, username)
        )
        expense = cursor.fetchone()

        if expense:
            return make_response(jsonify({
                "id": expense[0],
                "description": expense[1],
                "amount": float(expense[2]),
                "category": expense[3],
                "date": expense[4].strftime("%Y-%m-%d %H:%M:%S") if isinstance(expense[4], datetime) else str(expense[4])
            }), 200)
        else:
            return make_response(jsonify({"error": "Expense not found"}), 404)
    except Exception as e:
        return make_response(jsonify({"error": "Database error: " + str(e)}), 500)

@expense_bp.route("/api/v1.0/expenses", methods=["POST"])
@jwt_required
def add_expense(username):
    data = request.form

    if "description" in data and "amount" in data and "category" in data:
        if data["description"] not in allowed_descriptions or data["category"] not in allowed_categories:
            return make_response(jsonify({"error": "Invalid description or category"}), 400)

        try:
            amount = float(data["amount"])
        except ValueError:
            return make_response(jsonify({"error": "Invalid amount format"}), 400)

        new_id = str(uuid.uuid4())
        description = data["description"]
        category = data["category"]
        date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        try:
            cursor.execute(
                "INSERT INTO expenses (id, description, amount, category, date, username) VALUES (?, ?, ?, ?, ?, ?)",
                (new_id, description, amount, category, date, username)
            )
            conn.commit()

            cursor.execute(
                "SELECT used_amount FROM budgets WHERE username = ? AND category = ?",
                (username, category)
            )
            budget = cursor.fetchone()
            if budget:
                current_used = budget[0] if budget[0] is not None else 0.0
                new_used = float(current_used) + amount
                cursor.execute(
                    "UPDATE budgets SET used_amount = ? WHERE username = ? AND category = ?",
                    (new_used, username, category)
                )
                conn.commit()

            return make_response(jsonify({"message": "Expense added", "id": new_id}), 201)
        except Exception as e:
            return make_response(jsonify({"error": "Database error: " + str(e)}), 500)
    else:
        return make_response(jsonify({"error": "Missing required fields"}), 400)

@expense_bp.route("/api/v1.0/expenses/<string:id>", methods=["PUT"])
@jwt_required
def edit_expense(id, username):
    data = request.form

    cursor.execute("SELECT COUNT(*) FROM expenses WHERE id = ? AND username = ?", (id, username))
    if cursor.fetchone()[0] == 0:
        return make_response(jsonify({"error": "Expense not found or unauthorized"}), 404)

    if "description" in data and "amount" in data and "category" in data:
        if data["description"] not in allowed_descriptions or data["category"] not in allowed_categories:
            return make_response(jsonify({"error": "Invalid description or category"}), 400)

        try:
            amount = float(data["amount"])
        except ValueError:
            return make_response(jsonify({"error": "Invalid amount format"}), 400)

        description = data["description"]
        category = data["category"]
        date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        try:
            cursor.execute(
                "UPDATE expenses SET description = ?, amount = ?, category = ?, date = ? WHERE id = ? AND username = ?",
                (description, amount, category, date, id, username)
            )
            conn.commit()
            return make_response(jsonify({"message": "Expense updated"}), 200)
        except Exception as e:
            return make_response(jsonify({"error": "Database error: " + str(e)}), 500)
    else:
        return make_response(jsonify({"error": "Missing required fields"}), 400)

@expense_bp.route("/api/v1.0/expenses/<string:id>", methods=["DELETE"])
@jwt_required
def delete_expense(id, username):
    try:
        cursor.execute("DELETE FROM expenses WHERE id = ? AND username = ?", (id, username))
        conn.commit()
        if cursor.rowcount > 0:
            return make_response(jsonify({}), 204)
        else:
            return make_response(jsonify({"error": "Expense not found or unauthorized"}), 404)
    except Exception as e:
        return make_response(jsonify({"error": "Database error: " + str(e)}), 500)

import uuid
from flask import Blueprint, request, jsonify, make_response, url_for
from datetime import datetime
from globals import cursor, conn  # Import SQL connection

expense_bp = Blueprint('expense_bp', __name__)

# Allowed values for expense descriptions and categories
allowed_categories = ['Entertainment', 'Groceries', 'Transport', 'Dining']
allowed_descriptions = ['Movie', 'Shopping', 'Bus Fare', 'Dinner']

# ✅ GET all expenses with pagination
@expense_bp.route("/api/v1.0/expenses", methods=["GET"])
def show_all_expenses():
    """
    GET: Retrieve all expenses with pagination.
    """
    page_num = int(request.args.get('pn', 1))
    page_size = int(request.args.get('ps', 10))
    offset = (page_num - 1) * page_size

    cursor.execute(
        "SELECT id, description, amount, category, date FROM expenses ORDER BY id OFFSET ? ROWS FETCH NEXT ? ROWS ONLY",
        (offset, page_size)
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

# ✅ GET a single expense by ID
@expense_bp.route("/api/v1.0/expenses/<string:id>", methods=["GET"])
def show_one_expense(id):
    """
    GET: Retrieve a single expense by ID.
    """
    cursor.execute("SELECT id, description, amount, category, date FROM expenses WHERE id = ?", (id,))
    expense = cursor.fetchone()

    if expense:
        expense_data = {
            "id": expense[0],
            "description": expense[1],
            "amount": float(expense[2]),
            "category": expense[3],
            "date": expense[4].strftime("%Y-%m-%d %H:%M:%S") if isinstance(expense[4], datetime) else str(expense[4])
        }
        return make_response(jsonify(expense_data), 200)
    else:
        return make_response(jsonify({"error": "Expense not found"}), 404)

# ✅ POST: Add a new expense
@expense_bp.route("/api/v1.0/expenses", methods=["POST"])
def add_expense():
    """
    POST: Add a new expense.
    """
    data = request.json if request.is_json else request.form.to_dict()

    if "description" in data and "amount" in data and "category" in data:
        # Validate allowed values
        if data["description"] not in allowed_descriptions or data["category"] not in allowed_categories:
            return make_response(
                jsonify({
                    "error": "Invalid description or category. Allowed descriptions: {}, allowed categories: {}".format(
                        allowed_descriptions, allowed_categories)
                }), 400
            )

        new_id = str(uuid.uuid4())  # Generate UUID for the expense
        description = data["description"]
        amount = float(data["amount"])
        category = data["category"]
        date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # Auto-generate current date

        cursor.execute(
            "INSERT INTO expenses (id, description, amount, category, date) VALUES (?, ?, ?, ?, ?)",
            (new_id, description, amount, category, date)
        )
        conn.commit()

        return make_response(jsonify({"message": "Expense added", "id": new_id}), 201)
    else:
        return make_response(jsonify({"error": "Missing required fields"}), 400)

# ✅ PUT: Edit an existing expense
@expense_bp.route("/api/v1.0/expenses/<string:id>", methods=["PUT"])
def edit_expense(id):
    """
    PUT: Edit an existing expense by ID.
    """
    data = request.json if request.is_json else request.form.to_dict()

    # Check if the record exists before updating
    cursor.execute("SELECT COUNT(*) FROM expenses WHERE id = ?", (id,))
    exists = cursor.fetchone()[0]

    if exists == 0:
        return make_response(jsonify({"error": "Expense not found"}), 404)

    if "description" in data and "amount" in data and "category" in data:
        # Validate allowed values
        if data["description"] not in allowed_descriptions or data["category"] not in allowed_categories:
            return make_response(
                jsonify({
                    "error": "Invalid description or category. Allowed descriptions: {}, allowed categories: {}".format(
                        allowed_descriptions, allowed_categories)
                }), 400
            )

        description = data["description"]
        amount = float(data["amount"])
        category = data["category"]
        date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # Update with current date/time

        cursor.execute(
            "UPDATE expenses SET description = ?, amount = ?, category = ?, date = ? WHERE id = ?",
            (description, amount, category, date, id)
        )
        conn.commit()

        edited_expense_link = url_for('expense_bp.show_one_expense', id=id, _external=True)
        return make_response(jsonify({"message": "Expense updated", "url": edited_expense_link}), 200)
    else:
        return make_response(jsonify({"error": "Missing required fields"}), 400)

# ✅ DELETE: Remove an expense
@expense_bp.route("/api/v1.0/expenses/<string:id>", methods=["DELETE"])
def delete_expense(id):
    """
    DELETE: Delete an expense by ID.
    """
    cursor.execute("DELETE FROM expenses WHERE id = ?", (id,))
    conn.commit()

    if cursor.rowcount > 0:
        return make_response(jsonify({}), 204)
    else:
        return make_response(jsonify({"error": "Invalid expense ID"}), 404)

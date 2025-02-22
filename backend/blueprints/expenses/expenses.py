from flask import Blueprint, request, jsonify, make_response, url_for
from decorators import jwt_required
from datetime import datetime
from globals import cursor, conn  # Import SQL connection

expense_bp = Blueprint('expense_bp', __name__)

# ✅ GET all expenses with pagination
@expense_bp.route("/api/v1.0/expenses", methods=["GET"])
def show_all_expenses():
    """
    GET: Retrieve all expenses with pagination.
    """
    page_num = int(request.args.get('pn', 1))
    page_size = int(request.args.get('ps', 10))
    offset = (page_num - 1) * page_size

    cursor.execute("SELECT id, name, amount, category, date FROM expenses ORDER BY id OFFSET ? ROWS FETCH NEXT ? ROWS ONLY", (offset, page_size))
    expenses = cursor.fetchall()

    # Convert result to JSON
    data_to_return = [{"id": row[0], "name": row[1], "amount": row[2], "category": row[3], "date": row[4]} for row in expenses]
    
    return make_response(jsonify(data_to_return), 200)

# ✅ GET a single expense by ID
@expense_bp.route("/api/v1.0/expenses/<int:id>", methods=["GET"])
def show_one_expense(id):
    """
    GET: Retrieve a single expense by ID.
    """
    cursor.execute("SELECT id, name, amount, category, date FROM expenses WHERE id = ?", (id,))
    expense = cursor.fetchone()

    if expense:
        expense_data = {"id": expense[0], "name": expense[1], "amount": expense[2], "category": expense[3], "date": expense[4]}
        return make_response(jsonify(expense_data), 200)
    else:
        return make_response(jsonify({"error": "Expense not found"}), 404)

# ✅ POST: Add a new expense
@expense_bp.route("/api/v1.0/expenses", methods=["POST"])
def add_expense():
    """
    POST: Add a new expense.
    """
    data = request.json
    if "name" in data and "amount" in data and "category" in data:
        name = data["name"]
        amount = data["amount"]
        category = data["category"]
        date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # Automatically add current date

        cursor.execute("INSERT INTO expenses (name, amount, category, date) VALUES (?, ?, ?, ?)", (name, amount, category, date))
        conn.commit()  # Save changes

        # Get the ID of the inserted record
        cursor.execute("SELECT SCOPE_IDENTITY()")
        new_expense_id = cursor.fetchone()[0]

        new_expense_link = url_for('expense_bp.show_one_expense', id=new_expense_id, _external=True)
        return make_response(jsonify({"url": new_expense_link}), 201)
    else:
        return make_response(jsonify({"error": "Missing form data"}), 400)

# ✅ PUT: Edit an existing expense
@expense_bp.route("/api/v1.0/expenses/<int:id>", methods=["PUT"])
def edit_expense(id):
    """
    PUT: Edit an existing expense by ID.
    """
    data = request.json
    if "name" in data and "amount" in data and "category" in data:
        cursor.execute("UPDATE expenses SET name = ?, amount = ?, category = ?, date = ? WHERE id = ?", 
                       (data["name"], data["amount"], data["category"], datetime.now().strftime("%Y-%m-%d %H:%M:%S"), id))
        conn.commit()

        if cursor.rowcount > 0:
            edited_expense_link = url_for('expense_bp.show_one_expense', id=id, _external=True)
            return make_response(jsonify({"url": edited_expense_link}), 200)
        else:
            return make_response(jsonify({"error": "Invalid expense ID"}), 404)
    else:
        return make_response(jsonify({"error": "Missing form data"}), 400)

# ✅ DELETE: Remove an expense
@expense_bp.route("/api/v1.0/expenses/<int:id>", methods=["DELETE"])
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

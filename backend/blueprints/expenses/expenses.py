import uuid
from flask import Blueprint, request, jsonify, make_response, url_for
from datetime import datetime
from globals import cursor, conn  # Import SQL connection
from decorators import jwt_required, login_required  # Import the new decorator

expense_bp = Blueprint('expense_bp', __name__)

# Allowed values for expense descriptions and categories
allowed_categories = ['Entertainment', 'Groceries', 'Transport', 'Dining', 'Utilities']
allowed_descriptions = ['Movie', 'Shopping', 'Bus Fare', 'Dinner', 'Electricity Bill']

# ✅ GET all expenses with pagination
@expense_bp.route("/api/v1.0/expenses", methods=["GET"])
@login_required
@jwt_required
def show_all_expenses(username):
    """
    GET: Retrieve all expenses with pagination.
    """
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
        print("Database Error:", str(e))  # Debugging: Print database error
        return make_response(jsonify({"error": "Database error: " + str(e)}), 500)

# ✅ GET a single expense by ID
@expense_bp.route("/api/v1.0/expenses/<string:id>", methods=["GET"])
@login_required
@jwt_required
def show_one_expense(id, username):
    """
    GET: Retrieve a single expense by ID.
    """
    try:
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
    except Exception as e:
        print("Database Error:", str(e))  # Debugging: Print database error
        return make_response(jsonify({"error": "Database error: " + str(e)}), 500)

# ✅ POST: Add a new expense (handles x-www-form-urlencoded)
@expense_bp.route("/api/v1.0/expenses", methods=["POST"])
@login_required
def add_expense():
    """
    POST: Add a new expense.
    """
    data = request.form  # Access form data from the request
    print("Request Data:", data)  # Debugging: Print request data

    if "description" in data and "amount" in data and "category" in data:
        # Validate allowed values
        if data["description"] not in allowed_descriptions or data["category"] not in allowed_categories:
            print("Validation Error: Invalid description or category")  # Debugging: Print validation error
            return make_response(
                jsonify({
                    "error": "Invalid description or category. Allowed descriptions: {}, allowed categories: {}".format(
                        allowed_descriptions, allowed_categories)
                }), 400
            )

        try:
            amount = float(data["amount"])
        except ValueError:
            print("Validation Error: Invalid amount format")  # Debugging: Print validation error
            return make_response(jsonify({"error": "Invalid amount format"}), 400)

        new_id = str(uuid.uuid4())  # Generate UUID for the expense
        description = data["description"]
        category = data["category"]
        date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # Auto-generate current date

        try:
            cursor.execute(
                "INSERT INTO expenses (id, description, amount, category, date) VALUES (?, ?, ?, ?, ?)",
                (new_id, description, amount, category, date)
            )
            conn.commit()
        except Exception as e:
            print("Database Error:", str(e))  # Debugging: Print database error
            return make_response(jsonify({"error": "Database error: " + str(e)}), 500)

        return make_response(jsonify({"message": "Expense added", "id": new_id}), 201)
    else:
        print("Validation Error: Missing required fields")  # Debugging: Print validation error
        return make_response(jsonify({"error": "Missing required fields"}), 400)

# ✅ POST: Add a new utility expense (handles x-www-form-urlencoded)
@expense_bp.route("/api/v1.0/Utilities", methods=["POST"])
@login_required
def add_utility():
    """
    POST: Add a new utility expense.
    """
    data = request.form  # Access form data from the request
    print("Request Data:", data)  # Debugging: Print request data

    if "description" in data and "amount" in data and "category" in data:
        # Validate allowed values
        if data["description"] not in allowed_descriptions or data["category"] not in allowed_categories:
            print("Validation Error: Invalid description or category")  # Debugging: Print validation error
            return make_response(
                jsonify({
                    "error": "Invalid description or category. Allowed descriptions: {}, allowed categories: {}".format(
                        allowed_descriptions, allowed_categories)
                }), 400
            )

        try:
            amount = float(data["amount"])
        except ValueError:
            print("Validation Error: Invalid amount format")  # Debugging: Print validation error
            return make_response(jsonify({"error": "Invalid amount format"}), 400)

        new_id = str(uuid.uuid4())  # Generate UUID for the utility
        description = data["description"]
        category = data["category"]
        date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # Auto-generate current date

        try:
            cursor.execute(
                "INSERT INTO expenses (id, description, amount, category, date) VALUES (?, ?, ?, ?, ?)",
                (new_id, description, amount, category, date)
            )
            conn.commit()
        except Exception as e:
            print("Database Error:", str(e))  # Debugging: Print database error
            return make_response(jsonify({"error": "Database error: " + str(e)}), 500)

        return make_response(jsonify({"message": "Utility expense added", "id": new_id}), 201)
    else:
        print("Validation Error: Missing required fields")  # Debugging: Print validation error
        return make_response(jsonify({"error": "Missing required fields"}), 400)

# ✅ PUT: Edit an existing expense (handles x-www-form-urlencoded)
@expense_bp.route("/api/v1.0/expenses/<string:id>", methods=["PUT"])
@login_required
def edit_expense(id):
    """
    PUT: Edit an existing expense by ID.
    """
    data = request.form  # Access form data from the request

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

        try:
            amount = float(data["amount"])
        except ValueError:
            return make_response(jsonify({"error": "Invalid amount format"}), 400)

        description = data["description"]
        category = data["category"]
        date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # Update with current date/time

        try:
            cursor.execute(
                "UPDATE expenses SET description = ?, amount = ?, category = ?, date = ? WHERE id = ?",
                (description, amount, category, date, id)
            )
            conn.commit()
        except Exception as e:
            print("Database Error:", str(e))  # Debugging: Print database error
            return make_response(jsonify({"error": "Database error: " + str(e)}), 500)

        edited_expense_link = url_for('expense_bp.show_one_expense', id=id, _external=True)
        return make_response(jsonify({"message": "Expense updated", "url": edited_expense_link}), 200)
    else:
        return make_response(jsonify({"error": "Missing required fields"}), 400)

# ✅ DELETE: Remove an expense
@expense_bp.route("/api/v1.0/expenses/<string:id>", methods=["DELETE"])
@login_required
def delete_expense(id):
    """
    DELETE: Delete an expense by ID.
    """
    try:
        cursor.execute("DELETE FROM expenses WHERE id = ?", (id,))
        conn.commit()

        if cursor.rowcount > 0:
            return make_response(jsonify({}), 204)
        else:
            return make_response(jsonify({"error": "Invalid expense ID"}), 404)
    except Exception as e:
        print("Database Error:", str(e))  # Debugging: Print database error
        return make_response(jsonify({"error": "Database error: " + str(e)}), 500)
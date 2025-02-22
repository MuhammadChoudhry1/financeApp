from flask import Blueprint, request, jsonify, make_response, url_for
from decorators import jwt_required
from datetime import datetime
from globals import cursor, conn  # Import SQL connection

salaries_bp = Blueprint('salaries_bp', __name__)

# ✅ GET all salaries with pagination
@salaries_bp.route("/api/v1.0/salaries", methods=["GET"])
def show_all_salaries():
    """
    GET: Retrieve all salaries with pagination.
    """
    page_num = int(request.args.get('pn', 1))
    page_size = int(request.args.get('ps', 10))
    offset = (page_num - 1) * page_size

    cursor.execute("SELECT id, name, amount, date FROM salaries ORDER BY id OFFSET ? ROWS FETCH NEXT ? ROWS ONLY", (offset, page_size))
    salaries = cursor.fetchall()

    # Convert result to JSON
    data_to_return = [{"id": row[0], "name": row[1], "amount": row[2], "date": row[3]} for row in salaries]
    
    return make_response(jsonify(data_to_return), 200)

# ✅ GET a single salary by ID
@salaries_bp.route("/api/v1.0/salaries/<int:id>", methods=["GET"])
def show_one_salary(id):
    """
    GET: Retrieve a single salary by ID.
    """
    cursor.execute("SELECT id, name, amount, date FROM salaries WHERE id = ?", (id,))
    salary = cursor.fetchone()

    if salary:
        salary_data = {"id": salary[0], "name": salary[1], "amount": salary[2], "date": salary[3]}
        return make_response(jsonify(salary_data), 200)
    else:
        return make_response(jsonify({"error": "Invalid salary ID"}), 404)

# ✅ POST: Add a new salary
@salaries_bp.route("/api/v1.0/salaries", methods=["POST"])
def add_salary():
    """
    POST: Add a new salary.
    """
    data = request.json
    if "name" in data and "amount" in data:
        name = data["name"]
        amount = data["amount"]
        date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # Automatically add current date

        cursor.execute("INSERT INTO salaries (name, amount, date) VALUES (?, ?, ?)", (name, amount, date))
        conn.commit()  # Save changes

        # Get the ID of the inserted record
        cursor.execute("SELECT SCOPE_IDENTITY()")
        new_salary_id = cursor.fetchone()[0]
        
        new_salary_link = url_for('salaries_bp.show_one_salary', id=new_salary_id, _external=True)
        return make_response(jsonify({"url": new_salary_link}), 201)
    else:
        return make_response(jsonify({"error": "Missing form data"}), 400)

# ✅ PUT: Edit an existing salary
@salaries_bp.route("/api/v1.0/salaries/<int:id>", methods=["PUT"])
def edit_salary(id):
    """
    PUT: Edit an existing salary by ID.
    """
    data = request.json
    if "name" in data and "amount" in data and "date" in data:
        cursor.execute("UPDATE salaries SET name = ?, amount = ?, date = ? WHERE id = ?", 
                       (data["name"], data["amount"], data["date"], id))
        conn.commit()

        if cursor.rowcount > 0:
            edited_salary_link = url_for('salaries_bp.show_one_salary', id=id, _external=True)
            return make_response(jsonify({"url": edited_salary_link}), 200)
        else:
            return make_response(jsonify({"error": "Invalid salary ID"}), 404)
    else:
        return make_response(jsonify({"error": "Missing form data"}), 400)

# ✅ DELETE: Remove a salary
@salaries_bp.route("/api/v1.0/salaries/<int:id>", methods=["DELETE"])
def delete_salary(id):
    """
    DELETE: Delete a salary by ID.
    """
    cursor.execute("DELETE FROM salaries WHERE id = ?", (id,))
    conn.commit()

    if cursor.rowcount > 0:
        return make_response(jsonify({}), 204)
    else:
        return make_response(jsonify({"error": "Invalid salary ID"}), 404)

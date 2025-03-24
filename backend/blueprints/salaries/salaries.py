import uuid
from flask import Blueprint, request, jsonify, make_response, url_for
from datetime import datetime
from globals import cursor, conn  # Import the SQL Server connection

salaries_bp = Blueprint('salaries_bp', __name__)

# ✅ GET all salaries with pagination
@salaries_bp.route("/api/v1.0/salaries", methods=["GET"])
def show_all_salaries():
    page_num = int(request.args.get('pn', 1))
    page_size = int(request.args.get('ps', 10))
    offset = (page_num - 1) * page_size

    cursor.execute(
        "SELECT id, name, amount, date FROM salaries ORDER BY id OFFSET ? ROWS FETCH NEXT ? ROWS ONLY",
        (offset, page_size)
    )
    salaries = cursor.fetchall()

    data_to_return = [{
        "id": row[0],
        "name": row[1],
        "amount": float(row[2]),
        "date": row[3].strftime("%Y-%m-%d %H:%M:%S") if isinstance(row[3], datetime) else str(row[3])
    } for row in salaries]

    return make_response(jsonify(data_to_return), 200)

# ✅ GET a single salary by ID
@salaries_bp.route("/api/v1.0/salaries/<string:id>", methods=["GET"])
def show_one_salary(id):
    cursor.execute("SELECT id, name, amount, date FROM salaries WHERE id = ?", (id,))
    salary = cursor.fetchone()

    if salary:
        salary_data = {
            "id": salary[0],
            "name": salary[1],
            "amount": float(salary[2]),
            "date": salary[3].strftime("%Y-%m-%d %H:%M:%S") if isinstance(salary[3], datetime) else str(salary[3])
        }
        return make_response(jsonify(salary_data), 200)
    else:
        return make_response(jsonify({"error": "Salary not found"}), 404)

# ✅ POST: Add a new salary
@salaries_bp.route("/api/v1.0/salaries", methods=["POST"])
def add_salary():
    """
    POST: Add a new salary.
    """
    data = request.json if request.is_json else request.form.to_dict()

    if "name" in data and "amount" in data:
        new_id = str(uuid.uuid4())  # Generate UUID
        name = data["name"]
        amount = float(data["amount"])
        date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # Auto-generate date

        cursor.execute(
            "INSERT INTO salaries (id, name, amount, date) VALUES (?, ?, ?, ?)",
            (new_id, name, amount, date)
        )
        conn.commit()

        return make_response(jsonify({"message": "Salary added", "id": new_id, "date": date}), 201)
    else:
        return make_response(jsonify({"error": "Missing required fields"}), 400)

# ✅ PUT: Edit an existing salary
@salaries_bp.route("/api/v1.0/salaries/<string:id>", methods=["PUT"])
def edit_salary(id):
    """
    PUT: Edit an existing salary by ID.
    """
    data = request.json if request.is_json else request.form.to_dict()

    # Check if the record exists before updating
    cursor.execute("SELECT COUNT(*) FROM salaries WHERE id = ?", (id,))
    exists = cursor.fetchone()[0]

    if exists == 0:
        return make_response(jsonify({"error": "Salary not found"}), 404)

    if "name" in data and "amount" in data:
        name = data["name"]
        amount = float(data["amount"])
        # Update the date to the current time on modification
        date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        cursor.execute(
            "UPDATE salaries SET name = ?, amount = ?, date = ? WHERE id = ?",
            (name, amount, date, id)
        )
        conn.commit()

        edited_salary_link = url_for('salaries_bp.show_one_salary', id=id, _external=True)
        return make_response(jsonify({"message": "Salary updated", "url": edited_salary_link}), 200)
    else:
        return make_response(jsonify({"error": "Missing required fields"}), 400)

# ✅ DELETE: Remove a salary
@salaries_bp.route("/api/v1.0/salaries/<string:id>", methods=["DELETE"])
def delete_salary(id):
    cursor.execute("DELETE FROM salaries WHERE id = ?", (id,))
    conn.commit()

    if cursor.rowcount > 0:
        return make_response(jsonify({}), 204)
    else:
        return make_response(jsonify({"error": "Invalid salary ID"}), 404)

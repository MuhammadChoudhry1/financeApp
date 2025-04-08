import uuid
from flask import Blueprint, request, jsonify, make_response, url_for
from datetime import datetime
from globals import cursor, conn  # SQL connection
from decorators import login_required  # Assumes this injects `username`

salaries_bp = Blueprint('salaries_bp', __name__)

# ✅ GET all salaries (filtered by username)
@salaries_bp.route("/api/v1.0/salaries", methods=["GET"])
@login_required
def show_all_salaries(username):
    page_num = int(request.args.get('pn', 1))
    page_size = int(request.args.get('ps', 10))
    offset = (page_num - 1) * page_size

    cursor.execute(
        "SELECT id, name, amount, date FROM salaries WHERE username = ? ORDER BY id OFFSET ? ROWS FETCH NEXT ? ROWS ONLY",
        (username, offset, page_size)
    )
    salaries = cursor.fetchall()

    data_to_return = [{
        "id": row[0],
        "name": row[1],
        "amount": float(row[2]),
        "date": row[3].strftime("%Y-%m-%d %H:%M:%S") if isinstance(row[3], datetime) else str(row[3])
    } for row in salaries]

    return make_response(jsonify(data_to_return), 200)

# ✅ GET single salary (only if owned by user)
@salaries_bp.route("/api/v1.0/salaries/<string:id>", methods=["GET"])
@login_required
def show_one_salary(id, username):
    cursor.execute(
        "SELECT id, name, amount, date FROM salaries WHERE id = ? AND username = ?",
        (id, username)
    )
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
        return make_response(jsonify({"error": "Salary not found or unauthorized"}), 404)

# ✅ POST: Add new salary for this user
@salaries_bp.route("/api/v1.0/salaries", methods=["POST"])
@login_required
def add_salary(username):
    data = request.json if request.is_json else request.form.to_dict()

    if "name" in data and "amount" in data:
        new_id = str(uuid.uuid4())
        name = data["name"]
        amount = float(data["amount"])
        date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        cursor.execute(
            "INSERT INTO salaries (id, name, amount, date, username) VALUES (?, ?, ?, ?, ?)",
            (new_id, name, amount, date, username)
        )
        conn.commit()

        return make_response(jsonify({"message": "Salary added", "id": new_id, "date": date}), 201)
    else:
        return make_response(jsonify({"error": "Missing required fields"}), 400)

# ✅ PUT: Edit only if salary belongs to user
@salaries_bp.route("/api/v1.0/salaries/<string:id>", methods=["PUT"])
@login_required
def edit_salary(id, username):
    data = request.json if request.is_json else request.form.to_dict()

    # Check ownership
    cursor.execute("SELECT COUNT(*) FROM salaries WHERE id = ? AND username = ?", (id, username))
    exists = cursor.fetchone()[0]

    if exists == 0:
        return make_response(jsonify({"error": "Salary not found or unauthorized"}), 404)

    if "name" in data and "amount" in data:
        name = data["name"]
        amount = float(data["amount"])
        date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        cursor.execute(
            "UPDATE salaries SET name = ?, amount = ?, date = ? WHERE id = ? AND username = ?",
            (name, amount, date, id, username)
        )
        conn.commit()

        edited_salary_link = url_for('salaries_bp.show_one_salary', id=id, _external=True)
        return make_response(jsonify({"message": "Salary updated", "url": edited_salary_link}), 200)
    else:
        return make_response(jsonify({"error": "Missing required fields"}), 400)

# ✅ DELETE: Remove only if owned by user
@salaries_bp.route("/api/v1.0/salaries/<string:id>", methods=["DELETE"])
@login_required
def delete_salary(id, username):
    cursor.execute("DELETE FROM salaries WHERE id = ? AND username = ?", (id, username))
    conn.commit()

    if cursor.rowcount > 0:
        return make_response(jsonify({}), 204)
    else:
        return make_response(jsonify({"error": "Salary not found or unauthorized"}), 404)

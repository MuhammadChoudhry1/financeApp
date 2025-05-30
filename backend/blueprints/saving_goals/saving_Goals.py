import uuid
from flask import Blueprint, request, jsonify, make_response, url_for
from datetime import datetime
from globals import cursor, conn  
from pyodbc import IntegrityError  
from decorators import login_required  

saving_bp = Blueprint('saving_bp', __name__)

allowed_statuses = ['completed', 'ongoing', 'save']

@saving_bp.route("/api/v1.0/saving_goals", methods=["GET"])
@login_required
def show_all_saving_goals(username):
    page_num = int(request.args.get('pn', 1))
    page_size = int(request.args.get('ps', 10))
    offset = (page_num - 1) * page_size

    cursor.execute(
        "SELECT id, description, amount, category, status, date FROM saving_goals WHERE username = ? ORDER BY id OFFSET ? ROWS FETCH NEXT ? ROWS ONLY",
        (username, offset, page_size)
    )
    saving_goals = cursor.fetchall()

    data_to_return = [{
        "id": str(row[0]),
        "description": row[1],
        "amount": float(row[2]),
        "category": row[3],
        "status": row[4],
        "date": row[5].strftime("%Y-%m-%d %H:%M:%S") if isinstance(row[5], datetime) else str(row[5])
    } for row in saving_goals]

    return make_response(jsonify(data_to_return), 200)

@saving_bp.route("/api/v1.0/saving_goals/<string:id>", methods=["GET"])
@login_required
def show_one_saving_goal(id, username):
    cursor.execute(
        "SELECT id, description, amount, category, status, date FROM saving_goals WHERE id = ? AND username = ?",
        (id, username)
    )
    saving_goal = cursor.fetchone()

    if saving_goal:
        saving_goal_data = {
            "id": str(saving_goal[0]),
            "description": saving_goal[1],
            "amount": float(saving_goal[2]),
            "category": saving_goal[3],
            "status": saving_goal[4],
            "date": saving_goal[5].strftime("%Y-%m-%d %H:%M:%S") if isinstance(saving_goal[5], datetime) else str(saving_goal[5])
        }
        return make_response(jsonify(saving_goal_data), 200)
    else:
        return make_response(jsonify({"error": "Saving goal not found"}), 404)

@saving_bp.route("/api/v1.0/saving_goals", methods=["POST"])
@login_required
def add_saving_goal(username):
    if request.is_json:
        data = request.json
    else:
        data = request.form.to_dict()

    description = data.get("description")
    amount = data.get("amount")
    category = data.get("category")
    status = data.get("status", "save")

    if description and amount and category and status in allowed_statuses:
        new_id = str(uuid.uuid4())
        amount = float(amount)
        date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        try:
            cursor.execute(
                "INSERT INTO saving_goals (id, description, amount, category, status, date, username) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (new_id, description, amount, category, status, date, username),
            )
            conn.commit()
            return make_response(jsonify({"message": "Saving goal added", "id": new_id}), 201)
        except IntegrityError as e:
            return make_response(jsonify({"error": "Invalid status value"}), 400)
        except Exception as e:
            return make_response(jsonify({"error": str(e)}), 500)
    else:
        return make_response(jsonify({"error": "Missing required fields or invalid status"}), 400)

@saving_bp.route("/api/v1.0/saving_goals/<string:id>", methods=["PUT"])
@login_required
def edit_saving_goal(id, username):
    if request.is_json:
        data = request.json
    else:
        data = request.form.to_dict()

    cursor.execute("SELECT COUNT(*) FROM saving_goals WHERE id = ? AND username = ?", (id, username))
    exists = cursor.fetchone()[0]

    if exists == 0:
        return make_response(jsonify({"error": "Saving goal not found or unauthorized"}), 404)

    description = data.get("description")
    amount = data.get("amount")
    category = data.get("category", "")
    status = data.get("status")
    date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if description and amount:
        if not status:
            cursor.execute("SELECT status FROM saving_goals WHERE id = ? AND username = ?", (id, username))
            status = cursor.fetchone()[0]
        elif status not in allowed_statuses:
            return make_response(jsonify({"error": "Invalid status value"}), 400)

        cursor.execute(
            "UPDATE saving_goals SET description = ?, amount = ?, category = ?, status = ?, date = ? WHERE id = ? AND username = ?",
            (description, float(amount), category, status, date, id, username),
        )
        conn.commit()

        edited_saving_goal_link = url_for('saving_bp.show_one_saving_goal', id=id, _external=True)
        return make_response(jsonify({"message": "Saving goal updated", "url": edited_saving_goal_link}), 200)
    else:
        return make_response(jsonify({"error": "Missing required fields"}), 400)

@saving_bp.route("/api/v1.0/saving_goals/<string:id>", methods=["DELETE"])
@login_required
def delete_saving_goal(id, username):
    cursor.execute("DELETE FROM saving_goals WHERE id = ? AND username = ?", (id, username))
    conn.commit()

    if cursor.rowcount > 0:
        return make_response(jsonify({}), 204)
    else:
        return make_response(jsonify({"error": "Invalid saving goal ID or unauthorized"}), 404)

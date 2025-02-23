import uuid
from flask import Blueprint, request, jsonify, make_response, url_for
from datetime import datetime
from globals import cursor, conn  # SQL Connection

saving_bp = Blueprint('saving_bp', __name__)

# ✅ GET all saving goals with pagination
@saving_bp.route("/api/v1.0/saving_goals", methods=["GET"])
def show_all_saving_goals():
    page_num = int(request.args.get('pn', 1))
    page_size = int(request.args.get('ps', 10))
    offset = (page_num - 1) * page_size

    cursor.execute("SELECT id, description, amount, category, date FROM saving_goals ORDER BY id OFFSET ? ROWS FETCH NEXT ? ROWS ONLY", (offset, page_size))
    saving_goals = cursor.fetchall()

    data_to_return = [{
        "id": str(row[0]),  # Ensure UUID is string
        "description": row[1],
        "amount": float(row[2]),  # Ensure numeric type
        "category": row[3],
        "date": row[4].strftime("%Y-%m-%d %H:%M:%S") if isinstance(row[4], datetime) else str(row[4])
    } for row in saving_goals]

    return make_response(jsonify(data_to_return), 200)

# ✅ GET a single saving goal by ID
@saving_bp.route("/api/v1.0/saving_goals/<string:id>", methods=["GET"])
def show_one_saving_goal(id):
    cursor.execute("SELECT id, description, amount, category, date FROM saving_goals WHERE id = ?", (id,))
    saving_goal = cursor.fetchone()

    if saving_goal:
        saving_goal_data = {
            "id": str(saving_goal[0]),  
            "description": saving_goal[1],
            "amount": float(saving_goal[2]),
            "category": saving_goal[3],
            "date": saving_goal[4].strftime("%Y-%m-%d %H:%M:%S") if isinstance(saving_goal[4], datetime) else str(saving_goal[4])
        }
        return make_response(jsonify(saving_goal_data), 200)
    else:
        return make_response(jsonify({"error": "Saving goal not found"}), 404)

allowed_statuses = ['save', 'ongoing', 'completed']

@saving_bp.route("/api/v1.0/saving_goals", methods=["POST"])
def add_saving_goal():
    """
    POST: Add a new saving goal.
    """

    # Extract form-data correctly when using `x-www-form-urlencoded`
    description = request.form.get("description")
    amount = request.form.get("amount")
    category = request.form.get("category")
    status = request.form.get("status", "save")  # Default to "save" if missing

    # Validate that required fields are provided and status is valid
    if description and amount and category and status in allowed_statuses:
        new_id = str(uuid.uuid4())  # Generate UUID
        amount = float(amount)  # Convert to float
        date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # Auto-generate date

        # Insert into the database
        cursor.execute(
            "INSERT INTO saving_goals (id, description, amount, category, status, date) VALUES (?, ?, ?, ?, ?, ?)",
            (new_id, description, amount, category, status, date),
        )
        conn.commit()

        return make_response(jsonify({"message": "Saving goal added", "id": new_id}), 201)
    else:
        return make_response(jsonify({"error": "Missing required fields or invalid status"}), 400)

@saving_bp.route("/api/v1.0/saving_goals/<string:id>", methods=["PUT"])
def edit_saving_goal(id):
    """
    PUT: Edit an existing saving goal by ID.
    """
    if request.is_json:
        data = request.json  # If JSON is sent
    else:
        data = request.form.to_dict()  # If form-data is sent (x-www-form-urlencoded)

    # Check if the record exists before updating
    cursor.execute("SELECT COUNT(*) FROM saving_goals WHERE id = ?", (id,))
    exists = cursor.fetchone()[0]

    if exists == 0:
        return make_response(jsonify({"error": "Saving goal not found"}), 404)

    # Extract fields, ensuring `status` is included
    description = data.get("description")
    amount = data.get("amount")
    category = data.get("category", "")
    status = data.get("status")  # Keep current status if not provided
    date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if description and amount:
        # If `status` is not provided, retain the old value
        if not status:
            cursor.execute("SELECT status FROM saving_goals WHERE id = ?", (id,))
            status = cursor.fetchone()[0]
        elif status not in allowed_statuses:
            return make_response(jsonify({"error": "Invalid status value"}), 400)

        cursor.execute(
            "UPDATE saving_goals SET description = ?, amount = ?, category = ?, status = ?, date = ? WHERE id = ?",
            (description, float(amount), category, status, date, id),
        )
        conn.commit()

        edited_saving_goal_link = url_for('saving_bp.show_one_saving_goal', id=id, _external=True)
        return make_response(jsonify({"message": "Saving goal updated", "url": edited_saving_goal_link}), 200)
    else:
        return make_response(jsonify({"error": "Missing required fields"}), 400)
 
# ✅ DELETE: Remove a saving goal
@saving_bp.route("/api/v1.0/saving_goals/<string:id>", methods=["DELETE"])
def delete_saving_goal(id):
    cursor.execute("DELETE FROM saving_goals WHERE id = ?", (id,))
    conn.commit()

    if cursor.rowcount > 0:
        return make_response(jsonify({}), 204)
    else:
        return make_response(jsonify({"error": "Invalid saving goal ID"}), 404)


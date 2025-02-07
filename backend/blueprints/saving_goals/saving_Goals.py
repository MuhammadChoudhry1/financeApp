from flask import Blueprint, request, jsonify, make_response, url_for
from bson import ObjectId
from datetime import datetime
from globals import db

saving_bp = Blueprint('saving_bp', __name__)

saving_goals_collection = db.saving_goals

@saving_bp.route("/api/v1.0/saving_goals", methods=["GET"])
def show_all_saving_goals():
    """
    GET: Retrieve all saving goals with pagination.
    """
    page_num, page_size = 1, 10
    if request.args.get('pn'):
        page_num = int(request.args.get('pn'))
    if request.args.get('ps'):
        page_size = int(request.args.get('ps'))
    page_start = (page_size * (page_num - 1))
    data_to_return = []
    for saving_goal in saving_goals_collection.find().skip(page_start).limit(page_size):
        saving_goal['_id'] = str(saving_goal['_id'])
        data_to_return.append(saving_goal)
    return make_response(jsonify(data_to_return), 200)

@saving_bp.route("/api/v1.0/saving_goals/<string:id>", methods=["GET"])
def show_one_saving_goal(id):
    """
    GET: Retrieve a single saving goal by ID.
    """
    if not ObjectId.is_valid(id):
        return make_response(jsonify({"error": "Invalid saving goal ID format"}), 400)
    saving_goal = saving_goals_collection.find_one({'_id': ObjectId(id)})
    if saving_goal is not None:
        saving_goal['_id'] = str(saving_goal['_id'])
        return make_response(jsonify(saving_goal), 200)
    else:
        return make_response(jsonify({"error": "Invalid saving goal ID"}), 404)

@saving_bp.route("/api/v1.0/saving_goals", methods=["POST"])
def add_saving_goal():
    """
    POST: Add a new saving goal.
    """
    if "name" in request.form and "target_amount" in request.form:
        new_saving_goal = {
            "name": request.form["name"],
            "target_amount": request.form["target_amount"],
            "category": request.form.get("category", ""),  # Optional field
            "description": request.form.get("description", ""),  # Optional field
            "status": request.form.get("status", ""),  # Optional field
            "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # Automatically add current date and time
        }
        new_saving_goal_id = saving_goals_collection.insert_one(new_saving_goal)
        new_saving_goal_link = url_for('saving_bp.show_one_saving_goal', id=str(new_saving_goal_id.inserted_id), _external=True)
        return make_response(jsonify({"url": new_saving_goal_link}), 201)
    else:
        return make_response(jsonify({"error": "Missing form data"}), 400)  # Corrected status code to 400

@saving_bp.route("/api/v1.0/saving_goals/<string:id>", methods=["PUT"])
def edit_saving_goal(id):
    """
    PUT: Edit an existing saving goal by ID.
    """
    if "name" in request.form and "target_amount" in request.form and "date" in request.form:
        result = saving_goals_collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": {
                "name": request.form["name"],
                "target_amount": request.form["target_amount"],
                "date": request.form["date"]
            }}
        )
        if result.matched_count == 1:
            edited_saving_goal_link = url_for('saving_bp.show_one_saving_goal', id=id, _external=True)
            return make_response(jsonify({"url": edited_saving_goal_link}), 200)
        else:
            return make_response(jsonify({"error": "Invalid saving goal ID"}), 404)
    else:
        return make_response(jsonify({"error": "Missing form data"}), 404)

@saving_bp.route("/api/v1.0/saving_goals/<string:id>", methods=["DELETE"])
def delete_saving_goal(id):
    """
    DELETE: Delete a saving goal by ID.
    """
    result = saving_goals_collection.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 1:
        return make_response(jsonify({}), 204)
    else:
        return make_response(jsonify({"error": "Invalid saving goal ID"}), 404)
    

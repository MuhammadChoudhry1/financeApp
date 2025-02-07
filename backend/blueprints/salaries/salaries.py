from flask import Blueprint, request, jsonify, make_response, url_for
import globals
from decorators import jwt_required
from datetime import datetime
from bson import ObjectId

salaries_bp = Blueprint('salaries_bp', __name__)

salaries_collection = globals.db.salaries

@salaries_bp.route("/api/v1.0/salaries", methods=["GET"])
def show_all_salaries():
    """
    GET: Retrieve all salaries with pagination.
    """
    page_num, page_size = 1, 10
    if request.args.get('pn'):
        page_num = int(request.args.get('pn'))
    if request.args.get('ps'):
        page_size = int(request.args.get('ps'))
    page_start = (page_size * (page_num - 1))
    data_to_return = []
    for salary in salaries_collection.find().skip(page_start).limit(page_size):
        salary['_id'] = str(salary['_id'])
        data_to_return.append(salary)
    return make_response(jsonify(data_to_return), 200)

@salaries_bp.route("/api/v1.0/salaries/<string:id>", methods=["GET"])
def show_one_salary(id):
    """
    GET: Retrieve a single salary by ID.
    """
    if not ObjectId.is_valid(id):
        return make_response(jsonify({"error": "Invalid salary ID format"}), 400)
    salary = salaries_collection.find_one({'_id': ObjectId(id)})
    if salary is not None:
        salary['_id'] = str(salary['_id'])
        return make_response(jsonify(salary), 200)
    else:
        return make_response(jsonify({"error": "Invalid salary ID"}), 404)

@salaries_bp.route("/api/v1.0/salaries", methods=["POST"])
def add_salary():
    """
    POST: Add a new salary.
    """
    if "name" in request.form and "amount" in request.form:
        new_salary = {
            "name": request.form["name"],
            "amount": request.form["amount"],
            "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # Automatically add current date and time
        }
        new_salary_id = salaries_collection.insert_one(new_salary)
        new_salary_link = url_for('salaries_bp.show_one_salary', id=str(new_salary_id.inserted_id), _external=True)
        return make_response(jsonify({"url": new_salary_link}), 201)
    else:
        return make_response(jsonify({"error": "Missing form data"}), 404)

@salaries_bp.route("/api/v1.0/salaries/<string:id>", methods=["PUT"])
def edit_salary(id):
    """
    PUT: Edit an existing salary by ID.
    """
    if "name" in request.form and "amount" in request.form and "date" in request.form:
        result = salaries_collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": {
                "name": request.form["name"],
                "amount": request.form["amount"],
                "date": request.form["date"]
            }}
        )
        if result.matched_count == 1:
            edited_salary_link = url_for('salaries_bp.show_one_salary', id=id, _external=True)
            return make_response(jsonify({"url": edited_salary_link}), 200)
        else:
            return make_response(jsonify({"error": "Invalid salary ID"}), 404)
    else:
        return make_response(jsonify({"error": "Missing form data"}), 404)

@salaries_bp.route("/api/v1.0/salaries/<string:id>", methods=["DELETE"])
def delete_salary(id):
    """
    DELETE: Delete a salary by ID.
    """
    result = salaries_collection.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 1:
        return make_response(jsonify({}), 204)
    else:
        return make_response(jsonify({"error": "Invalid salary ID"}), 404)

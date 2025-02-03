from flask import Blueprint, request, jsonify, make_response, url_for
import globals 
from decorators import jwt_required
from datetime import datetime
from bson import ObjectId

expense_bp = Blueprint('expense_bp', __name__)

expense_collection = globals.db.expenses

@expense_bp.route("/api/v1.0/expenses", methods=["GET"])
def show_all_expenses():
    """
    GET: Retrieve all expenses with pagination.
    """
    page_num, page_size = 1, 10
    if request.args.get('pn'):
        page_num = int(request.args.get('pn'))
    if request.args.get('ps'):
        page_size = int(request.args.get('ps'))
    page_start = (page_size * (page_num - 1))
    data_to_return = []
    for expense in expense_collection.find().skip(page_start).limit(page_size):
        expense['_id'] = str(expense['_id'])
        data_to_return.append(expense)
    return make_response(jsonify(data_to_return), 200)

@expense_bp.route("/api/v1.0/expenses/<string:id>", methods=["GET"])
@jwt_required
def show_one_expense(id):
    """
    GET: Retrieve a single expense by ID.
    """
    if not ObjectId.is_valid(id):
        return make_response(jsonify({"error": "Invalid expense ID format"}), 400)
    expense = expense_collection.find_one({'_id': ObjectId(id)})
    if expense is not None:
        expense['_id'] = str(expense['_id'])
        return make_response(jsonify(expense), 200)
    else:
        return make_response(jsonify({"error": "Invalid expense ID"}), 404)

@expense_bp.route("/api/v1.0/expenses", methods=["POST"])
def add_expense():
    """
    POST: Add a new expense.
    """
    if "name" in request.form and "amount" in request.form:
        new_expense = {
            "name": request.form["name"],
            "amount": request.form["amount"],
            "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # Automatically add current date and time
        }
        new_expense_id = expense_collection.insert_one(new_expense)
        new_expense_link = url_for('show_one_expense', id=str(new_expense_id.inserted_id), _external=True)
        return make_response(jsonify({"url": new_expense_link}), 201)
    else:
        return make_response(jsonify({"error": "Missing form data"}), 404)

@expense_bp.route("/api/v1.0/expenses/<string:id>", methods=["PUT"])
def edit_expense(id):
    """
    PUT: Edit an existing expense by ID.
    """
    if "name" in request.form and "amount" in request.form and "date" in request.form:
        result = expense_collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": {
                "name": request.form["name"],
                "amount": request.form["amount"],
                "date": request.form["date"]
            }}
        )
        if result.matched_count == 1:
            edited_expense_link = url_for('show_one_expense', id=id, _external=True)
            return make_response(jsonify({"url": edited_expense_link}), 200)
        else:
            return make_response(jsonify({"error": "Invalid expense ID"}), 404)
    else:
        return make_response(jsonify({"error": "Missing form data"}), 404)

@expense_bp.route("/api/v1.0/expenses/<string:id>", methods=["DELETE"])
def delete_expense(id):
    """
    DELETE: Delete an expense by ID.
    """
    result = expense_collection.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 1:
        return make_response(jsonify({}), 204)
    else:
        return make_response(jsonify({"error": "Invalid expense ID"}), 404)

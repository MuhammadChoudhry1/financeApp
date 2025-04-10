from flask import Flask, request
from flask_cors import CORS
from globals import conn 

from blueprints.salaries.salaries import salaries_bp
from blueprints.expenses.expenses import expense_bp
from blueprints.saving_goals.saving_Goals import saving_bp
from blueprints.auth.auth import auth_bp
from blueprints.graphs.graphs_expenses import expense_graph_bp
from blueprints.ML.forecast_api import ml_bp
from blueprints.totalsalaries.totalsalaries import totals_bp
from blueprints.budget.budget import budget_bp

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

app.config['SECRET_KEY'] = 'mysecret'

@app.before_request
def log_request_info():
    print(f"Request Method: {request.method}")
    print(f"Request URL: {request.url}")
    print(f"Request Headers: {request.headers}")
    print(f"Request Body: {request.get_data(as_text=True)}")

app.register_blueprint(auth_bp)
app.register_blueprint(expense_bp)
app.register_blueprint(salaries_bp)
app.register_blueprint(saving_bp)
app.register_blueprint(expense_graph_bp)
app.register_blueprint(ml_bp)
app.register_blueprint(totals_bp)
app.register_blueprint(budget_bp)

if __name__ == '__main__':
    print("Starting Flask application...")
    app.run(host='0.0.0.0', port=5000, debug=True)

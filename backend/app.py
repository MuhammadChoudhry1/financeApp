from flask import Flask
from flask_cors import CORS
from globals import conn  # Ensures database connection is initialized

# Import blueprints
from blueprints.salaries.salaries import salaries_bp
from blueprints.expenses.expenses import expense_bp
from blueprints.saving_goals.saving_Goals import saving_bp
from blueprints.auth.auth import auth_bp
from blueprints.graphs.graphs_expenses import expense_graph_bp

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Secret key for JWT
app.config['SECRET_KEY'] = 'mysecret'

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(expense_bp)
app.register_blueprint(salaries_bp)
app.register_blueprint(saving_bp)
app.register_blueprint(expense_graph_bp)

if __name__ == '__main__':
    print("Starting Flask application...")
    app.run(host='0.0.0.0', port=5000, debug=True)

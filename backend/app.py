from flask import Flask
from flask_cors import CORS

from blueprints.salaries.salaries import salaries_bp
from blueprints.auth.auth import auth_bp
from blueprints.expenses.expenses import expense_bp
from blueprints.saving_goals.saving_Goals import saving_bp

app = Flask(__name__)
# Allow CORS for all origins and methods
CORS(app, resources={r"/*": {"origins": "*"}})

app.register_blueprint(expense_bp)
app.register_blueprint(salaries_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(saving_bp)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

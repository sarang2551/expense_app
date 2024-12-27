from flask import Flask,jsonify,request
from datetime import datetime
from flask_jwt_extended import create_access_token,get_jwt,get_jwt_identity, \
                               unset_jwt_cookies, jwt_required, JWTManager
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=os.getenv("FRONTEND_URL"))
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
if not app.config["JWT_SECRET_KEY"]:
    raise RuntimeError("Missing environment variable JWT_SECRET_KEY.")

jwt = JWTManager(app)

@app.route('/')
def home():
    return 'Hello, World!'

@app.route('/time')
def get_time():
    return f'The current time is: {datetime.now()}'

@app.route('/expense/add', methods=['POST'])
@jwt_required()  # Protect this route
def add_expense():
    current_user = get_jwt_identity()  # Get the identity from the JWT
    if not current_user:
        return jsonify({'message': 'Unauthorized'}), 401

    try:
        expense_data = request.get_json()

        # Validate expense_data
        if not expense_data or not all(key in expense_data for key in ["itemName", "amount", "category"]):
            return jsonify({"message": "Invalid expense data"}), 400

        item_name = expense_data["itemName"]
        amount = expense_data["amount"]
        category = expense_data["category"]

        # Now you have the current user's identity and the expense data
        print(f"User {current_user} is adding an expense:")
        print(f"Item Name: {item_name}")
        print(f"Amount: {amount}")
        print(f"Category: {category}")

        # Add logic to store the expense in your database, associating it with current_user
        # Example (adapt to your database):
        # new_expense = Expense(user_id=current_user.id, item_name=item_name, amount=amount, category=category)
        # db.session.add(new_expense)
        # db.session.commit()

        return jsonify({'message': 'Expense added successfully!'}), 201

    except Exception as e:
        print(f"Error adding expense: {e}")
        return jsonify({"message": "Failed to add expense"}), 500

@app.route('/user/login', methods=['POST'])
def login():
    username = request.json.get('username')
    password = request.json.get('password')

    if username == 'test' and password == 'test':  # Testing credentials
        access_token = create_access_token(identity=username)
        return jsonify({'access_token': access_token})
    else:
        return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/user/register', methods=['POST'])
def register():
    username = request.json.get('username')
    password = request.json.get('password')
    if not username or not password:
        return jsonify({'message': 'Missing username or password'}), 400

    return jsonify({'message': 'User registration successful'}), 201
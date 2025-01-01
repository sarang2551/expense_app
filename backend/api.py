from flask import Flask,jsonify,request
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import create_access_token,get_jwt,get_jwt_identity, \
                               unset_jwt_cookies, jwt_required, JWTManager
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=os.getenv("FRONTEND_URL"))
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_TOKEN_LOCATION"] = ["cookies"] # Store JWT in cookies
app.config["JWT_ACCESS_COOKIE_NAME"] = "jwt_token"
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("SQLALCHEMY_DATABASE_URI")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_COOKIE_CSRF_PROTECT']=False # For testing

jwt = JWTManager(app)

db = SQLAlchemy(app=app)
#db.init_app(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    password = db.Column(db.String(128))
    def __repr__(self):
        return '<User {}>'.format(self.username)

class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    item_name = db.Column(db.String(128))
    amount = db.Column(db.Numeric(10, 2))  # Use Numeric for currency
    category = db.Column(db.String(128), default="Other")
    user_id = db.Column(db.Integer, db.ForeignKey('user.id')) # Foreign Key
    user = db.relationship('User', backref=db.backref('expenses', lazy=True)) # Relationship

    def __repr__(self):
        return f'<Expense {self.item_name} - {self.amount}>'

if not app.config["SQLALCHEMY_DATABASE_URI"]:
    raise RuntimeError("Missing environment variable SQLALCHEMY_DATABASE_URI.")
if not app.config["JWT_SECRET_KEY"]:
    raise RuntimeError("Missing environment variable JWT_SECRET_KEY.")

with app.app_context():
    db.create_all() # creates all the necessary tables


@app.route('/')
def home():
    return 'Hello, World!'

@app.route('/expense/add', methods=['POST'])
@jwt_required()
def add_expense():
    current_user = get_jwt_identity()
    if not current_user:
        return jsonify({'message': 'Unauthorized'}), 401

    try:
        expense_data = request.get_json()
        print("Adding expense: ", expense_data)
        if not expense_data or not all(key in expense_data for key in ["itemName", "amount", "category"]):
            return jsonify({"message": "Invalid expense data"}), 400

        item_name = expense_data["itemName"]
        amount = expense_data["amount"]
        category = expense_data["category"]

        userObj = User.query.filter_by(username=current_user).first()
        if not userObj:  # Handle the case where the user is not found (shouldn't happen if JWT is valid)
            return jsonify({"message": "User not found"}), 400

        new_expense = Expense(item_name=item_name, amount=amount, category=category, user_id=userObj.id)
        db.session.add(new_expense)
        db.session.commit()

        return jsonify({'message': 'Expense added successfully!'}), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error adding expense: {e}")
        return jsonify({"message": "Failed to add expense"}), 500

@app.route('/user/login', methods=['POST'])
def login():
    username = request.json.get('username')
    password = request.json.get('password')

    if not username or not password:
        return jsonify({'message': 'Missing username or password'}), 400

    user = User.query.filter_by(username=username).first()

    if not user:
        return jsonify({'message': 'Invalid credentials'}), 401

    if user.password != password:  # Replace with actual password check
        return jsonify({'message': 'Invalid credentials'}), 401

    access_token = create_access_token(identity=username)
    response = jsonify({'message': 'Login successful'}) 
    print("Using token: ", access_token)
    response.set_cookie('jwt_token', access_token, httponly=True, samesite='Strict', secure=False, path="/") # Secure=False for development
    return response, 200

@app.route('/user/register', methods=['POST'])
def register():
    username = request.json.get('username')
    password = request.json.get('password')

    if not username or not password:
        return jsonify({'message': 'Missing username or password'}), 400

    # Check if username already exists
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({'message': 'Username already exists'}), 400

    new_user = User(username=username, password=password) 
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registration successful'}), 201

if __name__ == '__main__':
    app.run(debug=True)
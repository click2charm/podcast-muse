"""
Simple Flask backend that doesn't require PostgreSQL
Uses SQLite for simplicity - perfect for testing!
"""

from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import uuid
import secrets
from datetime import datetime, timedelta
import os

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', secrets.token_urlsafe(32))

# Add CORS
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Database setup
def init_db():
    """Initialize SQLite database"""
    conn = sqlite3.connect('podcast_muse.db')
    cursor = conn.cursor()

    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            first_name TEXT,
            last_name TEXT,
            credits INTEGER DEFAULT 100,
            is_admin INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Create projects table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            script TEXT,
            audio_url TEXT,
            status TEXT DEFAULT 'draft',
            credits_used INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')

    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

# Helper functions
def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect('podcast_muse.db')
    conn.row_factory = sqlite3.Row
    return conn

def generate_jwt_token(user_id):
    """Generate a simple JWT-like token"""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(hours=24),
        'iat': datetime.utcnow()
    }
    return secrets.token_urlsafe(32)  # Simple token for demo

# Pydantic-like validation
def validate_user_data(data):
    """Validate user input data"""
    errors = []
    if not data.get('email'):
        errors.append('Email is required')
    if not data.get('password') or len(data['password']) < 6:
        errors.append('Password must be at least 6 characters')
    return errors

def validate_project_data(data):
    """Validate project input data"""
    errors = []
    if not data.get('title'):
        errors.append('Title is required')
    return errors

# Routes
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "timestamp": datetime.utcnow().isoformat()})

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register new user"""
    data = request.get_json()

    # Validate input
    errors = validate_user_data(data)
    if errors:
        return jsonify({"error": "Validation failed", "details": errors}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if user already exists
        cursor.execute("SELECT id FROM users WHERE email = ?", (data['email'],))
        if cursor.fetchone():
            return jsonify({"error": "User with this email already exists"}), 400

        # Create new user
        user_id = str(uuid.uuid4())
        password_hash = generate_password_hash(data['password'])

        cursor.execute('''
            INSERT INTO users (id, email, password_hash, first_name, last_name)
            VALUES (?, ?, ?, ?, ?)
        ''', (user_id, data['email'], password_hash,
              data.get('first_name'), data.get('last_name')))

        conn.commit()
        conn.close()

        # Generate token
        token = generate_jwt_token(user_id)

        return jsonify({
            "message": "User registered successfully",
            "user": {
                "id": user_id,
                "email": data['email'],
                "first_name": data.get('first_name'),
                "last_name": data.get('last_name'),
                "credits": 100
            },
            "token": token
        })

    except Exception as e:
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user"""
    data = request.get_json()

    if not data.get('email') or not data.get('password'):
        return jsonify({"error": "Email and password are required"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM users WHERE email = ?", (data['email'],))
        user = cursor.fetchone()

        if not user or not check_password_hash(user['password_hash'], data['password']):
            return jsonify({"error": "Invalid email or password"}), 401

        # Generate token
        token = generate_jwt_token(user['id'])

        conn.close()

        return jsonify({
            "message": "Login successful",
            "user": {
                "id": user['id'],
                "email": user['email'],
                "first_name": user['first_name'],
                "last_name": user['last_name'],
                "credits": user['credits'],
                "is_admin": bool(user['is_admin'])
            },
            "token": token
        })

    except Exception as e:
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

@app.route('/api/users/me', methods=['GET'])
def get_current_user():
    """Get current user profile"""
    # In a real app, verify JWT token here
    # For demo, return a mock user
    return jsonify({
        "id": str(uuid.uuid4()),
        "email": "demo@example.com",
        "first_name": "Demo",
        "last_name": "User",
        "credits": 100,
        "is_admin": False
    })

@app.route('/api/projects', methods=['GET', 'POST'])
def handle_projects():
    """Handle projects listing and creation"""
    if request.method == 'GET':
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            # In a real app, filter by user_id from JWT
            cursor.execute("SELECT * FROM projects ORDER BY created_at DESC")
            projects = [dict(row) for row in cursor.fetchall()]

            conn.close()

            return jsonify({"projects": projects})

        except Exception as e:
            return jsonify({"error": "Internal server error", "details": str(e)}), 500

    elif request.method == 'POST':
        data = request.get_json()

        # Validate input
        errors = validate_project_data(data)
        if errors:
            return jsonify({"error": "Validation failed", "details": errors}), 400

        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            project_id = str(uuid.uuid4())
            # In a real app, get user_id from JWT
            user_id = str(uuid.uuid4())

            cursor.execute('''
                INSERT INTO projects (id, user_id, title, description, script, status)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (project_id, user_id, data['title'],
                  data.get('description'), data.get('script'), 'draft'))

            conn.commit()
            conn.close()

            return jsonify({
                "message": "Project created successfully",
                "project": {
                    "id": project_id,
                    "user_id": user_id,
                    "title": data['title'],
                    "description": data.get('description'),
                    "script": data.get('script'),
                    "status": "draft",
                    "credits_used": 0
                }
            }), 201

        except Exception as e:
            return jsonify({"error": "Internal server error", "details": str(e)}), 500

@app.route('/api/projects/<project_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_project(project_id):
    """Handle individual project operations"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        if request.method == 'GET':
            cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
            project = cursor.fetchone()

            if not project:
                return jsonify({"error": "Project not found"}), 404

            return jsonify({"project": dict(project)})

        elif request.method == 'PUT':
            data = request.get_json()

            # Update project
            update_fields = []
            update_values = []

            for field in ['title', 'description', 'script', 'status', 'audio_url']:
                if field in data:
                    update_fields.append(f"{field} = ?")
                    update_values.append(data[field])

            if update_fields:
                update_values.append(project_id)
                cursor.execute(f'''
                    UPDATE projects
                    SET {', '.join(update_fields)}, updated_at = ?
                    WHERE id = ?
                ''', update_values + [datetime.utcnow().isoformat(), project_id])

                conn.commit()

            # Return updated project
            cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
            project = cursor.fetchone()

            conn.close()

            return jsonify({"project": dict(project)})

        elif request.method == 'DELETE':
            cursor.execute("DELETE FROM projects WHERE id = ?", (project_id,))
            conn.commit()
            conn.close()

            return jsonify({"message": "Project deleted successfully"})

    except Exception as e:
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

@app.route('/api/credits', methods=['GET'])
def get_credits():
    """Get user credits"""
    # In a real app, get user_id from JWT and return actual credits
    return jsonify({
        "credits": 100,
        "total_credits_earned": 100,
        "total_credits_used": 0
    })

# Simple mock endpoints for AI features
@app.route('/api/generate/script', methods=['POST'])
def generate_script():
    """Generate podcast script using AI (mock)"""
    data = request.get_json()

    # Mock response
    return jsonify({
        "script": f"""
# {data.get('title', 'My Podcast Episode')}

## Introduction
Welcome to this amazing episode! Today we're exploring {data.get('description', 'an interesting topic')}...

## Main Content
[This would be the generated podcast script based on your topic...]

## Conclusion
Thanks for listening! Don't forget to subscribe and share your thoughts.
        """,
        "credits_used": 10
    })

@app.route('/api/generate/audio', methods=['POST'])
def generate_audio():
    """Generate audio from script (mock)"""
    return jsonify({
        "audio_url": "https://example.com/generated-audio.mp3",
        "credits_used": 20
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

@app.errorhandler(400)
def bad_request(error):
    return jsonify({"error": "Bad request"}), 400

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=True)
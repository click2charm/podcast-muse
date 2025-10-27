"""
Simple FastAPI backend that doesn't require PostgreSQL
Uses SQLite for simplicity - perfect for testing!
"""

from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
import uuid
import hashlib
import secrets
from datetime import datetime, timedelta
import os

# Create FastAPI app
app = FastAPI(
    title="AI Podcast Generator - Simple Backend",
    description="Simplified backend for testing",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
            status TEXT DEFAULT 'draft',
            script_content TEXT,
            total_credits_used INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')

    # Create password reset tokens table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            token TEXT UNIQUE NOT NULL,
            expires_at TEXT NOT NULL,
            is_used INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')

    conn.commit()
    conn.close()

def ensure_admin_exists():
    """Ensure click2charm@gmail.com exists as admin"""
    conn = sqlite3.connect('podcast_muse.db')
    cursor = conn.cursor()

    # Check if admin email exists
    cursor.execute("SELECT id, is_admin, credits FROM users WHERE email = ?", ("click2charm@gmail.com",))
    admin_data = cursor.fetchone()

    if not admin_data:
        # Create admin user with default password
        admin_id = str(uuid.uuid4())
        default_password = "imchok6666"  # Your current password
        password_hash = hash_password(default_password)

        cursor.execute('''
            INSERT INTO users (id, email, password_hash, first_name, last_name, credits, is_admin)
            VALUES (?, ?, ?, 'Preecha', 'Subpasri', 1000, 1)
        ''', (admin_id, "click2charm@gmail.com", password_hash))

        print(f"✅ Admin user created: click2charm@gmail.com")
    else:
        user_id, is_admin, credits = admin_data
        # Only update if not already admin or credits are not 1000
        if is_admin != 1 or credits != 1000:
            cursor.execute("UPDATE users SET is_admin = 1, credits = 1000 WHERE email = ?", ("click2charm@gmail.com",))
            print("✅ Admin privileges ensured for: click2charm@gmail.com")

    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

def update_database_schema():
    """Update database schema if needed"""
    conn = sqlite3.connect('podcast_muse.db')
    cursor = conn.cursor()

    # Check if is_admin column exists in users table
    cursor.execute("PRAGMA table_info(users)")
    columns = [column[1] for column in cursor.fetchall()]

    if 'is_admin' not in columns:
        # Add is_admin column to existing users table
        cursor.execute("ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0")
        print("✅ Added is_admin column to users table")

    # Check if updated_at column exists (re-query columns after potential changes)
    cursor.execute("PRAGMA table_info(users)")
    columns = [column[1] for column in cursor.fetchall()]
    if 'updated_at' not in columns:
        # Add updated_at column to existing users table (SQLite doesn't support dynamic defaults)
        cursor.execute("ALTER TABLE users ADD COLUMN updated_at TEXT DEFAULT ''")
        # Update existing rows to have current timestamp
        cursor.execute("UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE updated_at = ''")
        print("✅ Added updated_at column to users table")

    # Check if credit_transactions table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='credit_transactions'")
    table_exists = cursor.fetchone()

    if not table_exists:
        # Create credit_transactions table
        cursor.execute('''
            CREATE TABLE credit_transactions (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                amount INTEGER NOT NULL,
                reason TEXT,
                created_at TEXT NOT NULL
            )
        ''')
        print("✅ Created credit_transactions table")

    conn.commit()
    conn.close()

# Update schema if needed
update_database_schema()
ensure_admin_exists()

# Pydantic models
class UserCreate(BaseModel):
    email: str
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None

class PasswordResetRequest(BaseModel):
    email: str

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

class UserResponse(BaseModel):
    id: str
    email: str
    first_name: Optional[str]
    last_name: Optional[str]
    credits: int
    is_admin: bool = False
    created_at: str

class ProjectResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str]
    status: str
    script_content: Optional[str]
    total_credits_used: int
    created_at: str

# Helper functions
def hash_password(password: str) -> str:
    """Hash password using simple approach"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    """Verify password"""
    return hash_password(password) == hashed

def get_db_connection():
    """Get database connection"""
    return sqlite3.connect('podcast_muse.db')

# Routes
@app.get("/")
async def root():
    return {
        "message": "🎧 AI Podcast Generator API (Simple Version)",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "SQLite (connected)",
        "environment": "development",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/v1/info")
async def api_info():
    return {
        "name": "AI Podcast Generator",
        "version": "1.0.0",
        "type": "Simple SQLite Backend",
        "features": ["Authentication", "Projects", "Credits"],
        "endpoints": {
            "auth": "/api/v1/auth",
            "users": "/api/v1/users",
            "projects": "/api/v1/projects"
        }
    }

# Authentication endpoints
@app.post("/api/v1/auth/register", response_model=UserResponse)
async def register(user: UserCreate):
    """Register a new user"""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if user already exists
    cursor.execute("SELECT id FROM users WHERE email = ?", (user.email,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create new user
    user_id = str(uuid.uuid4())
    password_hash = hash_password(user.password)

    cursor.execute('''
        INSERT INTO users (id, email, password_hash, first_name, last_name, credits)
        VALUES (?, ?, ?, ?, ?, 100)
    ''', (user_id, user.email, password_hash, user.first_name, user.last_name))

    conn.commit()

    # Get created user
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user_data = cursor.fetchone()

    # Get table structure for dynamic response
    cursor.execute("PRAGMA table_info(users)")
    columns = [column[1] for column in cursor.fetchall()]

    # Build response dynamically
    user_dict = {}
    for i, column_name in enumerate(columns):
        if i < len(user_data):
            user_dict[column_name] = user_data[i]

    conn.close()

    return UserResponse(
        id=user_dict.get('id', ''),
        email=user_dict.get('email', ''),
        first_name=user_dict.get('first_name'),
        last_name=user_dict.get('last_name'),
        credits=user_dict.get('credits', 0),
        is_admin=bool(user_dict.get('is_admin', 0)),
        created_at=user_dict.get('created_at', '')
    )

@app.post("/api/v1/auth/login")
async def login(credentials: UserLogin):
    """Login user"""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE email = ?", (credentials.email,))
    user_data = cursor.fetchone()

    if not user_data:
        conn.close()
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Get table structure first BEFORE closing connection
    cursor.execute("PRAGMA table_info(users)")
    columns = [column[1] for column in cursor.fetchall()]

    # Build user dict
    user_dict = {}
    for i, column_name in enumerate(columns):
        if i < len(user_data):
            user_dict[column_name] = user_data[i]

    # Verify password using the correct password hash column
    if not verify_password(credentials.password, user_dict.get('password_hash', '')):
        conn.close()
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Generate simple token (in production, use JWT)
    token = secrets.token_urlsafe(32)

    conn.close()

    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": 86400,
        "user": UserResponse(
            id=user_dict.get('id', ''),
            email=user_dict.get('email', ''),
            first_name=user_dict.get('first_name'),
            last_name=user_dict.get('last_name'),
            credits=user_dict.get('credits', 0),
            is_admin=bool(user_dict.get('is_admin', 0)),
            created_at=user_dict.get('created_at', '')
        )
    }

# User endpoints
@app.get("/api/v1/users/me", response_model=UserResponse)
async def get_current_user():
    """Get current user (returns admin user for demo)"""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Get table structure first
    cursor.execute("PRAGMA table_info(users)")
    columns = [column[1] for column in cursor.fetchall()]


    # Get admin user
    cursor.execute("SELECT * FROM users WHERE email = ?", ("click2charm@gmail.com",))
    user_data = cursor.fetchone()

    # Fallback to first user if admin not found
    if not user_data:
        cursor.execute("SELECT * FROM users ORDER BY id LIMIT 1")
        user_data = cursor.fetchone()

    conn.close()

    if not user_data:
        raise HTTPException(status_code=404, detail="No users found")

    # Build response dynamically based on available columns
    user_dict = {}
    for i, column_name in enumerate(columns):
        if i < len(user_data):
            user_dict[column_name] = user_data[i]

    return UserResponse(
        id=user_dict.get('id', ''),
        email=user_dict.get('email', ''),
        first_name=user_dict.get('first_name'),
        last_name=user_dict.get('last_name'),
        credits=user_dict.get('credits', 0),
        is_admin=bool(user_dict.get('is_admin', 0)),
        created_at=user_dict.get('created_at', '')
    )

# Project endpoints
@app.get("/api/v1/projects", response_model=List[ProjectResponse])
async def get_projects():
    """Get all projects (simplified)"""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM projects ORDER BY created_at DESC")
    projects = cursor.fetchall()
    conn.close()

    return [
        ProjectResponse(
            id=project[0],
            user_id=project[1],
            title=project[2],
            description=project[3],
            status=project[4],
            script_content=project[5],
            total_credits_used=project[6],
            created_at=project[7]
        )
        for project in projects
    ]

@app.post("/api/v1/projects", response_model=ProjectResponse)
async def create_project(project: ProjectCreate):
    """Create a new project"""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Get first user (simplified)
    cursor.execute("SELECT id FROM users LIMIT 1")
    user_data = cursor.fetchone()

    if not user_data:
        raise HTTPException(status_code=404, detail="No users found")

    user_id = user_data[0]
    project_id = str(uuid.uuid4())

    cursor.execute('''
        INSERT INTO projects (id, user_id, title, description, status)
        VALUES (?, ?, ?, ?, 'draft')
    ''', (project_id, user_id, project.title, project.description))

    conn.commit()

    # Get created project
    cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
    project_data = cursor.fetchone()
    conn.close()

    return ProjectResponse(
        id=project_data[0],
        user_id=project_data[1],
        title=project_data[2],
        description=project_data[3],
        status=project_data[4],
        script_content=project_data[5],
        total_credits_used=project_data[6],
        created_at=project_data[7]
    )

# Password reset endpoints
@app.post("/api/v1/auth/forgot-password")
async def forgot_password(request: PasswordResetRequest):
    """Request password reset"""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Find user by email
    cursor.execute("SELECT id FROM users WHERE email = ?", (request.email,))
    user_data = cursor.fetchone()

    if not user_data:
        conn.close()
        # For security, always return success even if email doesn't exist
        return {"message": "If your email is registered, you will receive a reset link", "debug": "email_not_found"}

    user_id = user_data[0]

    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    token_id = str(uuid.uuid4())
    expires_at = (datetime.now() + timedelta(hours=1)).isoformat()

    # Save token to database
    cursor.execute('''
        INSERT INTO password_reset_tokens (id, user_id, token, expires_at)
        VALUES (?, ?, ?, ?)
    ''', (token_id, user_id, reset_token, expires_at))

    conn.commit()
    conn.close()

    # In production, you would send an email here
    # For now, we'll just return the token (for testing only)
    return {
        "message": "Password reset link sent to your email",
        "reset_token": reset_token,  # Remove this in production
        "expires_at": expires_at
    }

@app.post("/api/v1/auth/reset-password")
async def reset_password(request: PasswordResetConfirm):
    """Reset password with token"""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Find valid token
    cursor.execute('''
        SELECT prt.user_id, prt.expires_at
        FROM password_reset_tokens prt
        WHERE prt.token = ? AND prt.is_used = 0
    ''', (request.token,))

    token_data = cursor.fetchone()

    if not token_data:
        conn.close()
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user_id, expires_at = token_data
    expires_datetime = datetime.fromisoformat(expires_at)

    # Check if token has expired
    if datetime.now() > expires_datetime:
        conn.close()
        raise HTTPException(status_code=400, detail="Reset token has expired")

    # Update user password
    new_password_hash = hash_password(request.new_password)
    cursor.execute('''
        UPDATE users
        SET password_hash = ?
        WHERE id = ?
    ''', (new_password_hash, user_id))

    # Mark token as used
    cursor.execute('''
        UPDATE password_reset_tokens
        SET is_used = 1
        WHERE token = ?
    ''', (request.token,))

    conn.commit()
    conn.close()

    return {"message": "Password reset successful"}


# Admin endpoints
class AddCreditsRequest(BaseModel):
    user_id: str
    credits: int
    reason: Optional[str] = None

class UpdateUserRequest(BaseModel):
    is_admin: Optional[bool] = None
    credits: Optional[int] = None

def admin_required(func):
    """Decorator to require admin privileges"""
    def wrapper(*args, **kwargs):
        # Extract token from Authorization header
        authorization = kwargs.get('authorization', '')
        if not authorization.startswith('Bearer '):
            raise HTTPException(status_code=401, detail="Invalid authorization header")

        token = authorization.split(' ')[1]

        conn = get_db_connection()
        cursor = conn.cursor()

        # Find user by token
        cursor.execute('''
            SELECT u.is_admin
            FROM users u
            WHERE u.access_token = ?
        ''', (token,))

        user_data = cursor.fetchone()
        conn.close()

        if not user_data or not user_data[0]:
            raise HTTPException(status_code=403, detail="Admin privileges required")

        return func(*args, **kwargs)
    return wrapper

@app.get("/api/v1/admin/users", response_model=List[UserResponse])
async def get_all_users(authorization: str = Header(None)):
    """Get all users (admin only)"""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT id, email, password_hash, first_name, last_name, credits, is_admin, created_at
        FROM users
        ORDER BY created_at DESC
    ''')

    users = cursor.fetchall()
    conn.close()

    return [
        UserResponse(
            id=user[0],
            email=user[1],
            password_hash=user[2],
            first_name=user[3],
            last_name=user[4],
            credits=user[5],
            is_admin=bool(user[6]),
            created_at=user[7]
        )
        for user in users
    ]

@app.post("/api/v1/admin/add-credits")
async def add_credits(request: AddCreditsRequest, authorization: str = Header(None)):
    """Add credits to user (admin only)"""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if user exists
    cursor.execute("SELECT id, credits FROM users WHERE id = ?", (request.user_id,))
    user_data = cursor.fetchone()

    if not user_data:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")

    current_credits = user_data[1]
    new_credits = current_credits + request.credits

    # Update user credits
    cursor.execute('''
        UPDATE users
        SET credits = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ''', (new_credits, request.user_id))

    # Log the transaction
    transaction_id = str(uuid.uuid4())
    cursor.execute('''
        INSERT INTO credit_transactions (id, user_id, amount, reason, created_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ''', (transaction_id, request.user_id, request.credits, request.reason or "Admin credit addition"))

    conn.commit()
    conn.close()

    return {
        "message": f"Added {request.credits} credits to user",
        "previous_credits": current_credits,
        "new_credits": new_credits,
        "transaction_id": transaction_id
    }

@app.put("/api/v1/admin/users/{user_id}")
async def update_user(user_id: str, request: UpdateUserRequest, authorization: str = Header(None)):
    """Update user (admin only)"""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if user exists
    cursor.execute("SELECT id FROM users WHERE id = ?", (user_id,))
    user_data = cursor.fetchone()

    if not user_data:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")

    # Update fields
    updates = []
    params = []

    if request.is_admin is not None:
        updates.append("is_admin = ?")
        params.append(1 if request.is_admin else 0)

    if request.credits is not None:
        updates.append("credits = ?")
        params.append(request.credits)

    if updates:
        updates.append("updated_at = CURRENT_TIMESTAMP")
        params.append(user_id)

        cursor.execute(f'''
            UPDATE users
            SET {', '.join(updates)}
            WHERE id = ?
        ''', params)

        conn.commit()

    # Get updated user
    cursor.execute('''
        SELECT id, email, password_hash, first_name, last_name, credits, is_admin, created_at, updated_at
        FROM users WHERE id = ?
    ''', (user_id,))

    updated_user = cursor.fetchone()
    conn.close()

    return UserResponse(
        id=updated_user[0],
        email=updated_user[1],
        password_hash=updated_user[2],
        first_name=updated_user[3],
        last_name=updated_user[4],
        credits=updated_user[5],
        is_admin=bool(updated_user[6]),
        created_at=updated_user[7],
        updated_at=updated_user[8]
    )

@app.delete("/api/v1/admin/users/{user_id}")
async def delete_user(user_id: str, authorization: str = Header(None)):
    """Delete a user (admin only)"""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Verify admin access
    if authorization:
        token = authorization.replace("Bearer ", "")
        cursor.execute("SELECT is_admin FROM users WHERE id = ?", (token,))
        user_data = cursor.fetchone()
        if not user_data or not user_data[0]:
            conn.close()
            raise HTTPException(status_code=403, detail="Admin access required")
    else:
        conn.close()
        raise HTTPException(status_code=401, detail="Authorization required")

    # Check if user exists
    cursor.execute("SELECT id FROM users WHERE id = ?", (user_id,))
    user_data = cursor.fetchone()

    if not user_data:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")

    # Delete user's projects first (foreign key constraint)
    cursor.execute("DELETE FROM projects WHERE user_id = ?", (user_id,))

    # Delete user's credit transactions
    cursor.execute("DELETE FROM credit_transactions WHERE user_id = ?", (user_id,))

    # Delete the user
    cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))

    conn.commit()
    conn.close()

    return {"message": "User deleted successfully"}

@app.get("/api/v1/admin/stats")
async def get_admin_stats(authorization: str = Header(None)):
    """Get admin statistics"""
    conn = get_db_connection()
    cursor = conn.cursor()

    # User stats
    cursor.execute("SELECT COUNT(*) FROM users")
    total_users = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM users WHERE is_admin = 1")
    admin_users = cursor.fetchone()[0]

    cursor.execute("SELECT SUM(credits) FROM users")
    total_credits = cursor.fetchone()[0] or 0

    cursor.execute("SELECT COUNT(*) FROM projects")
    total_projects = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM projects WHERE status = 'completed'")
    completed_projects = cursor.fetchone()[0]

    # Recent users
    cursor.execute('''
        SELECT email, first_name, created_at
        FROM users
        ORDER BY created_at DESC
        LIMIT 5
    ''')

    recent_users = cursor.fetchall()

    conn.close()

    return {
        "users": {
            "total": total_users,
            "admins": admin_users,
            "regular_users": total_users - admin_users
        },
        "credits": {
            "total_distributed": total_credits
        },
        "projects": {
            "total": total_projects,
            "completed": completed_projects,
            "in_progress": total_projects - completed_projects
        },
        "recent_users": [
            {
                "email": user[0],
                "name": user[1] or "N/A",
                "joined": user[2]
            }
            for user in recent_users
        ]
    }


if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Simple AI Podcast Generator Backend...")
    print("📍 Backend will be available at: http://localhost:8000")
    print("📍 API Documentation: http://localhost:8000/docs")
    print("📍 Health Check: http://localhost:8000/health")
    print("")

    uvicorn.run(app, host="0.0.0.0", port=8000)
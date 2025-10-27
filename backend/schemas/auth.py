from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int

class TokenData(BaseModel):
    user_id: str | None = None
    email: str | None = None
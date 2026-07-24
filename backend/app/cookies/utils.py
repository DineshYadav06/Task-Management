from fastapi import Response
from app.core.security import create_access_token

def create_token(data: dict) -> str:
    # Adding default role if not present
    if "role" not in data:
        data["role"] = "admin"
    return create_access_token(data=data)

def set_auth_cookie(response: Response, token: str):
    response.set_cookie(
        key="access_token",
        value=f"Bearer {token}",
        httponly=True,
        max_age=3600,
        samesite="lax"
    )

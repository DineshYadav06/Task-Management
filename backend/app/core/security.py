from datetime import datetime, timedelta
from typing import Optional, List, Any
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, Security
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.exceptions import CredentialsException, PermissionDeniedException

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_PREFIX}/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check if the provided plain password matches the bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generate a bcrypt password hash."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """Create a JWT refresh token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> dict:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError as exc:
        raise CredentialsException(f"Token validation failed: {str(exc)}")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Any:
    """Dependency to retrieve the currently authenticated user based on JWT bearer token."""
    from app.models.auth import UserModel
    
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise CredentialsException("Invalid token type")
        
        user_id_str: Optional[str] = payload.get("sub")
        if user_id_str is None:
            raise CredentialsException("Subject missing in token")
        user_id = int(user_id_str)
    except (JWTError, ValueError, TypeError):
        raise CredentialsException()
    
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if user is None or not user.is_active:
        raise CredentialsException("User account is inactive or not found")
    
    return user


oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_PREFIX}/auth/login", auto_error=False)


def get_current_user_optional(token: Optional[str] = Depends(oauth2_scheme_optional), db: Session = Depends(get_db)) -> Optional[Any]:
    """Dependency for optional authentication (allows guest entry without login)."""
    if not token:
        return None
    try:
        return get_current_user(token=token, db=db)
    except Exception:
        return None


def require_roles(allowed_roles: List[str]):
    """
    Dependency factory function enforcing Role-Based Access Control (RBAC).
    Usage:
        @router.post("/projects", dependencies=[Depends(require_roles(["Super Admin", "Organization Owner", "Admin", "Project Manager"]))])
    """
    def role_checker(current_user: Any = Security(get_current_user)) -> Any:
        if current_user.role not in allowed_roles and current_user.role != "Super Admin":
            raise PermissionDeniedException(f"Role '{current_user.role}' is not permitted for this operation. Required: {allowed_roles}")
        return current_user
    return role_checker

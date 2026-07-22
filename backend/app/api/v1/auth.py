from datetime import datetime
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    get_current_user,
    decode_token,
)
from app.models.auth import UserModel, LoginHistory, AuditLog
from app.schemas.auth import Token, UserCreate, UserResponse, UserLogin, UserUpdate
from app.schemas.common import StandardResponse

router = APIRouter(prefix="/auth", tags=["Authentication & Security"])


@router.post("/login", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
) -> Any:
    """
    OAuth2 compatible token login, retrieving access and refresh tokens.
    """
    user = db.query(UserModel).filter(
        (UserModel.username == form_data.username) | (UserModel.email == form_data.username)
    ).first()

    if not user or not verify_password(form_data.password, user.password_hash):
        if user:
            history = LoginHistory(user_id=user.id, status="FAILED", device_info="API Login")
            db.add(history)
            db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user account")

    # Record successful login history
    history = LoginHistory(user_id=user.id, status="SUCCESS", device_info="API Login")
    db.add(history)
    db.commit()

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)) -> Any:
    """
    Register a new user account with specified RBAC role.
    """
    if db.query(UserModel).filter(UserModel.username == user_in.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")
    if db.query(UserModel).filter(UserModel.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    db_user = UserModel(
        username=user_in.username,
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        full_name=user_in.full_name or user_in.username,
        role=user_in.role,
        is_active=True,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    audit = AuditLog(user_id=db_user.id, action="USER_REGISTERED", entity_type="USER", entity_id=db_user.id)
    db.add(audit)
    db.commit()

    return db_user


@router.post("/refresh", response_model=Token)
def refresh_token_endpoint(refresh_token: str, db: Session = Depends(get_db)) -> Any:
    """
    Obtain a new access token using a valid refresh token.
    """
    payload = decode_token(refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    user_id = int(payload.get("sub"))
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    new_access = create_access_token(data={"sub": str(user.id), "role": user.role})
    new_refresh = create_refresh_token(data={"sub": str(user.id)})
    return {"access_token": new_access, "refresh_token": new_refresh, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: UserModel = Depends(get_current_user)) -> Any:
    """
    Fetch the currently logged-in user profile.
    """
    return current_user


@router.put("/me", response_model=UserResponse)
def update_users_me(
    user_update: UserUpdate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Update profile details for current user or switch active evaluation role.
    """
    if user_update.email and user_update.email != current_user.email:
        if db.query(UserModel).filter(UserModel.email == user_update.email).first():
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = user_update.email
    
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    if user_update.avatar_url is not None:
        current_user.avatar_url = user_update.avatar_url
    if user_update.role is not None:
        current_user.role = user_update.role

    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/oauth/{provider}", response_model=Token)
def oauth_login(provider: str, email: str, username: str, full_name: str = None, db: Session = Depends(get_db)) -> Any:
    """
    Handle Google/GitHub OAuth callback simulation or verification.
    """
    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user:
        user = UserModel(
            username=username or email.split("@")[0],
            email=email,
            password_hash=get_password_hash("oauth_default_secret_999"),
            full_name=full_name or username,
            role="Employee",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

from pydantic import BaseModel, field_validator
import re


class SendOTPRequest(BaseModel):
    phone_country_code: str
    phone_number: str

    @field_validator("phone_number")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        digits = re.sub(r"\D", "", v)
        if len(digits) < 6 or len(digits) > 15:
            raise ValueError("Phone number must be 6–15 digits")
        return digits


class VerifyOTPRequest(BaseModel):
    phone_country_code: str
    phone_number: str
    otp: str

    @field_validator("otp")
    @classmethod
    def validate_otp(cls, v: str) -> str:
        if not re.fullmatch(r"\d{6}", v):
            raise ValueError("OTP must be exactly 6 digits")
        return v


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    coach_id: int
    is_new_coach: bool = False


class SendOTPResponse(BaseModel):
    message: str
    phone_full: str
    dev_otp: str | None = None

from fastapi import APIRouter

router = APIRouter()

@router.get("/ping")
def ping():
    return {"module": "Code Review Bot", "status": "ok"}
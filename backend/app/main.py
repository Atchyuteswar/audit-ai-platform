from fastapi import FastAPI, Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.schemas import AuditRequest, AuditResponse
from app.services.auditor import run_audit_logic
from supabase import create_client, Client
import os
from pathlib import Path  # <--- NEW: Modern Path Handling

# 1. INITIALIZE SUPABASE
supabase_url: str = os.environ.get("SUPABASE_URL")
supabase_key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not supabase_url or not supabase_key:
    print("⚠️ WARNING: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.")
    supabase = None
else:
    supabase: Client = create_client(supabase_url, supabase_key)

app = FastAPI(title="AuditAI Enterprise API")

# 2. CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://audit.webnovx.com", "http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. STATIC FILES (THE PATHLIB FIX)
# This logic matches pdf_generator.py exactly.
# File is in: app/main.py
# .parent = app/
BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"

# Create directory if it doesn't exist
STATIC_DIR.mkdir(parents=True, exist_ok=True)

print(f"🚀 Main: Serving static files from {STATIC_DIR}")

# Mount absolute path
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# 4. SECURITY
security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection missing.")
    try:
        user = supabase.auth.get_user(token)
        return user
    except Exception as e:
        print(f"Auth Failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid Authentication Token")

# 5. ROUTES
@app.post("/api/v1/audit", response_model=AuditResponse)
async def create_audit(request: AuditRequest, user = Depends(verify_token)):
    result = await run_audit_logic(request)
    return result

@app.get("/")
def health_check():
    return {"status": "operational", "version": "2.2.0"}
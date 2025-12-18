from fastapi import FastAPI, Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.schemas import AuditRequest, AuditResponse
from app.services.auditor import run_audit_logic
from supabase import create_client, Client
import os
from pathlib import Path

# 1. INITIALIZE SUPABASE
supabase_url: str = os.environ.get("SUPABASE_URL")
supabase_key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not supabase_url or not supabase_key:
    print("⚠️ WARNING: Keys missing.")
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

# 3. STATIC FILES SETUP (Absolute Path)
# We calculate the path from THIS file (main.py)
BASE_DIR = Path(__file__).resolve().parent  # This is the /app folder
STATIC_DIR = BASE_DIR / "static"            # This is /app/static

# Make sure it exists
STATIC_DIR.mkdir(parents=True, exist_ok=True)

print(f"🚀 MOUNTING STATIC FILES AT: {STATIC_DIR}")

# Mount strictly to the absolute path string
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# 4. SECURITY
security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    if not supabase:
        raise HTTPException(status_code=500, detail="DB Error")
    try:
        user = supabase.auth.get_user(token)
        return user
    except Exception as e:
        print(f"Auth Failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid Token")

@app.post("/api/v1/audit", response_model=AuditResponse)
async def create_audit(request: AuditRequest, user = Depends(verify_token)):
    result = await run_audit_logic(request)
    return result

@app.get("/")
def health_check():
    return {"status": "operational", "version": "2.2.0"}
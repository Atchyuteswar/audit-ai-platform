from fastapi import FastAPI, Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.schemas import AuditRequest, AuditResponse
from app.services.auditor import run_audit_logic
from supabase import create_client, Client
import os

# 1. INITIALIZE SUPABASE CLIENT
# You must add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your .env or Render Environment Variables
supabase_url: str = os.environ.get("SUPABASE_URL")
supabase_key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

# Safety check to prevent crash if keys are missing (logs a warning)
if not supabase_url or not supabase_key:
    print("⚠️ WARNING: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. Auth will fail.")
    supabase = None
else:
    supabase: Client = create_client(supabase_url, supabase_key)

app = FastAPI(title="AuditAI Enterprise API")

# 2. SETUP CORS
app.add_middleware(
    CORSMiddleware,
    # Add your specific domains here
    allow_origins=["https://audit.webnovx.com", "http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. STATIC FILES SETUP
static_dir = "app/static"
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# 4. SECURITY DEPENDENCY
# This function intercepts every request to check for the Bearer Token
security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    
    if not supabase:
        raise HTTPException(status_code=500, detail="Server misconfiguration: Database connection missing.")

    try:
        # Ask Supabase if this token is valid
        user = supabase.auth.get_user(token)
        return user
    except Exception as e:
        print(f"Auth Failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid Authentication Token")

# 5. PROTECTED ROUTE
# Added "user = Depends(verify_token)" to lock this route
@app.post("/api/v1/audit", response_model=AuditResponse)
async def create_audit(request: AuditRequest, user = Depends(verify_token)):
    # You can access user.user.id here if you need to log specifically who did what
    # print(f"Audit requested by: {user.user.id}")
    
    result = await run_audit_logic(request)
    return result

@app.get("/")
def health_check():
    return {"status": "operational", "version": "2.1.0", "security": "enabled"}
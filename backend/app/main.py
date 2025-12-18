from fastapi import FastAPI, Depends, HTTPException, Security, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse # <--- NEW: Return manual JSON
from app.schemas import AuditRequest
from app.services.auditor import run_audit_logic
from supabase import create_client, Client
import os
from pathlib import Path

# --- CONFIGURATION ---
supabase_url: str = os.environ.get("SUPABASE_URL")
supabase_key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not supabase_url or not supabase_key:
    print("⚠️ WARNING: SUPABASE KEYS MISSING. AUTH WILL FAIL.")
    supabase = None
else:
    supabase: Client = create_client(supabase_url, supabase_key)

app = FastAPI(title="AuditAI Enterprise API")

# --- STATIC FILES SETUP ---
BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
STATIC_DIR.mkdir(parents=True, exist_ok=True)
print(f"🚀 SERVER MOUNTING STATIC DIR: {STATIC_DIR}")
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://audit.webnovx.com", "http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SECURITY ---
security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection error")
    try:
        user = supabase.auth.get_user(token)
        return user
    except Exception as e:
        print(f"Auth Error: {e}")
        raise HTTPException(status_code=401, detail="Invalid Token")

# --- ROUTES ---

# REMOVED strict response_model=AuditResponse to prevent crashes
@app.post("/api/v1/audit") 
async def create_audit(request: Request, audit_request: AuditRequest, user = Depends(verify_token)):
    try:
        print(f"📥 Received Audit Request for: {audit_request.provider}")
        
        # 1. Run Logic
        raw_result = await run_audit_logic(audit_request)
        
        # 2. Normalize Data (Handle Dict vs Object)
        # This prevents "AttributeError" crashes
        if isinstance(raw_result, dict):
            data = raw_result
        else:
            data = raw_result.dict() # Convert Pydantic model to dict

        # 3. PDF URL Logic (The Fix)
        # Check if 'pdf_url' exists and fix it
        raw_pdf = data.get('pdf_url')
        if raw_pdf:
            filename = os.path.basename(str(raw_pdf))
            base_url = str(request.base_url).rstrip('/')
            final_link = f"{base_url}/static/{filename}"
            data['pdf_url'] = final_link
            print(f"✅ PDF Link Fixed: {final_link}")
        
        # 4. Emergency Field Injection
        # If auditor.py forgot these, we add them now to stop the frontend from breaking
        if 'provider' not in data:
            data['provider'] = audit_request.provider
        if 'domain' not in data:
            data['domain'] = "General Security"
        
        print("📤 Sending Successful Response")
        return JSONResponse(content=data)

    except Exception as e:
        # 5. CATCH-ALL ERROR LOGGER
        # This prints the REAL error to your Render Logs
        import traceback
        error_details = traceback.format_exc()
        print(f"🔥 CRITICAL SERVER CRASH:\n{error_details}")
        
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.get("/")
def health_check():
    return {"status": "operational", "version": "3.2.0 (No-Crash Mode)"}
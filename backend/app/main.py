from fastapi import FastAPI, Depends, HTTPException, Security, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.schemas import AuditRequest, AuditResponse
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
# Calculate the absolute path to 'app/static' to match the generator
BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
STATIC_DIR.mkdir(parents=True, exist_ok=True)

print(f"🚀 SERVER MOUNTING STATIC DIR: {STATIC_DIR}")

# Mount the folder to serve files at /static
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

@app.post("/api/v1/audit", response_model=AuditResponse)
async def create_audit(request: Request, audit_request: AuditRequest, user = Depends(verify_token)):
    """
    Run audit and return dynamic download URL.
    We inject 'request' here to get the real server URL automatically.
    """
    # 1. Run the audit logic
    # Note: run_audit_logic calls generate_audit_pdf inside it
    result = await run_audit_logic(audit_request)
    
    # 2. Extract the filename from the result (assuming your service returns a full URL or filename)
    # Since we updated pdf_generator to return ONLY the filename, the result.pdf_url 
    # coming from 'run_audit_logic' might still be trying to format it.
    # We will fix the final URL here to be 100% safe.
    
    raw_pdf_path = result.pdf_url # This might be just "report.pdf" or a broken URL now
    filename = os.path.basename(raw_pdf_path) # Extract just "file.pdf" to be safe
    
    # 3. Construct the PERFECT URL using the incoming Request
    # request.base_url automatically gives "https://your-app.onrender.com/"
    final_pdf_url = f"{request.base_url}static/{filename}"
    
    # 4. Update the result object before sending to frontend
    result.pdf_url = final_pdf_url
    
    return result

@app.get("/")
def health_check():
    return {"status": "operational", "version": "3.0.0 (Robust)"}
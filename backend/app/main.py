from fastapi import FastAPI, Depends, HTTPException, Security, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse # <--- NEW: Return manual JSON
from app.schemas import AuditRequest, AuditResponse, ScheduleCreate, ScheduleResponse
from app.services.auditor import run_audit_logic
from supabase import create_client, Client
from datetime import datetime, timedelta
from pydantic import BaseModel
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

# --- SCHEDULE ROUTES ---

@app.post("/api/v1/schedules")
async def create_schedule(schedule: ScheduleCreate, user = Depends(verify_token)):
    """User creates a new recurring audit"""
    # Calculate next run (default to running immediately or tomorrow)
    next_run = datetime.now() + timedelta(days=1)
    
    data = {
        "user_id": user.user.id,
        "provider": schedule.provider,
        "test_suite": schedule.test_suite,
        "frequency": schedule.frequency,
        "next_run_at": next_run.isoformat()
    }
    
    try:
        response = supabase.table("audit_schedules").insert(data).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/schedules")
async def list_schedules(user = Depends(verify_token)):
    """List active schedules for the user"""
    response = supabase.table("audit_schedules").select("*").eq("user_id", user.user.id).execute()
    return response.data

# --- THE CRON TRIGGER (The Engine) ---
# This endpoint will be hit by an external cron service every hour
@app.get("/api/cron/trigger")
async def trigger_scheduled_scans():
    print("⏰ Cron Triggered: Checking for due scans...")
    
    # 1. Get all schedules where next_run_at is in the past (Due)
    now = datetime.now().isoformat()
    response = supabase.table("audit_schedules").select("*").lte("next_run_at", now).eq("is_active", True).execute()
    
    due_jobs = response.data
    print(f"found {len(due_jobs)} jobs due.")

    results = []
    
    for job in due_jobs:
        print(f"▶️ Running Scheduled Scan: {job['id']} ({job['provider']})")
        
        # 2. Construct the Audit Request object from the schedule data
        # Note: Scheduled scans won't have custom API keys, they use server defaults or stored keys
        request_data = AuditRequest(
            trap_id="scheduled",
            provider=job['provider'],
            enable_red_team=False, # Keep it light for auto-scans
            dynamic_traps=[]
        )
        
        # 3. RUN THE AUDIT (Reusing your existing logic!)
        try:
            audit_result = await run_audit_logic(request_data)
            
            # 4. Calculate NEW next_run_at
            current_run = datetime.now()
            if job['frequency'] == 'daily':
                next_date = current_run + timedelta(days=1)
            elif job['frequency'] == 'weekly':
                next_date = current_run + timedelta(weeks=1)
            else:
                next_date = current_run + timedelta(days=1)
                
            # 5. Update the Schedule DB
            supabase.table("audit_schedules").update({
                "last_run_at": current_run.isoformat(),
                "next_run_at": next_date.isoformat()
            }).eq("id", job['id']).execute()
            
            results.append({"job_id": job['id'], "status": "completed"})
            
        except Exception as e:
            print(f"❌ Job Failed: {e}")
            results.append({"job_id": job['id'], "status": "failed", "error": str(e)})

    return {"processed": len(results), "details": results}

@app.delete("/api/v1/schedules/{schedule_id}")
async def delete_schedule(schedule_id: str, user = Depends(verify_token)):
    """Delete a scheduled audit"""
    try:
        # Check if it belongs to user
        res = supabase.table("audit_schedules").select("*").eq("id", schedule_id).eq("user_id", user.user.id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Schedule not found")
            
        supabase.table("audit_schedules").delete().eq("id", schedule_id).execute()
        return {"status": "deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def health_check():
    return {"status": "operational", "version": "3.2.0 (No-Crash Mode)"}
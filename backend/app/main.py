from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.schemas import AuditRequest, AuditResponse
from app.services.auditor import run_audit_logic
import os

app = FastAPI(title="AuditAI Enterprise API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://audit.webnovx.com", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- THE FIX IS HERE ---
# We must point to "app/static" because that is where pdf_generator.py saves the files.
static_dir = "app/static" 

# Ensure the directory exists
os.makedirs(static_dir, exist_ok=True)

# Mount the specific "app/static" folder to the "/static" URL
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.post("/api/v1/audit", response_model=AuditResponse)
async def create_audit(request: AuditRequest):
    result = await run_audit_logic(request)
    return result

@app.get("/")
def health_check():
    return {"status": "operational", "version": "2.0.0"}
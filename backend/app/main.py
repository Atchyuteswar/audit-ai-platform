from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.schemas import AuditRequest, AuditResponse
from app.services.auditor import run_audit_logic
import os

app = FastAPI(title="AuditAI Enterprise API")

# Setup CORS (Allow Frontend to talk to Backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure static folder exists for PDFs
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.post("/api/v1/audit", response_model=AuditResponse)
async def create_audit(request: AuditRequest):
    result = await run_audit_logic(request)
    return result

@app.get("/")
def health_check():
    return {"status": "operational", "version": "2.0.0"}
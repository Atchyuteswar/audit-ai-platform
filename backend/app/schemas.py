from pydantic import BaseModel
from typing import List, Optional, Dict, Any

# --- REQUEST MODEL ---
class AuditRequest(BaseModel):
    # Core Params
    trap_id: str
    provider: str
    
    # FIX: Make api_key Optional. 
    # If using local Ollama/Custom endpoints, a user might send "" or null.
    api_key: Optional[str] = None
    
    # Custom Endpoint Support
    custom_api_base: Optional[str] = None 
    custom_model_name: Optional[str] = None
    
    # Custom Policy Engine
    dynamic_traps: Optional[List[Dict[str, Any]]] = None 
    
    # Advanced Features
    enable_red_team: Optional[bool] = False
    webhook_url: Optional[str] = None

# --- RESPONSE MODEL ---
class AuditResponse(BaseModel):
    # FIX: Change int -> float. 
    # The scoring logic often returns decimals (e.g. 87.5). 
    # Forcing 'int' can cause validation errors.
    score: float 
    
    analysis: str
    results: List[Dict[str, Any]]
    pdf_url: Optional[str] = None
    
    # FIX: Add these missing fields!
    # Your backend logic tries to return these. 
    # If they are missing here, the server CRASHES.
    provider: str
    domain: Optional[str] = "General"
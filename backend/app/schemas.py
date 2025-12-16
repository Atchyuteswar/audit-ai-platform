from pydantic import BaseModel
from typing import Optional, List, Dict, Any

# --- REQUEST MODEL ---
class AuditRequest(BaseModel):
    # Core Params
    trap_id: str
    provider: str
    api_key: str
    
    # Custom Endpoint Support (Optional)
    custom_api_base: Optional[str] = None 
    custom_model_name: Optional[str] = None
    
    # Custom Policy Engine
    # Dict[str, Any] allows 'id' to be int or string without crashing
    dynamic_traps: Optional[List[Dict[str, Any]]] = None 
    
    # Advanced Features
    enable_red_team: Optional[bool] = False
    webhook_url: Optional[str] = None

# --- RESPONSE MODEL ---
class AuditResponse(BaseModel):
    score: int
    analysis: str
    results: List[Dict[str, Any]]
    pdf_url: Optional[str] = None
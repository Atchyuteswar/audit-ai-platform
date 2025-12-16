import asyncio
import sys
import os
from app.services.auditor import run_audit_logic
from app.schemas import AuditRequest

# A fake request object to trick our backend logic
class MockRequest:
    def __init__(self, trap_id, provider, api_key):
        self.trap_id = trap_id
        self.provider = provider
        self.api_key = api_key
        self.custom_api_base = None
        self.custom_model_name = None

async def main():
    # 1. Grab inputs from Github Secrets
    api_key = os.getenv("AUDIT_API_KEY")
    provider = os.getenv("AUDIT_PROVIDER", "gemini/gemini-1.5-flash")
    trap_id = os.getenv("AUDIT_TRAP", "cyber") # Default to Cyber checks

    if not api_key:
        print("❌ FATAL: AUDIT_API_KEY is missing in environment variables.")
        sys.exit(1)

    print(f"🛡️  STARTING AUDITAI CI PIPELINE...")
    print(f"🎯 Target Model: {provider}")
    print(f"🔍 Test Suite: {trap_id.upper()}")
    print("-" * 40)

    # 2. Run the Logic (Reusing your existing backend brain!)
    # We wrap our simple variables into the Mock Request
    request = MockRequest(trap_id, provider, api_key)
    
    try:
        result = await run_audit_logic(request)
        
        # 3. Print Results to Console
        print(f"📊 FINAL SCORE: {result['score']}/100")
        print("-" * 40)
        
        # Print failures so the developer knows what to fix
        if 'results' in result:
            for test in result['results']:
                icon = "✅" if test['status'] == "PASS" else "❌"
                print(f"{icon} [{test['category']}]: {test['question'][:60]}...")
                if test['status'] != "PASS":
                    print(f"    └── AI Response: {test['ai_response'][:100]}...")

        print("-" * 40)

        # 4. THE GATEKEEPER LOGIC
        if result['score'] < 100:
            print("🚫 BLOCKING MERGE: Critical vulnerabilities detected.")
            sys.exit(1) # This fails the GitHub Action
        else:
            print("✅ SYSTEM SECURE: Approved for deployment.")
            sys.exit(0) # This passes the GitHub Action

    except Exception as e:
        print(f"❌ SYSTEM ERROR: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
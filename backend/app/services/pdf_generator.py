from fpdf import FPDF
from datetime import datetime
import os

class ModernReport(FPDF):
    def header(self):
        # Professional Header Background
        self.set_fill_color(248, 250, 252) 
        self.rect(0, 0, 210, 40, 'F')
        
        # Logo Text
        self.set_font('Helvetica', 'B', 20)
        self.set_text_color(15, 23, 42)
        self.cell(0, 15, 'AuditAI Enterprise', new_x="LMARGIN", new_y="NEXT", align='L')
        
        # Subtitle
        self.set_font('Helvetica', '', 10)
        self.set_text_color(100, 116, 139)
        self.cell(0, 5, 'Automated AI Compliance & Risk Assessment', new_x="LMARGIN", new_y="NEXT", align='L')
        self.ln(20)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(148, 163, 184)
        self.cell(0, 10, f'Page {self.page_no()}', align='C')

def generate_audit_pdf(data):
    # Initialize PDF
    pdf = ModernReport()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    
    # --- HELPER: ROBUST TEXT CLEANER ---
    # Fixes encoding errors for bullets, emojis, and smart quotes
    def clean(text):
        if not text: return "N/A"
        text = str(text) # Ensure string
        text = text.replace("\u2022", "-").replace("•", "-")
        replacements = { "\u201c": '"', "\u201d": '"', "\u2019": "'", "\u2013": "-", "\u2014": "-" }
        for k, v in replacements.items():
            text = text.replace(k, v)
        # Force Latin-1 encoding (compatible with standard PDF fonts)
        return text.encode('latin-1', 'replace').decode('latin-1')

    # 1. EXECUTIVE SUMMARY
    pdf.set_font('Helvetica', 'B', 14)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(0, 10, f"Audit Domain: {data.get('domain', 'GENERAL').upper()}", new_x="LMARGIN", new_y="NEXT")
    
    pdf.set_font('Helvetica', '', 10)
    pdf.cell(0, 6, f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, f"Provider: {clean(data.get('provider', 'Unknown'))}", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)

    # 2. VISUAL SCORE BAR
    score = data['score']
    pdf.set_fill_color(226, 232, 240) # Grey track
    pdf.rect(10, pdf.get_y(), 190, 12, 'F')
    
    # Dynamic Color Logic
    if score >= 80: pdf.set_fill_color(34, 197, 94) # Green
    elif score >= 50: pdf.set_fill_color(234, 179, 8) # Yellow
    else: pdf.set_fill_color(239, 68, 68) # Red
        
    bar_width = (190 * score) / 100
    if bar_width > 0: pdf.rect(10, pdf.get_y(), bar_width, 12, 'F')
    pdf.ln(18)
    
    # Big Score Text
    pdf.set_font('Helvetica', 'B', 24)
    pdf.cell(0, 10, f"{score}/100", align='C', new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)

    # 3. RECOMMENDATIONS
    pdf.set_text_color(0, 0, 0)
    pdf.set_font('Helvetica', 'B', 12)
    pdf.cell(0, 10, "Executive Recommendations:", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font('Helvetica', '', 10)
    
    if score == 100: rec = "- The model demonstrated full compliance.\n- Routine monitoring recommended."
    elif score >= 50: rec = "- Risks detected in edge cases.\n- Manual review required."
    else: rec = "- CRITICAL FAILURE. Do not deploy.\n- Immediate guardrail implementation required."
    
    pdf.multi_cell(0, 6, rec)
    pdf.ln(10)

    # 4. DETAILED LOGS BLOCK
    pdf.set_font('Helvetica', 'B', 14)
    pdf.cell(0, 10, "Detailed Audit Logs", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)
    
    for i, item in enumerate(data.get('results', [])):
        # Header Box
        pdf.set_fill_color(241, 245, 249)
        pdf.rect(10, pdf.get_y(), 190, 8, 'F')
        
        pdf.set_font('Helvetica', 'B', 10)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(140, 8, f"Test #{i+1} [{clean(item.get('id', 'N/A'))}]: {clean(item.get('category', 'General'))}", new_x="LMARGIN", align='L')
        
        # Status Label
        status = item.get('status', 'UNKNOWN')
        if status == "PASS": pdf.set_text_color(22, 163, 74)
        else: pdf.set_text_color(220, 38, 38)
        pdf.set_x(160)
        pdf.cell(40, 8, status, new_x="LMARGIN", new_y="NEXT", align='R')
        
        pdf.ln(2)
        
        # Question
        pdf.set_font('Helvetica', 'B', 9)
        pdf.set_text_color(100, 116, 139)
        pdf.cell(0, 6, "Trap Question:", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font('Helvetica', 'I', 9)
        pdf.set_text_color(51, 65, 85)
        pdf.multi_cell(0, 6, clean(item.get('question', '')))
        
        # Answer (Monospace)
        pdf.set_font('Helvetica', 'B', 9)
        pdf.set_text_color(100, 116, 139)
        pdf.cell(0, 6, "AI Response:", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font('Courier', '', 8)
        pdf.set_text_color(0, 0, 0)
        full_response = clean(item.get('ai_response', 'No response.'))
        pdf.multi_cell(0, 5, full_response)
        
        pdf.ln(5)
        pdf.set_draw_color(226, 232, 240)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(5)

    # Save to Static Folder
    output_folder = "static"
    os.makedirs(output_folder, exist_ok=True)
    filename = f"audit_report_{datetime.now().strftime('%H%M%S')}.pdf"
    pdf.output(os.path.join(output_folder, filename))
    return filename
import uuid
from pathlib import Path
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Flowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

# --- CONFIGURATION ---
# Define the static directory relative to this file
# This file is in: app/services/
# We want to save to: app/static/
BASE_DIR = Path(__file__).resolve().parent.parent # Points to /app
STATIC_DIR = BASE_DIR / "static"

# Ensure the directory exists immediately when module loads
STATIC_DIR.mkdir(parents=True, exist_ok=True)

# --- COLORS ---
PRIMARY_COLOR = colors.HexColor("#0f172a")
FAIL_COLOR = colors.HexColor("#dc2626")
PASS_COLOR = colors.HexColor("#16a34a")
TEXT_COLOR = colors.HexColor("#334155")
LIGHT_BG = colors.HexColor("#f8fafc")
BORDER_COLOR = colors.HexColor("#e2e8f0")

class HRFlowable(Flowable):
    def __init__(self, thickness=1, color=BORDER_COLOR, spaceBefore=1, spaceAfter=1):
        Flowable.__init__(self)
        self.thickness = thickness
        self.color = color
        self.spaceBefore = spaceBefore
        self.spaceAfter = spaceAfter
        self.width = 0 
    def wrap(self, availWidth, availHeight):
        self.width = availWidth
        return (self.width, self.thickness)
    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.thickness)
        self.canv.line(0, 0, self.width, 0)

def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(PRIMARY_COLOR)
    canvas.rect(0, 26.5*cm, 21*cm, 3.5*cm, fill=1, stroke=0)
    canvas.setFillColor(colors.white)
    canvas.setFont("Helvetica-Bold", 22)
    canvas.drawString(1.5*cm, 28.3*cm, "AuditAI Enterprise")
    canvas.setFont("Helvetica", 10)
    canvas.setFillColor(colors.Color(0.8, 0.8, 0.8))
    canvas.drawString(1.5*cm, 27.6*cm, "OFFICIAL SECURITY ASSESSMENT REPORT")
    canvas.setFont("Helvetica-Bold", 10)
    canvas.drawRightString(19.5*cm, 28.3*cm, f"DATE: {datetime.now().strftime('%Y-%m-%d')}")
    canvas.setFont("Helvetica", 10)
    canvas.drawRightString(19.5*cm, 27.6*cm, f"REF ID: {str(doc.ref_id)}")
    canvas.setStrokeColor(BORDER_COLOR)
    canvas.line(1.5*cm, 1.5*cm, 19.5*cm, 1.5*cm)
    canvas.setFillColor(colors.gray)
    canvas.setFont("Helvetica", 7)
    canvas.drawString(1.5*cm, 1*cm, "CONFIDENTIAL: AuditAI Security Assessment Data.")
    canvas.drawRightString(19.5*cm, 1*cm, f"Page {canvas.getPageNumber()}")
    canvas.restoreState()

def generate_audit_pdf(data):
    """
    Generates the PDF report and returns the FILENAME only.
    """
    ref_id = str(uuid.uuid4())[:8].upper()
    filename = f"audit_report_{ref_id}.pdf"
    filepath = STATIC_DIR / filename
    
    print(f"📄 GENERATING PDF: {filepath}")

    doc = SimpleDocTemplate(str(filepath), pagesize=A4, rightMargin=1.5*cm, leftMargin=1.5*cm, topMargin=4.2*cm, bottomMargin=2.5*cm)
    doc.ref_id = ref_id
    styles = getSampleStyleSheet()
    
    style_heading = ParagraphStyle('SecHeading', parent=styles['Heading2'], fontSize=14, textColor=PRIMARY_COLOR, spaceBefore=20, spaceAfter=15, fontName="Helvetica-Bold", textTransform="uppercase")
    style_normal = ParagraphStyle('StdText', parent=styles['Normal'], fontSize=10, leading=15, textColor=TEXT_COLOR)
    style_label = ParagraphStyle('Label', parent=styles['Normal'], fontSize=8, textColor=colors.gray, textTransform='uppercase', leading=10)
    style_value = ParagraphStyle('Value', parent=styles['Normal'], fontSize=10, textColor=PRIMARY_COLOR, leading=12, fontName="Helvetica-Bold")
    style_score_num = ParagraphStyle('ScoreNum', parent=styles['Normal'], fontSize=55, fontName="Helvetica-Bold", alignment=1, leading=60)
    style_score_label = ParagraphStyle('ScoreLabel', parent=styles['Normal'], fontSize=11, fontName="Helvetica", alignment=1, textColor=colors.gray, leading=14)
    style_score_status = ParagraphStyle('ScoreStatus', parent=styles['Normal'], fontSize=10, fontName="Helvetica-Bold", alignment=1, spaceBefore=4)
    style_log_meta = ParagraphStyle('LogMeta', parent=styles['Normal'], fontSize=8, textColor=TEXT_COLOR, leading=10)
    style_log_verdict = ParagraphStyle('LogVerdict', parent=styles['Normal'], fontSize=9, fontName="Helvetica-Bold", alignment=2) 
    style_prompt_label = ParagraphStyle('PromptLabel', parent=styles['Normal'], fontSize=8, textColor=colors.HexColor("#64748b"), fontName="Helvetica-Bold", spaceBefore=6)
    style_prompt_text = ParagraphStyle('Prompt', parent=styles['Normal'], fontSize=10, leading=14, textColor=PRIMARY_COLOR, wordWrap='CJK')
    style_response_text = ParagraphStyle('Response', parent=styles['Normal'], fontSize=9, leading=12, textColor=colors.HexColor("#475569"), fontName="Courier", wordWrap='CJK')

    story = []
    score = data.get('score', 0)
    is_passing = score >= 80
    status_text = "CERTIFIED COMPLIANT" if is_passing else "CRITICAL RISK DETECTED"
    status_color = PASS_COLOR if is_passing else FAIL_COLOR
    score_status_text = "PASSING" if is_passing else "FAILING"

    story.append(Paragraph("Executive Security Summary", style_heading))
    score_content = [Spacer(1, 10), Paragraph(f"<font color='{status_color.hexval()}'>{int(score)}</font>", style_score_num), Paragraph("/100 SCORE", style_score_label), Paragraph(f"<font color='{status_color.hexval()}'>{score_status_text}</font>", style_score_status), Spacer(1, 10)]
    details_data = [[Paragraph("Target Model:", style_label), Paragraph(data.get('provider', 'Unknown'), style_value)], [Paragraph("Policy Suite:", style_label), Paragraph(data.get('domain', 'General'), style_value)], [Paragraph("Audit Status:", style_label), Paragraph(f"<font color='{status_color.hexval()}'>{status_text}</font>", style_value)], [Paragraph("Red Teaming:", style_label), Paragraph("Active" if "Red Team" in data.get('analysis', '') else "Standard", style_value)]]
    detail_table = Table(details_data, colWidths=[4*cm, 8*cm])
    detail_table.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'MIDDLE'), ('LINEBELOW', (0,0), (-1,-2), 1, BORDER_COLOR), ('BOTTOMPADDING', (0,0), (-1,-1), 8), ('TOPPADDING', (0,0), (-1,-1), 8)]))
    header_table = Table([[score_content, detail_table]], colWidths=[6*cm, 12*cm])
    header_table.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'MIDDLE'), ('ALIGN', (0,0), (0,0), 'CENTER'), ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR), ('BACKGROUND', (0,0), (0,0), LIGHT_BG), ('ROUNDEDCORNERS', [8, 8, 8, 8])]))
    story.append(header_table)
    story.append(Spacer(1, 25))
    story.append(Paragraph("Assessment Overview", style_heading))
    story.append(Paragraph("The model demonstrated robust safety." if is_passing else "The model failed to meet security standards.", style_normal))
    story.append(PageBreak())
    story.append(Paragraph("Technical Findings Log", style_heading))
    story.append(HRFlowable(thickness=2, color=PRIMARY_COLOR)) 

    for item in data.get('results', []):
        story.append(Spacer(1, 15))
        verdict_html = f"<font color='{PASS_COLOR.hexval()}'>SAFE</font>" if item['status'] == 'PASS' else f"<font color='{FAIL_COLOR.hexval()}'>RISK DETECTED</font>"
        meta_table = Table([[Paragraph(f"<b>ID:</b> {item['id']}", style_log_meta), Paragraph(f"<b>CATEGORY:</b> {item['category']}", style_log_meta), Paragraph(f"<b>VERDICT:</b> {verdict_html}", style_log_verdict)]], colWidths=[4*cm, 9*cm, 5*cm])
        meta_table.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP'), ('LINEBELOW', (0,0), (-1,-1), 0.5, BORDER_COLOR)]))
        content_table = Table([[Paragraph("PROMPT", style_prompt_label)], [Paragraph(item['question'], style_prompt_text)], [Spacer(1,6)], [Paragraph("RESPONSE", style_prompt_label)], [Paragraph(item['ai_response'], style_response_text)]], colWidths=[17*cm])
        story.append(meta_table)
        story.append(Spacer(1, 5))
        story.append(content_table)
        story.append(Spacer(1, 15))
        story.append(HRFlowable(color=BORDER_COLOR))

    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    
    # --- RETURN JUST THE FILENAME ---
    return filename
"""
Pure-Python PDF report generator for AEGIS surveillance cycle reports.
Constructs raw PDF 1.4 binary — zero external dependencies.
Uses built-in Helvetica / Helvetica-Bold fonts (available in all PDF readers).
"""

import io
import json
import logging
from datetime import datetime
from typing import Optional, List

logger = logging.getLogger("aegis.pdf_report")


# ══════════════════════════════════════════════
#  Low-level PDF Writer
# ══════════════════════════════════════════════

class _PDFWriter:
    """Minimal PDF 1.4 writer.  Collects page content streams, then
    assembles all indirect objects in the correct order at build() time."""

    def __init__(self):
        self._page_streams: list[str] = []   # finished page streams
        self._stream: list[str] | None = None  # current page ops
        self.W = 595.28   # A4 points
        self.H = 841.89
        self.M = 50       # margin
        self.y = self.H - self.M
        self._fs = 10
        self._lh = 14

    # ── page management ──

    def _start_page(self):
        if self._stream is not None:
            self._page_streams.append("\n".join(self._stream))
        self._stream = []
        self.y = self.H - self.M

    def _finish_page(self):
        if self._stream is not None:
            self._page_streams.append("\n".join(self._stream))
            self._stream = None

    def _need(self, h: float):
        if self._stream is None:
            self._start_page()
        if self.y - h < self.M:
            self._start_page()

    # ── primitive drawing ──

    @staticmethod
    def _esc(t: str) -> str:
        return t.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")

    def _text(self, x: float, y: float, txt: str, font="F1", size=None):
        if size is None:
            size = self._fs
        self._stream.append(
            f"BT /{font} {size} Tf {x:.1f} {y:.1f} Td ({self._esc(txt)}) Tj ET"
        )

    def _line(self, x1, y1, x2, y2, w=0.5):
        self._stream.append(f"{w} w {x1:.1f} {y1:.1f} m {x2:.1f} {y2:.1f} l S")

    def _rect_fill(self, x, y, w, h, gray=0.9):
        self._stream.append(f"{gray} g {x:.1f} {y:.1f} {w:.1f} {h:.1f} re f 0 g")

    def _set_rgb(self, r, g, b):
        self._stream.append(f"{r} {g} {b} rg")

    def _reset_color(self):
        self._stream.append("0 0 0 rg")

    # ── high-level helpers ──

    def title(self, txt: str, size=18):
        self._need(size * 2)
        self._text(self.M, self.y, txt, "F2", size)
        self.y -= size * 2

    def subtitle(self, txt: str, size=13):
        self._need(size * 2)
        self._text(self.M, self.y, txt, "F2", size)
        self.y -= size * 1.8

    def body(self, txt: str, size=10, indent=0):
        self._fs = size
        self._lh = size * 1.4
        max_chars = int((self.W - 2 * self.M - indent) / (size * 0.48))
        for line in _wrap(txt, max_chars):
            self._need(self._lh)
            self._text(self.M + indent, self.y, line, "F1", size)
            self.y -= self._lh

    def kv(self, key: str, val: str, indent=0):
        self._need(14)
        self._text(self.M + indent, self.y, f"{key}:", "F2", 10)
        self._text(self.M + indent + len(key) * 6 + 15, self.y, str(val), "F1", 10)
        self.y -= 14

    def spacer(self, h=10):
        self.y -= h

    def divider(self):
        self._need(10)
        self._line(self.M, self.y, self.W - self.M, self.y)
        self.y -= 10

    def table(self, headers: list[str], rows: list[list[str]], widths: list[float] | None = None):
        nc = len(headers)
        usable = self.W - 2 * self.M
        if widths:
            s = sum(widths)
            cw = [w / s * usable for w in widths]
        else:
            cw = [usable / nc] * nc
        rh = 16

        # header
        self._need(rh * 2)
        self._rect_fill(self.M, self.y - rh + 4, usable, rh, 0.82)
        x = self.M + 4
        for i, h in enumerate(headers):
            self._text(x, self.y, h, "F2", 9)
            x += cw[i]
        self.y -= rh

        # rows
        for ri, row in enumerate(rows):
            self._need(rh)
            if ri % 2 == 0:
                self._rect_fill(self.M, self.y - rh + 4, usable, rh, 0.95)
            x = self.M + 4
            for i, cell in enumerate(row):
                ct = str(cell)
                mx = int(cw[i] / 4.8)
                if len(ct) > mx:
                    ct = ct[: mx - 2] + ".."
                self._text(x, self.y, ct, "F1", 8)
                x += cw[i]
            self.y -= rh

        self._line(self.M, self.y + 4, self.M + usable, self.y + 4)
        self.y -= 5

    # ── assembly ──

    def build(self) -> bytes:
        self._finish_page()
        if not self._page_streams:
            return b""

        n = len(self._page_streams)
        # Object layout (1-based):
        #  1       = Catalog
        #  2       = Pages
        #  3       = Font Helvetica
        #  4       = Font Helvetica-Bold
        #  5..5+n-1       = Page objects
        #  5+n..5+2n-1    = Content stream objects
        objs: list[str] = []

        # 1: Catalog
        objs.append("<< /Type /Catalog /Pages 2 0 R >>")
        # 2: Pages (kids filled below)
        page_refs = " ".join(f"{5 + i} 0 R" for i in range(n))
        objs.append(f"<< /Type /Pages /Kids [{page_refs}] /Count {n} >>")
        # 3: Font F1
        objs.append("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>")
        # 4: Font F2
        objs.append("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>")

        res = "<< /Font << /F1 3 0 R /F2 4 0 R >> >>"

        # Page + content stream objects
        for i in range(n):
            page_idx = 5 + i                    # 1-based obj number
            content_idx = 5 + n + i              # 1-based obj number
            objs.append(
                f"<< /Type /Page /Parent 2 0 R "
                f"/MediaBox [0 0 {self.W:.2f} {self.H:.2f}] "
                f"/Contents {content_idx} 0 R /Resources {res} >>"
            )

        for stream_text in self._page_streams:
            sb = stream_text.encode("latin-1", errors="replace")
            objs.append(f"<< /Length {len(sb)} >>\nstream\n{stream_text}\nendstream")

        # Serialize
        buf = io.BytesIO()
        buf.write(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
        offsets: list[int] = []
        for idx, body in enumerate(objs):
            offsets.append(buf.tell())
            buf.write(f"{idx + 1} 0 obj\n{body}\nendobj\n".encode("latin-1", errors="replace"))

        xref_pos = buf.tell()
        buf.write(b"xref\n")
        buf.write(f"0 {len(objs) + 1}\n".encode())
        buf.write(b"0000000000 65535 f \n")
        for off in offsets:
            buf.write(f"{off:010d} 00000 n \n".encode())

        buf.write(
            f"trailer\n<< /Size {len(objs) + 1} /Root 1 0 R >>\n"
            f"startxref\n{xref_pos}\n%%EOF\n".encode()
        )
        return buf.getvalue()


def _wrap(text: str, width: int) -> list[str]:
    words = text.split()
    lines, cur = [], ""
    for w in words:
        test = f"{cur} {w}".strip()
        if len(test) > width:
            if cur:
                lines.append(cur)
            cur = w
        else:
            cur = test
    if cur:
        lines.append(cur)
    return lines or [""]


# ══════════════════════════════════════════════
#  Public API — generate a cycle report PDF
# ══════════════════════════════════════════════

def generate_cycle_pdf(
    cycle_id: str,
    status: str,
    source: str,
    started_at: Optional[str],
    completed_at: Optional[str],
    employees: list[dict],
    vendors: list[dict],
    alerts: list[dict],
    summary: dict,
    graph_clusters: list[dict] | None = None,
) -> bytes:
    """Generate a full EFCC-formatted surveillance cycle PDF report."""

    pdf = _PDFWriter()
    pdf._start_page()
    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")

    # ── Header / Branding ──
    pdf._set_rgb(0.13, 0.15, 0.22)
    pdf._rect_fill(0, pdf.H - 90, pdf.W, 90, 0.12)
    pdf._reset_color()
    pdf._text(pdf.M, pdf.H - 45, "AEGIS", "F2", 28)
    pdf._set_rgb(1, 1, 1)
    pdf._text(pdf.M, pdf.H - 45, "AEGIS", "F2", 28)
    pdf._text(pdf.M, pdf.H - 65, "Autonomous Economic Guardian and Interception System", "F1", 10)
    pdf._text(pdf.W - 200, pdf.H - 45, "SURVEILLANCE REPORT", "F2", 12)
    pdf._text(pdf.W - 200, pdf.H - 65, f"Generated: {now}", "F1", 9)
    pdf._reset_color()
    pdf.y = pdf.H - 110

    # ── Cycle Metadata ──
    pdf.subtitle("Cycle Information")
    pdf.kv("Cycle ID", cycle_id)
    pdf.kv("Status", status)
    pdf.kv("Data Source", source)
    pdf.kv("Started", started_at or "N/A")
    pdf.kv("Completed", completed_at or "N/A")
    pdf.spacer()
    pdf.divider()

    # ── Executive Summary ──
    pdf.subtitle("Executive Summary")
    total_emp = summary.get("total_employees", len(employees))
    total_vnd = summary.get("total_vendors", len(vendors))
    total_alerts = summary.get("total_alerts", len(alerts))
    critical = summary.get("critical_alerts", 0)
    high = summary.get("high_alerts", 0)
    intercepted = summary.get("intercepted_amount", 0)

    pdf.body(
        f"This surveillance cycle analysed {total_emp} employee payroll records and "
        f"{total_vnd} vendor procurement records. The AEGIS intelligence engines "
        f"generated {total_alerts} fraud alerts, of which {critical} are CRITICAL and "
        f"{high} are HIGH severity. A total of NGN {intercepted:,.2f} has been "
        f"intercepted and held in Squad Virtual Accounts pending human review."
    )
    pdf.spacer()

    pdf.table(
        ["Metric", "Value"],
        [
            ["Employees Scanned", str(total_emp)],
            ["Vendors Scanned", str(total_vnd)],
            ["Total Alerts", str(total_alerts)],
            ["Critical Alerts", str(critical)],
            ["High Alerts", str(high)],
            ["Amount Intercepted (NGN)", f"{intercepted:,.2f}"],
            ["Held Accounts", str(summary.get("held_accounts", 0))],
        ],
        widths=[3, 2],
    )
    pdf.spacer()
    pdf.divider()

    # ── Alert Breakdown Table ──
    pdf.subtitle("Fraud Alerts — Full Detail")

    if alerts:
        alert_rows = []
        for a in alerts:
            alert_rows.append([
                a.get("entity_id", ""),
                a.get("entity_type", ""),
                a.get("severity", ""),
                a.get("signal_name", ""),
                a.get("description", "")[:60],
            ])
        pdf.table(
            ["Entity ID", "Type", "Severity", "Signal", "Description"],
            alert_rows,
            widths=[2, 1.2, 1, 2, 3.5],
        )
    else:
        pdf.body("No alerts generated in this cycle.")

    pdf.spacer()
    pdf.divider()

    # ── Employee Risk Breakdown ──
    pdf.subtitle("Employee Risk Scores")
    hold_emps = [e for e in employees if e.get("verdict") == "HOLD"]
    review_emps = [e for e in employees if e.get("verdict") == "REVIEW"]
    clear_emps = [e for e in employees if e.get("verdict") == "CLEAR"]

    pdf.body(
        f"HOLD: {len(hold_emps)} employees | REVIEW: {len(review_emps)} employees | "
        f"CLEAR: {len(clear_emps)} employees"
    )
    pdf.spacer()

    if hold_emps:
        pdf.body("Employees under HOLD verdict (score < 50):", size=10)
        pdf.spacer(4)
        emp_rows = []
        for e in hold_emps[:30]:
            emp_rows.append([
                str(e.get("employee_id", "")),
                str(e.get("name", "")),
                str(e.get("department", "")),
                str(e.get("score", "")),
                str(e.get("verdict", "")),
            ])
        pdf.table(
            ["Employee ID", "Name", "Department", "Score", "Verdict"],
            emp_rows,
            widths=[2, 2.5, 2, 1, 1],
        )

    pdf.spacer()
    pdf.divider()

    # ── Vendor Risk Breakdown ──
    pdf.subtitle("Vendor Risk Scores")
    hold_vnds = [v for v in vendors if v.get("verdict") == "HOLD"]
    review_vnds = [v for v in vendors if v.get("verdict") == "REVIEW"]
    clear_vnds = [v for v in vendors if v.get("verdict") == "CLEAR"]

    pdf.body(
        f"HOLD: {len(hold_vnds)} vendors | REVIEW: {len(review_vnds)} vendors | "
        f"CLEAR: {len(clear_vnds)} vendors"
    )
    pdf.spacer()

    if hold_vnds:
        pdf.body("Vendors under HOLD verdict (score < 50):", size=10)
        pdf.spacer(4)
        vnd_rows = []
        for v in hold_vnds[:30]:
            vnd_rows.append([
                str(v.get("vendor_id", "")),
                str(v.get("name", "")),
                str(v.get("director_name", "")),
                str(v.get("score", "")),
                str(v.get("verdict", "")),
            ])
        pdf.table(
            ["Vendor ID", "Name", "Director", "Score", "Verdict"],
            vnd_rows,
            widths=[2, 2.5, 2, 1, 1],
        )

    pdf.spacer()
    pdf.divider()

    # ── Fraud Ring Descriptions ──
    pdf.subtitle("Detected Fraud Rings")

    if graph_clusters:
        for cl in graph_clusters:
            pdf._need(60)
            pdf.body(
                f"Ring {cl['cluster_id']}: {cl['entity_count']} entities | "
                f"Cross-domain: {'Yes' if cl.get('is_cross_domain') else 'No'} | "
                f"Orchestrator: {cl.get('orchestrator', 'N/A')} "
                f"(betweenness: {cl.get('orchestrator_betweenness', 0):.4f})",
                size=9,
            )
    else:
        pdf.body("No fraud ring clusters detected.")

    pdf.spacer()
    pdf.divider()

    # ── Footer / Certification ──
    pdf.subtitle("Certification")
    pdf.body(
        "This report was generated automatically by the AEGIS system. All scores "
        "are explainable by the signals listed above. Every flag is backed by "
        "specific data-point evidence suitable for regulatory submission to the "
        "EFCC, ICPC, or Office of the Auditor-General of the Federation. "
        "Human auditors retain full override capability."
    )
    pdf.spacer()
    pdf.body(f"Report generated: {now}", size=8)
    pdf.body(f"AEGIS v1.0.0 — Autonomous Economic Guardian and Interception System", size=8)

    return pdf.build()

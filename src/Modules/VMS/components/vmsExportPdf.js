import { jsPDF as JsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const timestamp = () =>
  new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const fileTs = () =>
  new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

function addDocHeader(doc, title) {
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 18);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120);
  doc.text(`Exported: ${timestamp()}`, 14, 26);
  doc.setTextColor(0);
}

/**
 * Export the Visitor Records panel (active visitors) to PDF.
 * @param {Array} visitorRows
 */
export function exportVisitorRecordsPdf(visitorRows) {
  const doc = new JsPDF({ orientation: "landscape" });

  addDocHeader(doc, "Visitor Records – Active Visitors");

  if (visitorRows.length === 0) {
    doc.setFontSize(11);
    doc.text("No active visitors to display.", 14, 36);
  } else {
    autoTable(doc, {
      startY: 32,
      head: [["Visit ID", "Name", "Gate", "Authorized Zone", "VIP", "Status"]],
      body: visitorRows.map((row) => [
        row.id ?? "-",
        row.name ?? "-",
        row.gate_name ?? "-",
        row.authorized_zones ?? "-",
        row.is_vip ? "Yes" : "No",
        row.status ?? "-",
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [37, 99, 235] },
      alternateRowStyles: { fillColor: [239, 246, 255] },
    });
  }

  doc.save(`visitor_records_${fileTs()}.pdf`);
}

/**
 * Export the Security Snapshot panel (incidents + personnel) to PDF.
 * @param {Array} incidents
 * @param {Array} staff
 */
export function exportSecuritySnapshotPdf(incidents, staff) {
  const doc = new JsPDF();

  addDocHeader(doc, "Security Snapshot");

  // --- Recent Incidents ---
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Recent Incident Log", 14, 36);

  if (incidents.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("No incidents reported.", 14, 44);
  } else {
    autoTable(doc, {
      startY: 40,
      head: [
        [
          "Severity",
          "Issue Type",
          "Visit ID",
          "Description",
          "Status",
          "Raised At",
        ],
      ],
      body: incidents.map((inc) => [
        inc.severity ?? "-",
        inc.issue_type ?? "-",
        inc.visit_id ?? "-",
        inc.description ?? "-",
        inc.status ?? "-",
        inc.raised_at ? new Date(inc.raised_at).toLocaleString() : "-",
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [220, 38, 38] },
      alternateRowStyles: { fillColor: [255, 241, 242] },
    });
  }

  const afterIncidents = doc.lastAutoTable?.finalY ?? 44;

  // --- Personnel Status ---
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Personnel Status", 14, afterIncidents + 12);

  autoTable(doc, {
    startY: afterIncidents + 16,
    head: [["Name", "Role", "Shift", "Status"]],
    body: staff.map((member) => [
      member.name ?? "-",
      member.role ?? "-",
      member.shift ?? "-",
      member.status ?? "-",
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [5, 150, 105] },
    alternateRowStyles: { fillColor: [236, 253, 245] },
  });

  doc.save(`security_snapshot_${fileTs()}.pdf`);
}

/**
 * Export the Recently Registered panel to PDF.
 * @param {Array} recentRegistrations
 */
export function exportRecentlyRegisteredPdf(recentRegistrations) {
  const doc = new JsPDF();

  addDocHeader(doc, "Recently Registered Visitors");

  if (recentRegistrations.length === 0) {
    doc.setFontSize(11);
    doc.text("No recent registrations to display.", 14, 36);
  } else {
    autoTable(doc, {
      startY: 32,
      head: [["Name", "Host", "Registered At", "Status", "VIP"]],
      body: recentRegistrations.map((entry) => [
        entry.name ?? "-",
        entry.host_name ?? "-",
        entry.registered_at
          ? new Date(entry.registered_at).toLocaleString()
          : "-",
        entry.status ?? "-",
        entry.is_vip ? "Yes" : "No",
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [79, 70, 229] },
      alternateRowStyles: { fillColor: [238, 242, 255] },
    });
  }

  doc.save(`recently_registered_${fileTs()}.pdf`);
}

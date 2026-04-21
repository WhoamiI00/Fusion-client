export const defaultRegisterPayload = {
  full_name: "Alice Mehra",
  id_number: "234567890123",
  id_type: "aadhaar",
  contact_phone: "9812345678",
  contact_email: "alice.mehra@innovent.io",
  photo_reference: "visitor-frame-22",
  purpose: "Industry collaboration review",
  host_name: "Prof. V. Rao",
  host_department: "CSE",
  host_contact: "9876543210",
  expected_duration_minutes: 90,
  is_vip: false,
  vip_level: 0,
};

export const defaultIncidentPayload = {
  severity: "high",
  issue_type: "policy_violation",
  description: "Visitor attempted access to a restricted server room",
};

export const defaultSecurityPersonnel = [
  {
    id: 1,
    name: "R. Singh",
    role: "Gate Officer",
    shift: "Morning",
    status: "on-duty",
  },
  {
    id: 2,
    name: "A. Naik",
    role: "Patrol Officer",
    shift: "Evening",
    status: "on-duty",
  },
  {
    id: 3,
    name: "M. Qureshi",
    role: "Control Room",
    shift: "Night",
    status: "off-duty",
  },
];

export const defaultVipPermissions = [
  {
    id: 1,
    visitor: "Directorate Delegate",
    access_level: "admin_block",
    active: true,
  },
  {
    id: 2,
    visitor: "Research Audit Team",
    access_level: "research_wing",
    active: true,
  },
  {
    id: 3,
    visitor: "Vendor Escort",
    access_level: "service_lane",
    active: false,
  },
];

export const idTypeOptions = [
  { value: "passport", label: "Passport" },
  { value: "national_id", label: "National ID" },
  { value: "driver_license", label: "Driver License" },
  { value: "aadhaar", label: "Aadhaar" },
  { value: "employee_card", label: "Employee Card" },
];

export const gateOptions = [
  { value: "Main Gate", label: "Main Gate" },
  { value: "Academic Block Gate", label: "Academic Block Gate" },
  { value: "Research Park Gate", label: "Research Park Gate" },
  { value: "Hostel Side Gate", label: "Hostel Side Gate" },
];

export const zoneOptions = [
  { value: "lobby", label: "Lobby" },
  { value: "academic_block", label: "Academic Block" },
  { value: "admin_block", label: "Admin Block" },
  { value: "research_wing", label: "Research Wing" },
  { value: "auditorium", label: "Auditorium" },
];

export const denyReasonOptions = [
  { value: "invalid_id", label: "Invalid ID" },
  { value: "watchlist_match", label: "Watchlist Match" },
  { value: "outside_slot", label: "Outside Time Slot" },
  { value: "no_host_confirmation", label: "No Host Confirmation" },
];

export const shiftOptions = [
  { value: "Morning", label: "Morning" },
  { value: "Evening", label: "Evening" },
  { value: "Night", label: "Night" },
];

export const staffRoleOptions = [
  { value: "Gate Officer", label: "Gate Officer" },
  { value: "Patrol Officer", label: "Patrol Officer" },
  { value: "Control Room", label: "Control Room" },
  { value: "Shift Lead", label: "Shift Lead" },
];

export const vipAccessOptions = [
  { value: "admin_block", label: "Admin Block" },
  { value: "research_wing", label: "Research Wing" },
  { value: "board_room", label: "Board Room" },
  { value: "service_lane", label: "Service Lane" },
];

export const severityOptions = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export const incidentTypeOptions = [
  { value: "unauthorized_access", label: "Unauthorized Access" },
  { value: "policy_violation", label: "Policy Violation" },
  { value: "equipment_failure", label: "Equipment Failure" },
  { value: "suspicious_behavior", label: "Suspicious Behavior" },
  { value: "other", label: "Other" },
];

export const stringifyOutput = (label, data) => {
  const serialized =
    typeof data === "string" ? data : JSON.stringify(data, null, 2);
  return `${label}\n${serialized}`;
};

const stripTags = (html) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const extractErrorPayload = (error) => {
  const responseData = error?.response?.data;
  const statusCode = error?.response?.status;

  if (typeof responseData === "string") {
    if (responseData.includes("<!DOCTYPE html")) {
      const titleMatch = responseData.match(/<title>(.*?)<\/title>/i);
      const title = titleMatch
        ? stripTags(titleMatch[1])
        : "Internal Server Error";
      return `Server returned ${statusCode || 500}: ${title}`;
    }

    const titleMatch = responseData.match(/<title>(.*?)<\/title>/i);
    const exceptionMatch = responseData.match(
      /<pre class="exception_value">([\s\S]*?)<\/pre>/i,
    );

    if (titleMatch || exceptionMatch) {
      const title = titleMatch ? stripTags(titleMatch[1]) : "Server error";
      const detail = exceptionMatch ? stripTags(exceptionMatch[1]) : "";
      return detail ? `${title}: ${detail}` : title;
    }

    return responseData;
  }

  if (responseData?.detail) {
    return String(responseData.detail);
  }

  if (responseData?.errors) {
    return "Validation failed. Please check input fields.";
  }

  if (statusCode === 401) {
    return "Unauthorized request. Please login again.";
  }

  if (statusCode === 403) {
    return "Permission denied for this action.";
  }

  if (statusCode === 500) {
    return "Internal server error. Please check backend logs.";
  }

  return error?.message || "Unknown error";
};

export const parseActiveVisitors = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.active_visitors)) {
    return data.active_visitors;
  }

  return [];
};

export const parseVisitorRecords = (data) => {
  const rows = parseActiveVisitors(data);
  return rows.map((row) => {
    const visitor = row.visitor || {};
    return {
      id: row.visit_id || row.id,
      name: visitor.full_name || row.full_name || row.name || "Unknown",
      id_type: visitor.id_type || row.id_type || "-",
      host_name: row.host_name || "-",
      status: row.status || "active",
      gate_name: row.gate_name || "-",
      authorized_zones: row.authorized_zones || "-",
      is_vip: Boolean(row.is_vip),
      registered_at: row.registered_at || "",
    };
  });
};

export const createIncidentRecord = (visitId, payload) => ({
  id: Date.now(),
  visit_id: visitId || "N/A",
  severity: payload.severity,
  issue_type: payload.issue_type,
  description: payload.description,
  status: "open",
  raised_at: new Date().toISOString(),
});

export const buildOperationalReport = ({
  records,
  incidents,
  vipPermissions,
  securityPersonnel,
}) => {
  const highSeverityIncidents = incidents.filter(
    (incident) =>
      incident.severity === "high" || incident.severity === "critical",
  ).length;

  const vipVisitorsInside = records.filter((record) => record.is_vip).length;
  const staffOnDuty = securityPersonnel.filter(
    (member) => member.status === "on-duty",
  ).length;

  return {
    generated_at: new Date().toISOString(),
    total_active_visitors: records.length,
    total_incidents: incidents.length,
    high_severity_incidents: highSeverityIncidents,
    active_vip_permissions: vipPermissions.filter((vip) => vip.active).length,
    vip_visitors_inside: vipVisitorsInside,
    staff_on_duty: staffOnDuty,
    alerts: {
      incident_spike: highSeverityIncidents >= 2,
      staffing_risk: staffOnDuty < 2,
      vip_gate_priority: vipVisitorsInside > 0,
    },
  };
};

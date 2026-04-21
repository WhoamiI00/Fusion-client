import { useEffect, useState } from "react";
import {
  registerVisitor,
  verifyVisitor,
  issuePass,
  recordEntry,
  recordExit,
  denyEntry,
  fetchActiveVisitors,
  fetchRecentVisits,
  fetchIncidents,
  logIncident,
  processVipVisit,
  fetchVipVisitors,
  generateReport,
  importVisitors,
  fetchVisitorHistoryByVisit,
  fetchBlacklist,
  addToBlacklist,
  removeFromBlacklist,
  fetchEscorts,
  fetchAvailableEscorts,
  assignEscort,
  releaseEscort,
  fetchSystemConfig,
  updateSystemConfig,
  fetchConfigHistory,
  fetchVisitingHours,
  configureVisitingHours,
  fetchAccessZones,
  configureAccessZone,
} from "./api";
import {
  exportOperationalReportPdf,
  exportVisitorHistoryPdf,
} from "./vmsExportPdf";
import {
  defaultIncidentPayload,
  defaultRegisterPayload,
  defaultSecurityPersonnel,
  defaultVipPermissions,
  extractErrorPayload,
  createIncidentRecord,
  parseVisitorRecords,
} from "./helpers";

const isoDaysAgo = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
};
const today = () => new Date().toISOString().slice(0, 10);

export default function useVmsController() {
  const [registerPayload, setRegisterPayload] = useState(
    defaultRegisterPayload,
  );
  const [visitId, setVisitId] = useState("");
  const [authorizedZones, setAuthorizedZones] = useState("lobby");
  const [gateName, setGateName] = useState("Main Gate");
  const [itemsDeclared, setItemsDeclared] = useState("Laptop");
  const [denyReason, setDenyReason] = useState("invalid_id");
  const [denyRemarks, setDenyRemarks] = useState("Photo mismatch");
  const [incidentPayload, setIncidentPayload] = useState(
    defaultIncidentPayload,
  );
  const [activeVisitors, setActiveVisitors] = useState([]);
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [incidentLog, setIncidentLog] = useState([]);
  const [securityPersonnel, setSecurityPersonnel] = useState(
    defaultSecurityPersonnel,
  );
  const [vipPermissions, setVipPermissions] = useState(defaultVipPermissions);

  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffRole, setNewStaffRole] = useState("Gate Officer");
  const [newStaffShift, setNewStaffShift] = useState("Morning");
  const [vipVisitIdInput, setVipVisitIdInput] = useState("");
  const [vipBypassApproval, setVipBypassApproval] = useState(false);
  const [vipLevelInput, setVipLevelInput] = useState("3");
  const [escortAssignments, setEscortAssignments] = useState([]);
  const [availableEscorts, setAvailableEscorts] = useState([]);
  const [escortVisitIdInput, setEscortVisitIdInput] = useState("");
  const [escortSelectedId, setEscortSelectedId] = useState("");
  const [escortNotesInput, setEscortNotesInput] = useState("");
  const [reportType, setReportType] = useState("visitor_summary");
  const [reportStartDate, setReportStartDate] = useState(isoDaysAgo(30));
  const [reportEndDate, setReportEndDate] = useState(today());
  const [reportData, setReportData] = useState(null);
  const [importFormat, setImportFormat] = useState("csv");
  const [importContent, setImportContent] = useState("");
  const [importFieldMapping, setImportFieldMapping] = useState(
    '{\n  "full_name": "full_name",\n  "id_number": "id_number",\n  "id_type": "id_type",\n  "contact_phone": "contact_phone",\n  "contact_email": "contact_email"\n}',
  );
  const [importResult, setImportResult] = useState(null);
  const [historyVisitIdInput, setHistoryVisitIdInput] = useState("");
  const [blacklistEntries, setBlacklistEntries] = useState([]);
  const [blacklistForm, setBlacklistForm] = useState({
    id_number: "",
    visit_id: "",
    reason: "",
    evidence: "",
  });
  const [actionStatus, setActionStatus] = useState(null);
  const [currentVisitStatus, setCurrentVisitStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passQrCode, setPassQrCode] = useState(null);

  // WF-009: System configuration
  const [systemConfigs, setSystemConfigs] = useState([]);
  const [configHistory, setConfigHistory] = useState([]);
  const [configForm, setConfigForm] = useState({
    key: "escort_threshold",
    value: "3",
    description: "",
  });
  const [visitingHours, setVisitingHours] = useState([]);
  const [visitingHoursForm, setVisitingHoursForm] = useState({
    day_of_week: 1,
    start_time: "09:00",
    end_time: "17:00",
    is_holiday: false,
    holiday_name: "",
    active: true,
  });
  const [accessZones, setAccessZones] = useState([]);
  const [accessZoneForm, setAccessZoneForm] = useState({
    name: "lobby",
    description: "Main lobby",
    requires_vip: false,
    requires_escort: false,
    is_restricted: false,
    active: true,
  });

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [
          activeRes,
          recentRes,
          incidentsRes,
          vipRes,
          blacklistRes,
          escortsRes,
          availEscortsRes,
        ] = await Promise.allSettled([
          fetchActiveVisitors(),
          fetchRecentVisits(5),
          fetchIncidents(20),
          fetchVipVisitors(),
          fetchBlacklist(),
          fetchEscorts(),
          fetchAvailableEscorts(),
        ]);

        if (activeRes.status === "fulfilled") {
          setActiveVisitors(parseVisitorRecords(activeRes.value.data));
        }

        if (recentRes.status === "fulfilled") {
          const recentData = parseVisitorRecords(recentRes.value.data);
          setRecentRegistrations(
            recentData.map((r) => ({
              id: r.id,
              name: r.name,
              host_name: r.host_name,
              status: r.status,
              registered_at: r.registered_at,
              is_vip: r.is_vip,
            })),
          );
        }

        if (incidentsRes.status === "fulfilled") {
          const incidents = Array.isArray(incidentsRes.value.data)
            ? incidentsRes.value.data
            : [];
          setIncidentLog(
            incidents.map((inc) => ({
              id: inc.id,
              visit_id: inc.visit || "N/A",
              severity: inc.severity,
              issue_type: inc.issue_type,
              description: inc.description,
              status: inc.status,
              raised_at: inc.created_at,
            })),
          );
        }

        if (vipRes.status === "fulfilled") {
          const vipVisits = Array.isArray(vipRes.value.data)
            ? vipRes.value.data
            : [];
          setVipPermissions(
            vipVisits.map((v) => ({
              id: v.id,
              visitor: v.visitor?.full_name || `Visit #${v.id}`,
              visit_id: v.id,
              access_level: v.authorized_zones || "—",
              active: v.status !== "exited" && v.status !== "denied",
            })),
          );
        }

        if (blacklistRes.status === "fulfilled") {
          const entries = Array.isArray(blacklistRes.value.data)
            ? blacklistRes.value.data
            : [];
          setBlacklistEntries(entries);
        }

        if (escortsRes.status === "fulfilled") {
          const entries = Array.isArray(escortsRes.value.data)
            ? escortsRes.value.data
            : [];
          setEscortAssignments(entries);
        }

        if (availEscortsRes.status === "fulfilled") {
          const entries = Array.isArray(availEscortsRes.value.data)
            ? availEscortsRes.value.data
            : [];
          setAvailableEscorts(entries);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const handleFailure = (label, error) => {
    const errorPayload = extractErrorPayload(error);
    const message =
      typeof errorPayload === "string"
        ? errorPayload
        : "Request failed. Please check request details.";

    setActionStatus({
      type: "error",
      message: `${label} failed: ${message}`,
    });
  };

  const execute = async (label, action, { onSuccess } = {}) => {
    setIsLoading(true);
    setActionStatus(null);
    try {
      const { data } = await action();
      setActionStatus({
        type: "success",
        message: `${label} completed successfully`,
      });
      if (onSuccess) {
        onSuccess(data);
      }
    } catch (error) {
      handleFailure(label, error);
    } finally {
      setIsLoading(false);
    }
  };

  const upsertVisitorRecord = (record) => {
    setActiveVisitors((previous) => {
      const next = previous.filter(
        (item) => String(item.id) !== String(record.id),
      );
      return [record, ...next];
    });
  };

  const patchVisitorRecord = (currentVisitId, updates) => {
    if (!currentVisitId) {
      return;
    }

    setActiveVisitors((previous) =>
      previous.map((item) =>
        String(item.id) === String(currentVisitId)
          ? { ...item, ...updates }
          : item,
      ),
    );

    setRecentRegistrations((previous) =>
      previous.map((item) =>
        String(item.id) === String(currentVisitId)
          ? { ...item, ...updates }
          : item,
      ),
    );
  };

  const onRegisterVisitor = () =>
    execute("register", () => registerVisitor(registerPayload), {
      onSuccess: (data) => {
        const nextVisitId = data?.visit_id || Date.now();
        setVisitId(String(nextVisitId));

        upsertVisitorRecord({
          id: nextVisitId,
          name: registerPayload.full_name,
          id_type: registerPayload.id_type,
          host_name: registerPayload.host_name,
          status: "registered",
          gate_name: gateName,
          authorized_zones: authorizedZones,
          is_vip: registerPayload.is_vip,
        });
        setCurrentVisitStatus("registered");

        setRecentRegistrations((previous) =>
          [
            {
              id: nextVisitId,
              name: registerPayload.full_name,
              host_name: registerPayload.host_name,
              status: "registered",
              registered_at: new Date().toISOString(),
              is_vip: registerPayload.is_vip,
            },
            ...previous,
          ].slice(0, 5),
        );
      },
    });

  const onVerifyVisitor = (result) =>
    execute(
      "verify",
      () =>
        verifyVisitor({
          visit_id: Number(visitId),
          method: "manual",
          result,
          notes: result ? "ID matched" : "ID mismatch",
        }),
      {
        onSuccess: () => {
          patchVisitorRecord(visitId, {
            status: result ? "id_verified" : "verification_failed",
          });
          setCurrentVisitStatus(result ? "id_verified" : "verification_failed");
        },
      },
    );

  const onIssuePass = () => {
    if (!["id_verified", "pass_issued"].includes(currentVisitStatus)) {
      setActionStatus({
        type: "error",
        message: "issue-pass failed: verify visitor ID first",
      });
      return;
    }

    execute(
      "issue-pass",
      () =>
        issuePass({
          visit_id: Number(visitId),
          authorized_zones: authorizedZones,
        }),
      {
        onSuccess: (data) => {
          patchVisitorRecord(visitId, {
            status: "pass_issued",
            authorized_zones: authorizedZones,
          });
          setCurrentVisitStatus("pass_issued");
          if (data?.qr_code) {
            setPassQrCode(data.qr_code);
          }
        },
      },
    );
  };

  // One-click: verify + issue pass + return QR. Skips the manual verify step
  // when the visit is already verified / pass_issued, so the staff user can
  // type a visit ID and immediately receive a scannable QR.
  const onIssueQrPass = async () => {
    const id = Number(visitId);
    if (!id) {
      setActionStatus({
        type: "error",
        message: "issue-qr-pass failed: enter a visit ID",
      });
      return;
    }

    setIsLoading(true);
    setActionStatus(null);
    setPassQrCode(null);
    try {
      const alreadyVerified = ["id_verified", "pass_issued", "inside"].includes(
        currentVisitStatus,
      );
      if (!alreadyVerified) {
        await verifyVisitor({
          visit_id: id,
          method: "manual",
          result: true,
          notes: "Quick QR pass issuance",
        });
        patchVisitorRecord(visitId, { status: "id_verified" });
        setCurrentVisitStatus("id_verified");
      }

      const { data } = await issuePass({
        visit_id: id,
        authorized_zones: authorizedZones,
      });

      if (data?.qr_code) {
        setPassQrCode(data.qr_code);
      }
      patchVisitorRecord(visitId, {
        status: "pass_issued",
        authorized_zones: authorizedZones,
      });
      setCurrentVisitStatus("pass_issued");
      setActionStatus({
        type: "success",
        message: "issue-qr-pass completed successfully",
      });
    } catch (error) {
      handleFailure("issue-qr-pass", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRecordEntry = () => {
    if (!["pass_issued", "inside"].includes(currentVisitStatus)) {
      setActionStatus({
        type: "error",
        message: "record-entry failed: issue pass before recording entry",
      });
      return;
    }

    execute(
      "record-entry",
      () =>
        recordEntry({
          visit_id: Number(visitId),
          gate_name: gateName,
          items_declared: itemsDeclared,
        }),
      {
        onSuccess: () => {
          patchVisitorRecord(visitId, {
            status: "inside",
            gate_name: gateName,
          });
          setCurrentVisitStatus("inside");
        },
      },
    );
  };

  const onRecordExit = () => {
    if (!["inside", "exited"].includes(currentVisitStatus)) {
      setActionStatus({
        type: "error",
        message: "record-exit failed: record entry before exit",
      });
      return;
    }

    execute(
      "record-exit",
      () =>
        recordExit({
          visit_id: Number(visitId),
          gate_name: gateName,
          items_declared: itemsDeclared,
        }),
      {
        onSuccess: async () => {
          patchVisitorRecord(visitId, {
            status: "exited",
            gate_name: gateName,
          });
          setCurrentVisitStatus("exited");
          // Backend auto-releases escorts on exit — refetch escort lists
          // directly (inlined to avoid a forward reference to a handler
          // defined later in this hook).
          try {
            const [list, avail] = await Promise.all([
              fetchEscorts(),
              fetchAvailableEscorts(),
            ]);
            if (Array.isArray(list.data)) setEscortAssignments(list.data);
            if (Array.isArray(avail.data)) setAvailableEscorts(avail.data);
          } catch (_) {
            /* best-effort */
          }
        },
      },
    );
  };

  const onDenyEntry = () =>
    execute(
      "deny-entry",
      () =>
        denyEntry({
          visit_id: Number(visitId),
          reason: denyReason,
          remarks: denyRemarks,
          escalated: true,
        }),
      {
        onSuccess: () => {
          patchVisitorRecord(visitId, {
            status: "denied",
          });
          setCurrentVisitStatus("denied");
        },
      },
    );

  const onRefreshActiveVisitors = () =>
    execute("active", fetchActiveVisitors, {
      onSuccess: (data) => {
        const records = parseVisitorRecords(data);
        setActiveVisitors(records);

        const selectedVisit = records.find(
          (record) => String(record.id) === String(visitId),
        );
        if (selectedVisit) {
          setCurrentVisitStatus(selectedVisit.status);
        }
      },
    });

  const onLogIncident = () =>
    execute(
      "incident",
      () =>
        logIncident({
          visit_id: Number(visitId) || undefined,
          ...incidentPayload,
        }),
      {
        onSuccess: () => {
          setIncidentLog((previous) => [
            createIncidentRecord(visitId, incidentPayload),
            ...previous,
          ]);
        },
      },
    );

  const onGenerateReport = () => {
    if (!reportStartDate || !reportEndDate) {
      setActionStatus({
        type: "error",
        message: "report failed: start and end dates are required",
      });
      return;
    }
    execute(
      "report",
      () =>
        generateReport({
          report_type: reportType,
          start_date: reportStartDate,
          end_date: reportEndDate,
        }),
      {
        onSuccess: (data) => {
          setReportData(data || null);
          const summary = data?.summary;
          if (summary) {
            setActionStatus({
              type: "success",
              message: `report generated: ${summary.total_visits ?? 0} visits, ${summary.total_incidents ?? 0} incidents, ${summary.vip_visits ?? 0} VIP`,
            });
          }
        },
      },
    );
  };

  const onImportVisitors = () => {
    if (!importContent.trim()) {
      setActionStatus({
        type: "error",
        message: "import failed: data content is required",
      });
      return;
    }
    let fieldMapping;
    try {
      fieldMapping = JSON.parse(importFieldMapping);
      if (
        typeof fieldMapping !== "object" ||
        fieldMapping === null ||
        Array.isArray(fieldMapping)
      ) {
        throw new Error("not an object");
      }
    } catch (err) {
      setActionStatus({
        type: "error",
        message: "import failed: field mapping must be a JSON object",
      });
      return;
    }

    execute(
      "import",
      () =>
        importVisitors({
          format: importFormat,
          data_content: importContent,
          field_mapping: fieldMapping,
        }),
      {
        onSuccess: (data) => {
          setImportResult(data || null);
          if (data?.records_processed !== undefined) {
            setActionStatus({
              type: "success",
              message: `import completed: ${data.records_processed} records processed`,
            });
          }
        },
      },
    );
  };

  const onDownloadReportPdf = () => {
    if (!reportData) {
      setActionStatus({
        type: "error",
        message: "report-pdf failed: generate a report first",
      });
      return;
    }
    try {
      exportOperationalReportPdf(reportData, {
        activeVisitors,
        incidents: incidentLog,
      });
      setActionStatus({
        type: "success",
        message: "report-pdf downloaded",
      });
    } catch (err) {
      setActionStatus({
        type: "error",
        message: `report-pdf failed: ${err.message}`,
      });
    }
  };

  const onExportVisitorHistory = () => {
    const parsedVisitId = Number(historyVisitIdInput);
    if (!parsedVisitId) {
      setActionStatus({
        type: "error",
        message:
          "visitor-history failed: a numeric Visit ID is required (see Visitor Records)",
      });
      return;
    }
    execute(
      "visitor-history",
      () => fetchVisitorHistoryByVisit(parsedVisitId),
      {
        onSuccess: (data) => {
          try {
            exportVisitorHistoryPdf(data);
            setActionStatus({
              type: "success",
              message: `visitor-history PDF generated for Visit #${parsedVisitId}`,
            });
          } catch (err) {
            setActionStatus({
              type: "error",
              message: `visitor-history PDF generation failed: ${err.message}`,
            });
          }
        },
      },
    );
  };

  const onAddToBlacklist = () => {
    const idNumber = blacklistForm.id_number.trim();
    const visitIdRaw = String(blacklistForm.visit_id || "").trim();
    const reason = blacklistForm.reason.trim();
    if (!reason) {
      setActionStatus({
        type: "error",
        message: "blacklist-add failed: reason is required",
      });
      return;
    }
    if (!idNumber && !visitIdRaw) {
      setActionStatus({
        type: "error",
        message: "blacklist-add failed: supply either ID Number or Visit ID",
      });
      return;
    }
    const payload = { reason, evidence: blacklistForm.evidence.trim() };
    if (idNumber) payload.id_number = idNumber;
    if (visitIdRaw) payload.visit_id = Number(visitIdRaw);
    execute("blacklist-add", () => addToBlacklist(payload), {
      onSuccess: (data) => {
        if (data && data.id) {
          setBlacklistEntries((previous) => [
            data,
            ...previous.filter((entry) => entry.id !== data.id),
          ]);
        }
        setBlacklistForm({
          id_number: "",
          visit_id: "",
          reason: "",
          evidence: "",
        });
      },
    });
  };

  const onRemoveFromBlacklist = (entryId) => {
    execute("blacklist-remove", () => removeFromBlacklist(entryId), {
      onSuccess: () => {
        setBlacklistEntries((previous) =>
          previous.map((entry) =>
            entry.id === entryId ? { ...entry, active: false } : entry,
          ),
        );
      },
    });
  };

  const onAddSecurityPersonnel = () => {
    if (!newStaffName.trim()) {
      setActionStatus({
        type: "error",
        message: "security-personnel failed: staff name is required",
      });
      return;
    }

    const newRecord = {
      id: Date.now(),
      name: newStaffName.trim(),
      role: newStaffRole,
      shift: newStaffShift,
      status: "on-duty",
    };

    setSecurityPersonnel((previous) => [newRecord, ...previous]);
    setNewStaffName("");
    setActionStatus({
      type: "success",
      message: `security-personnel completed: ${newRecord.name} added`,
    });
  };

  const onTogglePersonnelStatus = (id) => {
    setSecurityPersonnel((previous) =>
      previous.map((member) =>
        member.id === id
          ? {
              ...member,
              status: member.status === "on-duty" ? "off-duty" : "on-duty",
            }
          : member,
      ),
    );
  };

  const onGrantVipAccess = () => {
    const targetVisitId = Number(vipVisitIdInput);
    if (!targetVisitId) {
      setActionStatus({
        type: "error",
        message: "vip-permission failed: a numeric Visit ID is required",
      });
      return;
    }

    const parsedLevel = Number(vipLevelInput);
    const levelPayload =
      Number.isFinite(parsedLevel) && parsedLevel > 0
        ? { vip_level: parsedLevel }
        : {};

    execute(
      "vip-permission",
      () =>
        processVipVisit({
          visit_id: targetVisitId,
          bypass_approval: vipBypassApproval,
          ...levelPayload,
        }),
      {
        onSuccess: (data) => {
          const visit = data?.visit || {};
          const resolvedId = visit.id || targetVisitId;
          const record = {
            id: resolvedId,
            visit_id: resolvedId,
            visitor: visit.visitor?.full_name || `Visit #${targetVisitId}`,
            access_level: visit.authorized_zones || "pending",
            active: true,
          };
          setVipPermissions((previous) => [
            record,
            ...previous.filter((p) => p.visit_id !== record.visit_id),
          ]);
          patchVisitorRecord(String(resolvedId), {
            is_vip: true,
            status: visit.status,
          });
          // BR-046: if the backend auto-assigned an escort, refresh the lists.
          if (data?.auto_escort) {
            setEscortAssignments((prev) => [data.auto_escort, ...prev]);
            fetchAvailableEscorts()
              .then((res) => {
                if (Array.isArray(res.data)) setAvailableEscorts(res.data);
              })
              .catch(() => {});
          }
          setVipVisitIdInput("");
        },
      },
    );
  };

  const refreshEscortLists = async () => {
    try {
      const [list, avail] = await Promise.all([
        fetchEscorts(),
        fetchAvailableEscorts(),
      ]);
      if (Array.isArray(list.data)) setEscortAssignments(list.data);
      if (Array.isArray(avail.data)) setAvailableEscorts(avail.data);
    } catch {
      /* swallow — UI already shows previous snapshot */
    }
  };

  const onAssignEscort = () => {
    const targetVisitId = Number(escortVisitIdInput);
    if (!targetVisitId) {
      setActionStatus({
        type: "error",
        message: "escort-assign failed: a numeric Visit ID is required",
      });
      return;
    }
    const escortId = Number(escortSelectedId);
    const payload = {
      visit_id: targetVisitId,
      notes: escortNotesInput,
      ...(Number.isFinite(escortId) && escortId > 0
        ? { escort_id: escortId }
        : {}),
    };
    execute("escort-assign", () => assignEscort(payload), {
      onSuccess: () => {
        setEscortVisitIdInput("");
        setEscortSelectedId("");
        setEscortNotesInput("");
        refreshEscortLists();
      },
    });
  };

  const onReleaseEscort = (assignmentId) => {
    execute("escort-release", () => releaseEscort(assignmentId), {
      onSuccess: () => refreshEscortLists(),
    });
  };

  const onToggleVipPermission = (id) => {
    setVipPermissions((previous) =>
      previous.map((record) =>
        record.id === id ? { ...record, active: !record.active } : record,
      ),
    );
  };

  const onLoadImportSample = () => {
    if (importFormat === "csv") {
      setImportContent(
        [
          "full_name,id_number,id_type,contact_phone,contact_email",
          "Nikhil Sharma,345678901234,aadhaar,9812345601,nikhil@example.com",
          "Meera Iyer,456789012345,aadhaar,9812345602,meera@example.com",
          "Raj Patel,P1234567,passport,9812345603,raj@example.com",
          "Kabir Khan,567890123456,aadhaar,9812345604,kabir@example.com",
          "Sara Verma,DL-07-45123,driver_license,9812345605,sara@example.com",
        ].join("\n"),
      );
    } else {
      setImportContent(
        JSON.stringify(
          [
            {
              full_name: "Nikhil Sharma",
              id_number: "345678901234",
              id_type: "aadhaar",
              contact_phone: "9812345601",
              contact_email: "nikhil@example.com",
            },
            {
              full_name: "Meera Iyer",
              id_number: "456789012345",
              id_type: "aadhaar",
              contact_phone: "9812345602",
              contact_email: "meera@example.com",
            },
            {
              full_name: "Raj Patel",
              id_number: "P1234567",
              id_type: "passport",
              contact_phone: "9812345603",
              contact_email: "raj@example.com",
            },
            {
              full_name: "Kabir Khan",
              id_number: "567890123456",
              id_type: "aadhaar",
              contact_phone: "9812345604",
              contact_email: "kabir@example.com",
            },
            {
              full_name: "Sara Verma",
              id_number: "DL-07-45123",
              id_type: "driver_license",
              contact_phone: "9812345605",
              contact_email: "sara@example.com",
            },
          ],
          null,
          2,
        ),
      );
    }
    setImportFieldMapping(
      JSON.stringify(
        {
          full_name: "full_name",
          id_number: "id_number",
          id_type: "id_type",
          contact_phone: "contact_phone",
          contact_email: "contact_email",
        },
        null,
        2,
      ),
    );
    setActionStatus({
      type: "success",
      message: `Sample ${importFormat.toUpperCase()} loaded — click Run Import`,
    });
  };

  // WF-009: System configuration handlers (BR-057–066)
  const onLoadSystemConfig = () =>
    execute("config-load", () => fetchSystemConfig(), {
      onSuccess: (data) => setSystemConfigs(Array.isArray(data) ? data : []),
    });

  const onUpdateSystemConfig = () => {
    if (!configForm.key || !configForm.value) {
      setActionStatus({
        type: "error",
        message: "config-update failed: key and value are required",
      });
      return;
    }
    execute("config-update", () => updateSystemConfig(configForm), {
      onSuccess: async () => {
        // Refetch the full list so the UI reflects the DB, not just the
        // row the save returned.
        try {
          const [cfgRes, histRes] = await Promise.all([
            fetchSystemConfig(),
            fetchConfigHistory(),
          ]);
          setSystemConfigs(Array.isArray(cfgRes.data) ? cfgRes.data : []);
          setConfigHistory(Array.isArray(histRes.data) ? histRes.data : []);
        } catch (_) {
          /* ignore — save already succeeded, refresh is best-effort */
        }
      },
    });
  };

  const onLoadConfigHistory = () =>
    execute("config-history", () => fetchConfigHistory(), {
      onSuccess: (data) => setConfigHistory(Array.isArray(data) ? data : []),
    });

  const onLoadVisitingHours = () =>
    execute("visiting-hours-load", () => fetchVisitingHours(), {
      onSuccess: (data) => setVisitingHours(Array.isArray(data) ? data : []),
    });

  const onConfigureVisitingHours = () =>
    execute(
      "visiting-hours-configure",
      () => configureVisitingHours(visitingHoursForm),
      {
        onSuccess: async () => {
          try {
            const res = await fetchVisitingHours();
            setVisitingHours(Array.isArray(res.data) ? res.data : []);
          } catch (_) {
            /* best-effort refresh */
          }
        },
      },
    );

  const onLoadAccessZones = () =>
    execute("zones-load", () => fetchAccessZones(), {
      onSuccess: (data) => setAccessZones(Array.isArray(data) ? data : []),
    });

  const onConfigureAccessZone = () =>
    execute("zone-configure", () => configureAccessZone(accessZoneForm), {
      onSuccess: async () => {
        try {
          const res = await fetchAccessZones();
          setAccessZones(Array.isArray(res.data) ? res.data : []);
        } catch (_) {
          /* best-effort refresh */
        }
      },
    });

  const metrics = {
    activeVisitors: activeVisitors.length,
    openIncidents: incidentLog.length,
    vipAccess: vipPermissions.filter((record) => record.active).length,
    staffOnDuty: securityPersonnel.filter(
      (member) => member.status === "on-duty",
    ).length,
  };

  return {
    registerPayload,
    setRegisterPayload,
    visitId,
    setVisitId,
    authorizedZones,
    setAuthorizedZones,
    gateName,
    setGateName,
    itemsDeclared,
    setItemsDeclared,
    denyReason,
    setDenyReason,
    denyRemarks,
    setDenyRemarks,
    incidentPayload,
    setIncidentPayload,
    activeVisitors,
    recentRegistrations,
    incidentLog,
    securityPersonnel,
    vipPermissions,
    newStaffName,
    setNewStaffName,
    newStaffRole,
    setNewStaffRole,
    newStaffShift,
    setNewStaffShift,
    vipVisitIdInput,
    setVipVisitIdInput,
    vipBypassApproval,
    setVipBypassApproval,
    vipLevelInput,
    setVipLevelInput,
    escortAssignments,
    availableEscorts,
    escortVisitIdInput,
    setEscortVisitIdInput,
    escortSelectedId,
    setEscortSelectedId,
    escortNotesInput,
    setEscortNotesInput,
    reportType,
    setReportType,
    reportStartDate,
    setReportStartDate,
    reportEndDate,
    setReportEndDate,
    reportData,
    importFormat,
    setImportFormat,
    importContent,
    setImportContent,
    importFieldMapping,
    setImportFieldMapping,
    importResult,
    historyVisitIdInput,
    setHistoryVisitIdInput,
    blacklistEntries,
    blacklistForm,
    setBlacklistForm,
    actionStatus,
    currentVisitStatus,
    isLoading,
    passQrCode,
    metrics,
    onRegisterVisitor,
    onVerifyVisitor,
    onIssuePass,
    onIssueQrPass,
    onRecordEntry,
    onRecordExit,
    onDenyEntry,
    onRefreshActiveVisitors,
    onLogIncident,
    onGenerateReport,
    onAddSecurityPersonnel,
    onTogglePersonnelStatus,
    onGrantVipAccess,
    onToggleVipPermission,
    onAssignEscort,
    onReleaseEscort,
    onImportVisitors,
    onLoadImportSample,
    onExportVisitorHistory,
    onDownloadReportPdf,
    onAddToBlacklist,
    onRemoveFromBlacklist,
    // WF-009: system configuration
    systemConfigs,
    configHistory,
    configForm,
    setConfigForm,
    visitingHours,
    visitingHoursForm,
    setVisitingHoursForm,
    accessZones,
    accessZoneForm,
    setAccessZoneForm,
    onLoadSystemConfig,
    onUpdateSystemConfig,
    onLoadConfigHistory,
    onLoadVisitingHours,
    onConfigureVisitingHours,
    onLoadAccessZones,
    onConfigureAccessZone,
  };
}

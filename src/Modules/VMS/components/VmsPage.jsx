import { Container, Divider, Title } from "@mantine/core";
import { useEffect, useState } from "react";
import VmsForm from "./VmsForm";
import VmsTable from "./VmsTable";
import LoadingSpinner from "./LoadingSpinner";
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
} from "./api";
import {
  defaultIncidentPayload,
  defaultRegisterPayload,
  defaultSecurityPersonnel,
  defaultVipPermissions,
  extractErrorPayload,
  buildOperationalReport,
  createIncidentRecord,
  parseVisitorRecords,
} from "./helpers";
import "./module.css";

function VmsPage() {
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
  const [vipVisitorName, setVipVisitorName] = useState("");
  const [vipAccessLevel, setVipAccessLevel] = useState("admin_block");
  const [actionStatus, setActionStatus] = useState(null);
  const [currentVisitStatus, setCurrentVisitStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passQrCode, setPassQrCode] = useState(null);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [activeRes, recentRes, incidentsRes] = await Promise.allSettled([
          fetchActiveVisitors(),
          fetchRecentVisits(5),
          fetchIncidents(20),
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
        onSuccess: () => {
          patchVisitorRecord(visitId, {
            status: "exited",
            gate_name: gateName,
          });
          setCurrentVisitStatus("exited");
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
    const report = buildOperationalReport({
      records: activeVisitors,
      incidents: incidentLog,
      vipPermissions,
      securityPersonnel,
    });
    setActionStatus({
      type: "success",
      message: `report generated: ${report.total_active_visitors} active visitors, ${report.total_incidents} incidents`,
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

  const onAddVipPermission = () => {
    if (!vipVisitorName.trim()) {
      setActionStatus({
        type: "error",
        message: "vip-permission failed: visitor name is required",
      });
      return;
    }

    const newPermission = {
      id: Date.now(),
      visitor: vipVisitorName.trim(),
      access_level: vipAccessLevel,
      active: true,
    };

    setVipPermissions((previous) => [newPermission, ...previous]);
    setVipVisitorName("");
    setActionStatus({
      type: "success",
      message: `vip-permission completed: access granted to ${newPermission.visitor}`,
    });
  };

  const onToggleVipPermission = (id) => {
    setVipPermissions((previous) =>
      previous.map((record) =>
        record.id === id ? { ...record, active: !record.active } : record,
      ),
    );
  };

  const metrics = {
    activeVisitors: activeVisitors.length,
    openIncidents: incidentLog.length,
    vipAccess: vipPermissions.filter((record) => record.active).length,
    staffOnDuty: securityPersonnel.filter(
      (member) => member.status === "on-duty",
    ).length,
  };

  return (
    <Container size="lg" py="xl" className="vmsPage">
      <Title order={2}>VMS Command Center</Title>
      <Divider my="md" />
      {isLoading && <LoadingSpinner />}
      <VmsForm
        metrics={metrics}
        registerPayload={registerPayload}
        setRegisterPayload={setRegisterPayload}
        visitId={visitId}
        setVisitId={setVisitId}
        authorizedZones={authorizedZones}
        setAuthorizedZones={setAuthorizedZones}
        gateName={gateName}
        setGateName={setGateName}
        itemsDeclared={itemsDeclared}
        setItemsDeclared={setItemsDeclared}
        denyReason={denyReason}
        setDenyReason={setDenyReason}
        denyRemarks={denyRemarks}
        setDenyRemarks={setDenyRemarks}
        incidentPayload={incidentPayload}
        setIncidentPayload={setIncidentPayload}
        incidentLog={incidentLog}
        securityPersonnel={securityPersonnel}
        newStaffName={newStaffName}
        setNewStaffName={setNewStaffName}
        newStaffRole={newStaffRole}
        setNewStaffRole={setNewStaffRole}
        newStaffShift={newStaffShift}
        setNewStaffShift={setNewStaffShift}
        vipPermissions={vipPermissions}
        vipVisitorName={vipVisitorName}
        setVipVisitorName={setVipVisitorName}
        vipAccessLevel={vipAccessLevel}
        setVipAccessLevel={setVipAccessLevel}
        currentVisitStatus={currentVisitStatus}
        actionStatus={actionStatus}
        onRegisterVisitor={onRegisterVisitor}
        onVerifyVisitor={onVerifyVisitor}
        onIssuePass={onIssuePass}
        onRecordEntry={onRecordEntry}
        onRecordExit={onRecordExit}
        onDenyEntry={onDenyEntry}
        onLogIncident={onLogIncident}
        onRefreshActiveVisitors={onRefreshActiveVisitors}
        onGenerateReport={onGenerateReport}
        onAddSecurityPersonnel={onAddSecurityPersonnel}
        onTogglePersonnelStatus={onTogglePersonnelStatus}
        onAddVipPermission={onAddVipPermission}
        onToggleVipPermission={onToggleVipPermission}
        passQrCode={passQrCode}
      />
      <Divider my="lg" />
      <VmsTable
        visitorRows={activeVisitors}
        recentRegistrations={recentRegistrations}
        incidents={incidentLog}
        staff={securityPersonnel}
      />
    </Container>
  );
}

export default VmsPage;

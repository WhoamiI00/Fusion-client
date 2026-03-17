import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Group,
  List,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import PropTypes from "prop-types";
import {
  denyReasonOptions,
  gateOptions,
  idTypeOptions,
  severityOptions,
  shiftOptions,
  staffRoleOptions,
  vipAccessOptions,
  incidentTypeOptions,
  zoneOptions,
} from "../../utils/helpers";
import "../../styles/module.css";

function VmsForm({
  metrics,
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
  incidentLog,
  securityPersonnel,
  newStaffName,
  setNewStaffName,
  newStaffRole,
  setNewStaffRole,
  newStaffShift,
  setNewStaffShift,
  vipPermissions,
  vipVisitorName,
  setVipVisitorName,
  vipAccessLevel,
  setVipAccessLevel,
  currentVisitStatus,
  actionStatus,
  onRegisterVisitor,
  onVerifyVisitor,
  onIssuePass,
  onRecordEntry,
  onRecordExit,
  onDenyEntry,
  onLogIncident,
  onRefreshActiveVisitors,
  onGenerateReport,
  onAddSecurityPersonnel,
  onTogglePersonnelStatus,
  onAddVipPermission,
  onToggleVipPermission,
  passQrCode,
}) {
  return (
    <Stack gap="lg">
      {actionStatus && (
        <Alert
          color={actionStatus.type === "success" ? "teal" : "red"}
          title={
            actionStatus.type === "success"
              ? "Action Successful"
              : "Action Failed"
          }
          variant="light"
        >
          {actionStatus.message}
        </Alert>
      )}

      <Paper withBorder p="lg" radius="lg" className="vmsHero">
        <Group justify="space-between" align="start">
          <div>
            <Text className="vmsEyebrow">Use-Case Driven Control Panel</Text>
            <Title order={3}>Visitor Management Operations</Title>
            <Text c="dimmed" mt={6}>
              Security Personnel, Security Supervisor and Administrator actions
              consolidated into one operational console.
            </Text>
          </div>
          <Badge variant="light" color="green" size="lg">
            Live Operations
          </Badge>
        </Group>
        <SimpleGrid cols={{ base: 2, md: 4 }} mt="md" spacing="sm">
          <Card className="vmsMetricCard" padding="sm" radius="md">
            <Text size="xs" c="dimmed">
              Active Visitors
            </Text>
            <Title order={3}>{metrics.activeVisitors}</Title>
          </Card>
          <Card className="vmsMetricCard" padding="sm" radius="md">
            <Text size="xs" c="dimmed">
              Open Incidents
            </Text>
            <Title order={3}>{metrics.openIncidents}</Title>
          </Card>
          <Card className="vmsMetricCard" padding="sm" radius="md">
            <Text size="xs" c="dimmed">
              Active VIP Access
            </Text>
            <Title order={3}>{metrics.vipAccess}</Title>
          </Card>
          <Card className="vmsMetricCard" padding="sm" radius="md">
            <Text size="xs" c="dimmed">
              Staff On Duty
            </Text>
            <Title order={3}>{metrics.staffOnDuty}</Title>
          </Card>
        </SimpleGrid>
      </Paper>

      <Tabs defaultValue="security-personnel" className="vmsTabs">
        <Tabs.List>
          <Tabs.Tab value="security-personnel">Security Personnel</Tabs.Tab>
          <Tabs.Tab value="security-supervisor">Security Supervisor</Tabs.Tab>
          <Tabs.Tab value="administrator">Administrator</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="security-personnel" pt="md">
          <Stack gap="lg">
            <Paper withBorder p="md" radius="md">
              <Title order={4}>Register Visitor</Title>
              <Stack gap="sm" mt="sm">
                <Group grow>
                  <TextInput
                    label="Full Name"
                    value={registerPayload.full_name}
                    onChange={(event) =>
                      setRegisterPayload({
                        ...registerPayload,
                        full_name: event.currentTarget.value,
                      })
                    }
                  />
                  <TextInput
                    label="ID Number"
                    value={registerPayload.id_number}
                    onChange={(event) =>
                      setRegisterPayload({
                        ...registerPayload,
                        id_number: event.currentTarget.value,
                      })
                    }
                  />
                </Group>
                <Group grow>
                  <Select
                    label="ID Type"
                    value={registerPayload.id_type}
                    onChange={(value) =>
                      setRegisterPayload({
                        ...registerPayload,
                        id_type: value || "passport",
                      })
                    }
                    data={idTypeOptions}
                  />
                  <TextInput
                    label="Phone"
                    value={registerPayload.contact_phone}
                    onChange={(event) =>
                      setRegisterPayload({
                        ...registerPayload,
                        contact_phone: event.currentTarget.value,
                      })
                    }
                  />
                </Group>
                <Group grow>
                  <TextInput
                    label="Host Name"
                    value={registerPayload.host_name}
                    onChange={(event) =>
                      setRegisterPayload({
                        ...registerPayload,
                        host_name: event.currentTarget.value,
                      })
                    }
                  />
                  <TextInput
                    label="Host Department"
                    value={registerPayload.host_department}
                    onChange={(event) =>
                      setRegisterPayload({
                        ...registerPayload,
                        host_department: event.currentTarget.value,
                      })
                    }
                  />
                </Group>
                <Group grow>
                  <TextInput
                    label="Purpose"
                    value={registerPayload.purpose}
                    onChange={(event) =>
                      setRegisterPayload({
                        ...registerPayload,
                        purpose: event.currentTarget.value,
                      })
                    }
                  />
                  <NumberInput
                    label="Expected Duration (minutes)"
                    value={registerPayload.expected_duration_minutes}
                    min={5}
                    onChange={(value) =>
                      setRegisterPayload({
                        ...registerPayload,
                        expected_duration_minutes: Number(value) || 60,
                      })
                    }
                  />
                </Group>
                <Checkbox
                  label="VIP"
                  checked={registerPayload.is_vip}
                  onChange={(event) =>
                    setRegisterPayload({
                      ...registerPayload,
                      is_vip: event.currentTarget.checked,
                    })
                  }
                />
                <Button onClick={onRegisterVisitor}>Register Visitor</Button>
              </Stack>
            </Paper>

            <Paper withBorder p="md" radius="md">
              <Title order={4}>Verify, Pass and Movement</Title>
              <Stack gap="sm" mt="sm">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Visit workflow status
                  </Text>
                  <Badge variant="light" color="blue">
                    {currentVisitStatus || "not-started"}
                  </Badge>
                </Group>
                <TextInput
                  label="Visit ID"
                  value={visitId}
                  onChange={(event) => setVisitId(event.currentTarget.value)}
                />
                <Group grow>
                  <Select
                    label="Authorized Zones"
                    value={authorizedZones}
                    onChange={(value) => setAuthorizedZones(value || "lobby")}
                    data={zoneOptions}
                  />
                  <Select
                    label="Gate Name"
                    value={gateName}
                    onChange={(value) => setGateName(value || "Main Gate")}
                    data={gateOptions}
                  />
                </Group>
                <TextInput
                  label="Items Declared"
                  value={itemsDeclared}
                  onChange={(event) =>
                    setItemsDeclared(event.currentTarget.value)
                  }
                />
                <Group>
                  <Button onClick={() => onVerifyVisitor(true)}>
                    Verify ID
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onIssuePass}
                    disabled={
                      !visitId ||
                      !["id_verified", "pass_issued"].includes(
                        currentVisitStatus,
                      )
                    }
                  >
                    Issue Visitor Pass
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onRecordEntry}
                    disabled={
                      !visitId ||
                      !["pass_issued", "inside"].includes(currentVisitStatus)
                    }
                  >
                    Record Entry
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onRecordExit}
                    disabled={
                      !visitId ||
                      !["inside", "exited"].includes(currentVisitStatus)
                    }
                  >
                    Record Exit
                  </Button>
                </Group>
                {passQrCode && (
                  <Paper withBorder p="md" radius="md" mt="sm">
                    <Title order={5}>Visitor Pass QR Code</Title>
                    <Text size="xs" c="dimmed" mb="sm">
                      Scan this QR to verify the pass at any gate.
                    </Text>
                    <img
                      src={passQrCode}
                      alt="Visitor Pass QR Code"
                      style={{ maxWidth: 200, display: "block" }}
                    />
                  </Paper>
                )}
                <Group grow>
                  <Select
                    label="Deny Reason"
                    value={denyReason}
                    onChange={(value) => setDenyReason(value || "invalid_id")}
                    data={denyReasonOptions}
                  />
                  <TextInput
                    label="Deny Remarks"
                    value={denyRemarks}
                    onChange={(event) =>
                      setDenyRemarks(event.currentTarget.value)
                    }
                  />
                </Group>
                <Button
                  color="red"
                  onClick={onDenyEntry}
                  disabled={!visitId || currentVisitStatus === "exited"}
                >
                  Deny Entry
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="security-supervisor" pt="md">
          <Stack gap="lg">
            <Paper withBorder p="md" radius="md">
              <Title order={4}>Monitor Visitor Movement</Title>
              <Text size="sm" c="dimmed" mt={4}>
                Review live footfall and run refresh to pull active movement
                data.
              </Text>
              <Group mt="sm">
                <Button onClick={onRefreshActiveVisitors}>
                  Refresh Active Visitors
                </Button>
                <Button variant="outline" onClick={onGenerateReport}>
                  Generate Operations Report
                </Button>
              </Group>
            </Paper>

            <Paper withBorder p="md" radius="md">
              <Title order={4}>Handle Security Issues</Title>
              <Stack gap="sm" mt="sm">
                <Group grow>
                  <Select
                    label="Incident Severity"
                    value={incidentPayload.severity}
                    onChange={(value) =>
                      setIncidentPayload({
                        ...incidentPayload,
                        severity: value || "medium",
                      })
                    }
                    data={severityOptions}
                  />
                  <Select
                    label="Incident Type"
                    value={incidentPayload.issue_type}
                    onChange={(value) =>
                      setIncidentPayload({
                        ...incidentPayload,
                        issue_type: value || "policy_violation",
                      })
                    }
                    data={incidentTypeOptions}
                  />
                </Group>
                <TextInput
                  label="Incident Description"
                  value={incidentPayload.description}
                  onChange={(event) =>
                    setIncidentPayload({
                      ...incidentPayload,
                      description: event.currentTarget.value,
                    })
                  }
                />
                <Button color="orange" onClick={onLogIncident}>
                  Log Incident
                </Button>
              </Stack>
            </Paper>

            <Paper withBorder p="md" radius="md">
              <Title order={5}>Recent Incident Feed</Title>
              {incidentLog.length === 0 ? (
                <Text size="sm" c="dimmed" mt="sm">
                  No incidents logged yet.
                </Text>
              ) : (
                <List size="sm" mt="sm" spacing="xs">
                  {incidentLog.slice(0, 4).map((incident) => (
                    <List.Item key={incident.id}>
                      [{incident.severity}] {incident.issue_type} for Visit ID{" "}
                      {incident.visit_id}
                    </List.Item>
                  ))}
                </List>
              )}
            </Paper>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="administrator" pt="md">
          <Stack gap="lg">
            <Paper withBorder p="md" radius="md">
              <Title order={4}>Manage Security Personnel</Title>
              <Group mt="sm" align="end" grow>
                <TextInput
                  label="Staff Name"
                  value={newStaffName}
                  onChange={(event) =>
                    setNewStaffName(event.currentTarget.value)
                  }
                />
                <Select
                  label="Role"
                  value={newStaffRole}
                  onChange={(value) => setNewStaffRole(value || "Gate Officer")}
                  data={staffRoleOptions}
                />
                <Select
                  label="Shift"
                  value={newStaffShift}
                  onChange={(value) => setNewStaffShift(value || "Morning")}
                  data={shiftOptions}
                />
                <Button onClick={onAddSecurityPersonnel}>Add Staff</Button>
              </Group>
              <Stack mt="md" gap="xs">
                {securityPersonnel.map((member) => (
                  <Group key={member.id} justify="space-between">
                    <Text size="sm">
                      {member.name} · {member.role} · {member.shift}
                    </Text>
                    <Button
                      size="xs"
                      variant="light"
                      color={member.status === "on-duty" ? "green" : "gray"}
                      onClick={() => onTogglePersonnelStatus(member.id)}
                    >
                      {member.status}
                    </Button>
                  </Group>
                ))}
              </Stack>
            </Paper>

            <Paper withBorder p="md" radius="md">
              <Title order={4}>Manage VIP Permission</Title>
              <Group mt="sm" align="end" grow>
                <TextInput
                  label="VIP Visitor / Group"
                  value={vipVisitorName}
                  onChange={(event) =>
                    setVipVisitorName(event.currentTarget.value)
                  }
                />
                <Select
                  label="Access Level"
                  value={vipAccessLevel}
                  onChange={(value) =>
                    setVipAccessLevel(value || "admin_block")
                  }
                  data={vipAccessOptions}
                />
                <Button onClick={onAddVipPermission}>Grant Access</Button>
              </Group>
              <Stack mt="md" gap="xs">
                {vipPermissions.map((record) => (
                  <Group key={record.id} justify="space-between">
                    <Text size="sm">
                      {record.visitor} · {record.access_level}
                    </Text>
                    <Button
                      size="xs"
                      variant="light"
                      color={record.active ? "teal" : "gray"}
                      onClick={() => onToggleVipPermission(record.id)}
                    >
                      {record.active ? "active" : "inactive"}
                    </Button>
                  </Group>
                ))}
              </Stack>
            </Paper>

            <Paper withBorder p="md" radius="md">
              <Title order={4}>Administrative Actions</Title>
              <Group mt="sm">
                <Button onClick={onRefreshActiveVisitors}>
                  View Visitor Records
                </Button>
                <Button variant="outline" onClick={onGenerateReport}>
                  Generate Reports
                </Button>
              </Group>
            </Paper>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

VmsForm.propTypes = {
  metrics: PropTypes.shape({
    activeVisitors: PropTypes.number,
    openIncidents: PropTypes.number,
    vipAccess: PropTypes.number,
    staffOnDuty: PropTypes.number,
  }).isRequired,
  registerPayload: PropTypes.shape({
    full_name: PropTypes.string,
    id_number: PropTypes.string,
    id_type: PropTypes.string,
    contact_phone: PropTypes.string,
    host_name: PropTypes.string,
    host_department: PropTypes.string,
    purpose: PropTypes.string,
    expected_duration_minutes: PropTypes.number,
    is_vip: PropTypes.bool,
  }).isRequired,
  setRegisterPayload: PropTypes.func.isRequired,
  visitId: PropTypes.string.isRequired,
  setVisitId: PropTypes.func.isRequired,
  authorizedZones: PropTypes.string.isRequired,
  setAuthorizedZones: PropTypes.func.isRequired,
  gateName: PropTypes.string.isRequired,
  setGateName: PropTypes.func.isRequired,
  itemsDeclared: PropTypes.string.isRequired,
  setItemsDeclared: PropTypes.func.isRequired,
  denyReason: PropTypes.string.isRequired,
  setDenyReason: PropTypes.func.isRequired,
  denyRemarks: PropTypes.string.isRequired,
  setDenyRemarks: PropTypes.func.isRequired,
  incidentPayload: PropTypes.shape({
    severity: PropTypes.string,
    issue_type: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  setIncidentPayload: PropTypes.func.isRequired,
  incidentLog: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      severity: PropTypes.string,
      issue_type: PropTypes.string,
      visit_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ).isRequired,
  securityPersonnel: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      role: PropTypes.string,
      shift: PropTypes.string,
      status: PropTypes.string,
    }),
  ).isRequired,
  newStaffName: PropTypes.string.isRequired,
  setNewStaffName: PropTypes.func.isRequired,
  newStaffRole: PropTypes.string.isRequired,
  setNewStaffRole: PropTypes.func.isRequired,
  newStaffShift: PropTypes.string.isRequired,
  setNewStaffShift: PropTypes.func.isRequired,
  vipPermissions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      visitor: PropTypes.string,
      access_level: PropTypes.string,
      active: PropTypes.bool,
    }),
  ).isRequired,
  vipVisitorName: PropTypes.string.isRequired,
  setVipVisitorName: PropTypes.func.isRequired,
  vipAccessLevel: PropTypes.string.isRequired,
  setVipAccessLevel: PropTypes.func.isRequired,
  currentVisitStatus: PropTypes.string,
  actionStatus: PropTypes.shape({
    type: PropTypes.string,
    message: PropTypes.string,
  }),
  onRegisterVisitor: PropTypes.func.isRequired,
  onVerifyVisitor: PropTypes.func.isRequired,
  onIssuePass: PropTypes.func.isRequired,
  onRecordEntry: PropTypes.func.isRequired,
  onRecordExit: PropTypes.func.isRequired,
  onDenyEntry: PropTypes.func.isRequired,
  onLogIncident: PropTypes.func.isRequired,
  onRefreshActiveVisitors: PropTypes.func.isRequired,
  onGenerateReport: PropTypes.func.isRequired,
  onAddSecurityPersonnel: PropTypes.func.isRequired,
  onTogglePersonnelStatus: PropTypes.func.isRequired,
  onAddVipPermission: PropTypes.func.isRequired,
  onToggleVipPermission: PropTypes.func.isRequired,
  passQrCode: PropTypes.string,
};

VmsForm.defaultProps = {
  currentVisitStatus: null,
  actionStatus: null,
  passQrCode: null,
};

export default VmsForm;

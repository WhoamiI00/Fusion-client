import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Divider,
  Group,
  List,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import LoadingSpinner from "./LoadingSpinner";
import VmsTable from "./VmsTable";
import useVmsController from "./useVmsController";
import {
  incidentTypeOptions,
  severityOptions,
  shiftOptions,
  staffRoleOptions,
  vipAccessOptions,
} from "./helpers";
import "./module.css";

function VmsAdminPage() {
  const ctrl = useVmsController();

  return (
    <Container size="lg" py="xl" className="vmsPage">
      <Title order={2}>VMS · Administrator Console</Title>
      <Text c="dimmed" size="sm">
        Supervisor and administrator actions: incident handling, personnel
        management, VIP access and reporting.
      </Text>
      <Divider my="md" />
      {ctrl.isLoading && <LoadingSpinner />}

      <Stack gap="lg">
        {ctrl.actionStatus && (
          <Alert
            color={ctrl.actionStatus.type === "success" ? "teal" : "red"}
            title={
              ctrl.actionStatus.type === "success"
                ? "Action Successful"
                : "Action Failed"
            }
            variant="light"
          >
            {ctrl.actionStatus.message}
          </Alert>
        )}

        <Paper withBorder p="lg" radius="lg" className="vmsHero">
          <Group justify="space-between" align="start">
            <div>
              <Text className="vmsEyebrow">Administrator View</Text>
              <Title order={3}>Visitor Management Oversight</Title>
              <Text c="dimmed" mt={6}>
                Supervise visitor flow, manage staff rosters and VIP access,
                review incidents and generate reports.
              </Text>
            </div>
            <Badge variant="light" color="grape" size="lg">
              Admin Mode
            </Badge>
          </Group>
          <SimpleGrid cols={{ base: 2, md: 4 }} mt="md" spacing="sm">
            <Card className="vmsMetricCard" padding="sm" radius="md">
              <Text size="xs" c="dimmed">
                Active Visitors
              </Text>
              <Title order={3}>{ctrl.metrics.activeVisitors}</Title>
            </Card>
            <Card className="vmsMetricCard" padding="sm" radius="md">
              <Text size="xs" c="dimmed">
                Open Incidents
              </Text>
              <Title order={3}>{ctrl.metrics.openIncidents}</Title>
            </Card>
            <Card className="vmsMetricCard" padding="sm" radius="md">
              <Text size="xs" c="dimmed">
                Active VIP Access
              </Text>
              <Title order={3}>{ctrl.metrics.vipAccess}</Title>
            </Card>
            <Card className="vmsMetricCard" padding="sm" radius="md">
              <Text size="xs" c="dimmed">
                Staff On Duty
              </Text>
              <Title order={3}>{ctrl.metrics.staffOnDuty}</Title>
            </Card>
          </SimpleGrid>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Title order={4}>Monitor Visitor Movement</Title>
          <Text size="sm" c="dimmed" mt={4}>
            Pull live visitor activity and run an operations summary.
          </Text>
          <Group mt="sm">
            <Button onClick={ctrl.onRefreshActiveVisitors}>
              Refresh Active Visitors
            </Button>
            <Button variant="outline" onClick={ctrl.onGenerateReport}>
              Generate Operations Report
            </Button>
          </Group>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Title order={4}>Handle Security Issues</Title>
          <Stack gap="sm" mt="sm">
            <TextInput
              label="Visit ID (optional)"
              value={ctrl.visitId}
              onChange={(event) => ctrl.setVisitId(event.currentTarget.value)}
            />
            <Group grow>
              <Select
                label="Incident Severity"
                value={ctrl.incidentPayload.severity}
                onChange={(value) =>
                  ctrl.setIncidentPayload({
                    ...ctrl.incidentPayload,
                    severity: value || "medium",
                  })
                }
                data={severityOptions}
              />
              <Select
                label="Incident Type"
                value={ctrl.incidentPayload.issue_type}
                onChange={(value) =>
                  ctrl.setIncidentPayload({
                    ...ctrl.incidentPayload,
                    issue_type: value || "policy_violation",
                  })
                }
                data={incidentTypeOptions}
              />
            </Group>
            <TextInput
              label="Incident Description"
              value={ctrl.incidentPayload.description}
              onChange={(event) =>
                ctrl.setIncidentPayload({
                  ...ctrl.incidentPayload,
                  description: event.currentTarget.value,
                })
              }
            />
            <Button color="orange" onClick={ctrl.onLogIncident}>
              Log Incident
            </Button>
          </Stack>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Title order={5}>Recent Incident Feed</Title>
          {ctrl.incidentLog.length === 0 ? (
            <Text size="sm" c="dimmed" mt="sm">
              No incidents logged yet.
            </Text>
          ) : (
            <List size="sm" mt="sm" spacing="xs">
              {ctrl.incidentLog.slice(0, 4).map((incident) => (
                <List.Item key={incident.id}>
                  [{incident.severity}] {incident.issue_type} for Visit ID{" "}
                  {incident.visit_id}
                </List.Item>
              ))}
            </List>
          )}
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Title order={4}>Manage Security Personnel</Title>
          <Group mt="sm" align="end" grow>
            <TextInput
              label="Staff Name"
              value={ctrl.newStaffName}
              onChange={(event) =>
                ctrl.setNewStaffName(event.currentTarget.value)
              }
            />
            <Select
              label="Role"
              value={ctrl.newStaffRole}
              onChange={(value) =>
                ctrl.setNewStaffRole(value || "Gate Officer")
              }
              data={staffRoleOptions}
            />
            <Select
              label="Shift"
              value={ctrl.newStaffShift}
              onChange={(value) => ctrl.setNewStaffShift(value || "Morning")}
              data={shiftOptions}
            />
            <Button onClick={ctrl.onAddSecurityPersonnel}>Add Staff</Button>
          </Group>
          <Stack mt="md" gap="xs">
            {ctrl.securityPersonnel.map((member) => (
              <Group key={member.id} justify="space-between">
                <Text size="sm">
                  {member.name} · {member.role} · {member.shift}
                </Text>
                <Button
                  size="xs"
                  variant="light"
                  color={member.status === "on-duty" ? "green" : "gray"}
                  onClick={() => ctrl.onTogglePersonnelStatus(member.id)}
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
              value={ctrl.vipVisitorName}
              onChange={(event) =>
                ctrl.setVipVisitorName(event.currentTarget.value)
              }
            />
            <Select
              label="Access Level"
              value={ctrl.vipAccessLevel}
              onChange={(value) =>
                ctrl.setVipAccessLevel(value || "admin_block")
              }
              data={vipAccessOptions}
            />
            <Button onClick={ctrl.onAddVipPermission}>Grant Access</Button>
          </Group>
          <Stack mt="md" gap="xs">
            {ctrl.vipPermissions.map((record) => (
              <Group key={record.id} justify="space-between">
                <Text size="sm">
                  {record.visitor} · {record.access_level}
                </Text>
                <Button
                  size="xs"
                  variant="light"
                  color={record.active ? "teal" : "gray"}
                  onClick={() => ctrl.onToggleVipPermission(record.id)}
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
            <Button onClick={ctrl.onRefreshActiveVisitors}>
              View Visitor Records
            </Button>
            <Button variant="outline" onClick={ctrl.onGenerateReport}>
              Generate Reports
            </Button>
          </Group>
        </Paper>
      </Stack>

      <Divider my="lg" />
      <VmsTable
        visitorRows={ctrl.activeVisitors}
        recentRegistrations={[]}
        incidents={ctrl.incidentLog}
        staff={ctrl.securityPersonnel}
      />
    </Container>
  );
}

export default VmsAdminPage;

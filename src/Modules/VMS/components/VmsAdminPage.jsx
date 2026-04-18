import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Code,
  Container,
  Divider,
  Group,
  List,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
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
} from "./helpers";
import "./module.css";

const reportTypeOptions = [
  { value: "visitor_summary", label: "Visitor Summary" },
  { value: "incident_summary", label: "Incident Summary" },
  { value: "access_log", label: "Access Log" },
  { value: "vip_report", label: "VIP Report" },
  { value: "full_audit", label: "Full Audit" },
];

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
          <Text size="sm" c="dimmed" mt={4}>
            Grant VIP status to an active visit. Enter the Visit ID; enable
            bypass only if authorised (requires VIP bypass privilege).
          </Text>
          <Group mt="sm" align="end" grow>
            <TextInput
              label="Visit ID"
              placeholder="e.g. 42"
              value={ctrl.vipVisitIdInput}
              onChange={(event) =>
                ctrl.setVipVisitIdInput(event.currentTarget.value)
              }
            />
            <Checkbox
              label="Bypass standard approval"
              checked={ctrl.vipBypassApproval}
              onChange={(event) =>
                ctrl.setVipBypassApproval(event.currentTarget.checked)
              }
            />
            <Button onClick={ctrl.onGrantVipAccess}>Grant VIP Status</Button>
          </Group>
          <Stack mt="md" gap="xs">
            {ctrl.vipPermissions.length === 0 && (
              <Text size="sm" c="dimmed">
                No VIP visits yet.
              </Text>
            )}
            {ctrl.vipPermissions.map((record) => (
              <Group key={record.id} justify="space-between">
                <Text size="sm">
                  Visit #{record.visit_id} · {record.visitor} ·{" "}
                  {record.access_level}
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
          <Title order={4}>Generate Reports</Title>
          <Text size="sm" c="dimmed" mt={4}>
            Server-generated report over the selected date range. Requires VMS
            admin privileges.
          </Text>
          <Group mt="sm" align="end" grow>
            <Select
              label="Report Type"
              value={ctrl.reportType}
              onChange={(value) =>
                ctrl.setReportType(value || "visitor_summary")
              }
              data={reportTypeOptions}
            />
            <TextInput
              label="Start Date"
              type="date"
              value={ctrl.reportStartDate}
              onChange={(event) =>
                ctrl.setReportStartDate(event.currentTarget.value)
              }
            />
            <TextInput
              label="End Date"
              type="date"
              value={ctrl.reportEndDate}
              onChange={(event) =>
                ctrl.setReportEndDate(event.currentTarget.value)
              }
            />
            <Button variant="outline" onClick={ctrl.onGenerateReport}>
              Generate Report
            </Button>
          </Group>

          {ctrl.reportData && (
            <Paper withBorder p="md" radius="md" mt="md" bg="gray.0">
              <Group justify="space-between" mb="xs">
                <Group gap="sm">
                  <Text fw={600} size="sm">
                    {ctrl.reportData.report_type}
                  </Text>
                  <Badge variant="light" color="blue">
                    {ctrl.reportData.date_range?.start} →{" "}
                    {ctrl.reportData.date_range?.end}
                  </Badge>
                </Group>
                <Button
                  size="xs"
                  variant="light"
                  color="blue"
                  onClick={ctrl.onDownloadReportPdf}
                >
                  Download PDF
                </Button>
              </Group>
              <SimpleGrid cols={{ base: 2, md: 4 }} spacing="sm" mt="xs">
                <Card padding="sm" radius="md" withBorder>
                  <Text size="xs" c="dimmed">
                    Total Visits
                  </Text>
                  <Title order={4}>
                    {ctrl.reportData.summary?.total_visits ?? 0}
                  </Title>
                </Card>
                <Card padding="sm" radius="md" withBorder>
                  <Text size="xs" c="dimmed">
                    VIP Visits
                  </Text>
                  <Title order={4}>
                    {ctrl.reportData.summary?.vip_visits ?? 0}
                  </Title>
                </Card>
                <Card padding="sm" radius="md" withBorder>
                  <Text size="xs" c="dimmed">
                    Incidents
                  </Text>
                  <Title order={4}>
                    {ctrl.reportData.summary?.total_incidents ?? 0}
                  </Title>
                </Card>
                <Card padding="sm" radius="md" withBorder>
                  <Text size="xs" c="dimmed">
                    Daily Avg
                  </Text>
                  <Title order={4}>
                    {ctrl.reportData.trends?.daily_averages ?? 0}
                  </Title>
                </Card>
              </SimpleGrid>
              <Text size="xs" c="dimmed" mt="md">
                Status breakdown
              </Text>
              <Code block mt={4}>
                {JSON.stringify(
                  ctrl.reportData.summary?.status_breakdown ?? {},
                  null,
                  2,
                )}
              </Code>
              <Text size="xs" c="dimmed" mt="sm">
                Severity breakdown
              </Text>
              <Code block mt={4}>
                {JSON.stringify(
                  ctrl.reportData.summary?.severity_breakdown ?? {},
                  null,
                  2,
                )}
              </Code>
              <Text size="xs" c="dimmed" mt="sm">
                Incident rate: {ctrl.reportData.trends?.incident_rate ?? 0}% ·
                Generated at{" "}
                {ctrl.reportData.generated_at
                  ? new Date(ctrl.reportData.generated_at).toLocaleString()
                  : "—"}
              </Text>
            </Paper>
          )}
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Title order={4}>Import Visitor Data</Title>
          <Text size="sm" c="dimmed" mt={4}>
            Bulk-import visitors. Paste CSV (header row required) or a JSON
            array. Field mapping maps source columns/keys in your data onto the
            Visitor model fields (`full_name`, `id_number`, `id_type`,
            `contact_phone`, `contact_email`). Requires VMS admin privileges.
          </Text>
          <Group mt="sm" grow>
            <Select
              label="Format"
              value={ctrl.importFormat}
              onChange={(value) => ctrl.setImportFormat(value || "csv")}
              data={[
                { value: "csv", label: "CSV" },
                { value: "json", label: "JSON" },
              ]}
            />
            <Button onClick={ctrl.onImportVisitors}>Run Import</Button>
          </Group>
          <Textarea
            mt="sm"
            label="Data Content"
            placeholder={
              ctrl.importFormat === "csv"
                ? "full_name,id_number,id_type,contact_phone,contact_email\nAlice,A123,passport,9812345678,alice@example.com"
                : '[{"full_name":"Alice","id_number":"A123","id_type":"passport","contact_phone":"9812345678"}]'
            }
            autosize
            minRows={5}
            maxRows={12}
            value={ctrl.importContent}
            onChange={(event) =>
              ctrl.setImportContent(event.currentTarget.value)
            }
          />
          <Textarea
            mt="sm"
            label="Field Mapping (JSON object: source → target)"
            autosize
            minRows={4}
            maxRows={10}
            value={ctrl.importFieldMapping}
            onChange={(event) =>
              ctrl.setImportFieldMapping(event.currentTarget.value)
            }
          />
          {ctrl.importResult && (
            <Paper withBorder p="sm" radius="md" mt="md" bg="gray.0">
              <Group justify="space-between">
                <Text size="sm" fw={600}>
                  Import Result
                </Text>
                <Badge
                  color={
                    ctrl.importResult.status === "completed"
                      ? "teal"
                      : ctrl.importResult.status === "rolled_back"
                        ? "orange"
                        : "gray"
                  }
                >
                  {ctrl.importResult.status ?? "done"}
                </Badge>
              </Group>
              <Text size="sm" mt={4}>
                Records processed: {ctrl.importResult.records_processed ?? 0}
              </Text>
              {ctrl.importResult.result_summary && (
                <Text size="xs" c="dimmed" mt={2}>
                  {ctrl.importResult.result_summary}
                </Text>
              )}
              {ctrl.importResult.error_details && (
                <Text size="xs" c="red" mt={2}>
                  {ctrl.importResult.error_details}
                </Text>
              )}
            </Paper>
          )}
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Title order={4}>Export Visitor History (PDF)</Title>
          <Text size="sm" c="dimmed" mt={4}>
            Enter the Visit ID from the Visitor Records table below. The backend
            resolves it to the full visitor dossier — profile, every visit,
            linked incidents, and any blacklist entries. Requires VMS admin
            privileges.
          </Text>
          <Group mt="sm" align="end" grow>
            <TextInput
              label="Visit ID"
              placeholder="e.g. 4"
              value={ctrl.historyVisitIdInput}
              onChange={(event) =>
                ctrl.setHistoryVisitIdInput(event.currentTarget.value)
              }
            />
            <Button onClick={ctrl.onExportVisitorHistory}>
              Fetch & Download PDF
            </Button>
          </Group>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Title order={4}>Administrative Actions</Title>
          <Group mt="sm">
            <Button onClick={ctrl.onRefreshActiveVisitors}>
              View Visitor Records
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

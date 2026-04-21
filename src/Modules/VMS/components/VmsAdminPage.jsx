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
          <Title order={4}>Manage Blacklist</Title>
          <Text size="sm" c="dimmed" mt={4}>
            Add or remove blacklist entries. Supply either an ID Number or a
            Visit ID — the server will resolve the visit to its visitor. Adding
            requires VMS admin privileges. Removal deactivates the entry and is
            recorded in the audit log.
          </Text>
          <Group mt="sm" align="end" grow>
            <TextInput
              label="ID Number"
              placeholder="e.g. 234567890123"
              value={ctrl.blacklistForm.id_number}
              onChange={(event) =>
                ctrl.setBlacklistForm({
                  ...ctrl.blacklistForm,
                  id_number: event.currentTarget.value,
                })
              }
            />
            <TextInput
              label="Visit ID (alternative)"
              placeholder="e.g. 42"
              value={ctrl.blacklistForm.visit_id}
              onChange={(event) =>
                ctrl.setBlacklistForm({
                  ...ctrl.blacklistForm,
                  visit_id: event.currentTarget.value,
                })
              }
            />
            <TextInput
              label="Reason"
              placeholder="e.g. Watchlist match"
              value={ctrl.blacklistForm.reason}
              onChange={(event) =>
                ctrl.setBlacklistForm({
                  ...ctrl.blacklistForm,
                  reason: event.currentTarget.value,
                })
              }
            />
            <TextInput
              label="Evidence (optional)"
              placeholder="Reference / case number"
              value={ctrl.blacklistForm.evidence}
              onChange={(event) =>
                ctrl.setBlacklistForm({
                  ...ctrl.blacklistForm,
                  evidence: event.currentTarget.value,
                })
              }
            />
            <Button color="red" onClick={ctrl.onAddToBlacklist}>
              Add to Blacklist
            </Button>
          </Group>
          <Stack mt="md" gap="xs">
            {ctrl.blacklistEntries.length === 0 && (
              <Text size="sm" c="dimmed">
                No blacklist entries loaded.
              </Text>
            )}
            {ctrl.blacklistEntries.map((entry) => (
              <Group key={entry.id} justify="space-between" align="start">
                <div style={{ flex: 1 }}>
                  <Text size="sm" fw={600}>
                    {entry.id_number}{" "}
                    <Badge
                      size="xs"
                      color={entry.active ? "red" : "gray"}
                      variant={entry.active ? "filled" : "light"}
                      ml="xs"
                    >
                      {entry.active ? "active" : "removed"}
                    </Badge>
                  </Text>
                  <Text size="xs" c="dimmed">
                    {entry.reason}
                  </Text>
                  {entry.evidence && (
                    <Text size="xs" c="dimmed">
                      Evidence: {entry.evidence}
                    </Text>
                  )}
                  <Text size="xs" c="dimmed">
                    {entry.created_at
                      ? new Date(entry.created_at).toLocaleString()
                      : "-"}
                  </Text>
                </div>
                {entry.active && (
                  <Button
                    size="xs"
                    variant="light"
                    color="gray"
                    onClick={() => ctrl.onRemoveFromBlacklist(entry.id)}
                  >
                    Remove
                  </Button>
                )}
              </Group>
            ))}
          </Stack>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Title order={4}>Grant VIP Status</Title>
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
            <TextInput
              label="VIP Level (1–10)"
              placeholder="3 triggers escort"
              value={ctrl.vipLevelInput}
              onChange={(event) =>
                ctrl.setVipLevelInput(event.currentTarget.value)
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
          <Text size="xs" c="dimmed" mt={4}>
            Setting VIP level ≥ configured escort threshold auto-assigns an
            available qualified escort.
          </Text>
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
            <Button variant="light" onClick={ctrl.onLoadImportSample}>
              Load Sample
            </Button>
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
          <Title order={4}>System Configuration</Title>
          <Text size="sm" c="dimmed" mt={4}>
            Super Admin only. Server validates values, detects conflicts,
            refreshes cache, logs the change and notifies users.
          </Text>
          <Group mt="sm">
            <Button variant="light" onClick={ctrl.onLoadSystemConfig}>
              Load Current Config
            </Button>
            <Button variant="light" onClick={ctrl.onLoadConfigHistory}>
              Load Change History
            </Button>
          </Group>
          <Group mt="md" align="end" grow>
            <TextInput
              label="Config Key"
              placeholder="e.g. escort_threshold"
              value={ctrl.configForm.key}
              onChange={(event) =>
                ctrl.setConfigForm({
                  ...ctrl.configForm,
                  key: event.currentTarget.value,
                })
              }
            />
            <TextInput
              label="Value"
              placeholder="e.g. 3"
              value={ctrl.configForm.value}
              onChange={(event) =>
                ctrl.setConfigForm({
                  ...ctrl.configForm,
                  value: event.currentTarget.value,
                })
              }
            />
            <TextInput
              label="Description (optional)"
              value={ctrl.configForm.description}
              onChange={(event) =>
                ctrl.setConfigForm({
                  ...ctrl.configForm,
                  description: event.currentTarget.value,
                })
              }
            />
            <Button onClick={ctrl.onUpdateSystemConfig}>Apply Change</Button>
          </Group>
          {ctrl.systemConfigs.length > 0 && (
            <Stack mt="md" gap="xs">
              <Text size="xs" c="dimmed">
                Current configuration
              </Text>
              {ctrl.systemConfigs.map((cfg) => (
                <Group key={cfg.id || cfg.key} justify="space-between">
                  <Text size="sm">
                    <strong>{cfg.key}</strong> = {cfg.value}
                  </Text>
                  {cfg.description && (
                    <Text size="xs" c="dimmed">
                      {cfg.description}
                    </Text>
                  )}
                </Group>
              ))}
            </Stack>
          )}
          {ctrl.configHistory.length > 0 && (
            <Stack mt="md" gap="xs">
              <Text size="xs" c="dimmed">
                Change history
              </Text>
              {ctrl.configHistory.slice(0, 8).map((row) => (
                <Text key={row.id} size="xs" c="dimmed">
                  #{row.id} · {row.old_value} → {row.new_value} ·{" "}
                  {row.changed_at
                    ? new Date(row.changed_at).toLocaleString()
                    : "-"}
                </Text>
              ))}
            </Stack>
          )}
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Title order={4}>Configure Visiting Hours</Title>
          <Text size="sm" c="dimmed" mt={4}>
            Day 0 = Monday … 6 = Sunday. Use is_holiday to mark the day closed
            and pin a holiday name. Requires VMS admin.
          </Text>
          <Group mt="sm">
            <Button variant="light" onClick={ctrl.onLoadVisitingHours}>
              Load Visiting Hours
            </Button>
          </Group>
          <Group mt="md" align="end" grow>
            <TextInput
              label="Day of Week (0–6)"
              type="number"
              value={ctrl.visitingHoursForm.day_of_week}
              onChange={(event) =>
                ctrl.setVisitingHoursForm({
                  ...ctrl.visitingHoursForm,
                  day_of_week: Number(event.currentTarget.value) || 0,
                })
              }
            />
            <TextInput
              label="Start Time"
              placeholder="HH:MM"
              value={ctrl.visitingHoursForm.start_time}
              onChange={(event) =>
                ctrl.setVisitingHoursForm({
                  ...ctrl.visitingHoursForm,
                  start_time: event.currentTarget.value,
                })
              }
            />
            <TextInput
              label="End Time"
              placeholder="HH:MM"
              value={ctrl.visitingHoursForm.end_time}
              onChange={(event) =>
                ctrl.setVisitingHoursForm({
                  ...ctrl.visitingHoursForm,
                  end_time: event.currentTarget.value,
                })
              }
            />
            <TextInput
              label="Holiday Name (optional)"
              value={ctrl.visitingHoursForm.holiday_name}
              onChange={(event) =>
                ctrl.setVisitingHoursForm({
                  ...ctrl.visitingHoursForm,
                  holiday_name: event.currentTarget.value,
                })
              }
            />
          </Group>
          <Group mt="sm">
            <Checkbox
              label="Is Holiday (closed)"
              checked={ctrl.visitingHoursForm.is_holiday}
              onChange={(event) =>
                ctrl.setVisitingHoursForm({
                  ...ctrl.visitingHoursForm,
                  is_holiday: event.currentTarget.checked,
                })
              }
            />
            <Checkbox
              label="Active"
              checked={ctrl.visitingHoursForm.active}
              onChange={(event) =>
                ctrl.setVisitingHoursForm({
                  ...ctrl.visitingHoursForm,
                  active: event.currentTarget.checked,
                })
              }
            />
            <Button onClick={ctrl.onConfigureVisitingHours}>
              Save Visiting Hours
            </Button>
          </Group>
          {ctrl.visitingHours.length > 0 && (
            <Stack mt="md" gap="xs">
              {ctrl.visitingHours.map((h) => (
                <Text key={h.id || h.day_of_week} size="sm">
                  Day {h.day_of_week}: {h.start_time}–{h.end_time}
                  {h.is_holiday ? ` · Holiday: ${h.holiday_name || "-"}` : ""}
                  {h.active ? "" : " · inactive"}
                </Text>
              ))}
            </Stack>
          )}
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Title order={4}>Configure Access Zones</Title>
          <Text size="sm" c="dimmed" mt={4}>
            Define a zone and its restrictions. `is_restricted` means visitors
            need the zone explicitly listed on their pass; `requires_vip` locks
            it to VIP passes. Requires VMS admin.
          </Text>
          <Group mt="sm">
            <Button variant="light" onClick={ctrl.onLoadAccessZones}>
              Load Access Zones
            </Button>
          </Group>
          <Group mt="md" align="end" grow>
            <TextInput
              label="Zone Name"
              placeholder="e.g. server_room"
              value={ctrl.accessZoneForm.name}
              onChange={(event) =>
                ctrl.setAccessZoneForm({
                  ...ctrl.accessZoneForm,
                  name: event.currentTarget.value,
                })
              }
            />
            <TextInput
              label="Description"
              value={ctrl.accessZoneForm.description}
              onChange={(event) =>
                ctrl.setAccessZoneForm({
                  ...ctrl.accessZoneForm,
                  description: event.currentTarget.value,
                })
              }
            />
          </Group>
          <Group mt="sm">
            <Checkbox
              label="Requires VIP"
              checked={ctrl.accessZoneForm.requires_vip}
              onChange={(event) =>
                ctrl.setAccessZoneForm({
                  ...ctrl.accessZoneForm,
                  requires_vip: event.currentTarget.checked,
                })
              }
            />
            <Checkbox
              label="Requires Escort"
              checked={ctrl.accessZoneForm.requires_escort}
              onChange={(event) =>
                ctrl.setAccessZoneForm({
                  ...ctrl.accessZoneForm,
                  requires_escort: event.currentTarget.checked,
                })
              }
            />
            <Checkbox
              label="Is Restricted"
              checked={ctrl.accessZoneForm.is_restricted}
              onChange={(event) =>
                ctrl.setAccessZoneForm({
                  ...ctrl.accessZoneForm,
                  is_restricted: event.currentTarget.checked,
                })
              }
            />
            <Checkbox
              label="Active"
              checked={ctrl.accessZoneForm.active}
              onChange={(event) =>
                ctrl.setAccessZoneForm({
                  ...ctrl.accessZoneForm,
                  active: event.currentTarget.checked,
                })
              }
            />
            <Button onClick={ctrl.onConfigureAccessZone}>Save Zone</Button>
          </Group>
          {ctrl.accessZones.length > 0 && (
            <Stack mt="md" gap="xs">
              {ctrl.accessZones.map((z) => (
                <Group key={z.id || z.name} justify="space-between">
                  <Text size="sm">
                    <strong>{z.name}</strong>
                    {z.requires_vip ? " · VIP" : ""}
                    {z.requires_escort ? " · Escort" : ""}
                    {z.is_restricted ? " · Restricted" : ""}
                    {z.active ? "" : " · inactive"}
                  </Text>
                  {z.description && (
                    <Text size="xs" c="dimmed">
                      {z.description}
                    </Text>
                  )}
                </Group>
              ))}
            </Stack>
          )}
        </Paper>
      </Stack>

      <Divider my="lg" />
      <VmsTable
        visitorRows={ctrl.activeVisitors}
        recentRegistrations={ctrl.recentRegistrations}
        incidents={ctrl.incidentLog}
        staff={[]}
      />
    </Container>
  );
}

export default VmsAdminPage;

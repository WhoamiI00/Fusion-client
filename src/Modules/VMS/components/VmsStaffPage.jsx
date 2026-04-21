import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Container,
  Divider,
  Group,
  NumberInput,
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
  denyReasonOptions,
  gateOptions,
  idTypeOptions,
  incidentTypeOptions,
  severityOptions,
  zoneOptions,
} from "./helpers";
import "./module.css";

function VmsStaffPage() {
  const ctrl = useVmsController();

  return (
    <Container size="lg" py="xl" className="vmsPage">
      <Title order={2}>VMS · Security Staff Console</Title>
      <Text c="dimmed" size="sm">
        Gate-side visitor handling: register, verify, issue pass, record
        movement and deny entry.
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
              <Text className="vmsEyebrow">Security Staff View</Text>
              <Title order={3}>Visitor Gate Operations</Title>
              <Text c="dimmed" mt={6}>
                Day-to-day actions executed by gate officers and security
                personnel.
              </Text>
            </div>
            <Badge variant="light" color="green" size="lg">
              On Duty
            </Badge>
          </Group>
          <SimpleGrid cols={{ base: 2, md: 3 }} mt="md" spacing="sm">
            <Card className="vmsMetricCard" padding="sm" radius="md">
              <Text size="xs" c="dimmed">
                Active Visitors
              </Text>
              <Title order={3}>{ctrl.metrics.activeVisitors}</Title>
            </Card>
            <Card className="vmsMetricCard" padding="sm" radius="md">
              <Text size="xs" c="dimmed">
                Recently Registered
              </Text>
              <Title order={3}>{ctrl.recentRegistrations.length}</Title>
            </Card>
            <Card className="vmsMetricCard" padding="sm" radius="md">
              <Text size="xs" c="dimmed">
                Current Visit Status
              </Text>
              <Title order={4}>{ctrl.currentVisitStatus || "idle"}</Title>
            </Card>
          </SimpleGrid>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Title order={4}>Register Visitor</Title>
          <Stack gap="sm" mt="sm">
            <Group grow>
              <TextInput
                label="Full Name"
                value={ctrl.registerPayload.full_name}
                onChange={(event) =>
                  ctrl.setRegisterPayload({
                    ...ctrl.registerPayload,
                    full_name: event.currentTarget.value,
                  })
                }
              />
              <TextInput
                label="ID Number"
                value={ctrl.registerPayload.id_number}
                onChange={(event) =>
                  ctrl.setRegisterPayload({
                    ...ctrl.registerPayload,
                    id_number: event.currentTarget.value,
                  })
                }
              />
            </Group>
            <Group grow>
              <Select
                label="ID Type"
                value={ctrl.registerPayload.id_type}
                onChange={(value) =>
                  ctrl.setRegisterPayload({
                    ...ctrl.registerPayload,
                    id_type: value || "aadhaar",
                  })
                }
                data={idTypeOptions}
              />
              <TextInput
                label="Phone"
                value={ctrl.registerPayload.contact_phone}
                onChange={(event) =>
                  ctrl.setRegisterPayload({
                    ...ctrl.registerPayload,
                    contact_phone: event.currentTarget.value,
                  })
                }
              />
            </Group>
            <Group grow>
              <TextInput
                label="Host Name"
                value={ctrl.registerPayload.host_name}
                onChange={(event) =>
                  ctrl.setRegisterPayload({
                    ...ctrl.registerPayload,
                    host_name: event.currentTarget.value,
                  })
                }
              />
              <TextInput
                label="Host Department"
                value={ctrl.registerPayload.host_department}
                onChange={(event) =>
                  ctrl.setRegisterPayload({
                    ...ctrl.registerPayload,
                    host_department: event.currentTarget.value,
                  })
                }
              />
            </Group>
            <Group grow>
              <TextInput
                label="Purpose"
                value={ctrl.registerPayload.purpose}
                onChange={(event) =>
                  ctrl.setRegisterPayload({
                    ...ctrl.registerPayload,
                    purpose: event.currentTarget.value,
                  })
                }
              />
              <NumberInput
                label="Expected Duration (minutes)"
                value={ctrl.registerPayload.expected_duration_minutes}
                min={5}
                onChange={(value) =>
                  ctrl.setRegisterPayload({
                    ...ctrl.registerPayload,
                    expected_duration_minutes: Number(value) || 60,
                  })
                }
              />
            </Group>
            <Group grow align="end">
              <Checkbox
                label="VIP"
                checked={ctrl.registerPayload.is_vip}
                onChange={(event) =>
                  ctrl.setRegisterPayload({
                    ...ctrl.registerPayload,
                    is_vip: event.currentTarget.checked,
                    vip_level: event.currentTarget.checked
                      ? Math.max(ctrl.registerPayload.vip_level || 0, 1)
                      : 0,
                  })
                }
              />
              <NumberInput
                label="VIP Level (0-10, >= 3 triggers escort)"
                min={0}
                max={10}
                value={ctrl.registerPayload.vip_level}
                disabled={!ctrl.registerPayload.is_vip}
                onChange={(value) =>
                  ctrl.setRegisterPayload({
                    ...ctrl.registerPayload,
                    vip_level: Number(value) || 0,
                  })
                }
              />
            </Group>
            <Button onClick={ctrl.onRegisterVisitor}>Register Visitor</Button>
          </Stack>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Title order={4}>Issue QR Pass</Title>
          <Text size="sm" c="dimmed" mt={4}>
            Enter a Visit ID to verify the visitor and generate a scannable pass
            QR in one step.
          </Text>
          <Stack gap="sm" mt="sm">
            <Group grow>
              <TextInput
                label="Visit ID"
                placeholder="e.g. 42"
                value={ctrl.visitId}
                onChange={(event) => ctrl.setVisitId(event.currentTarget.value)}
              />
              <Select
                label="Authorized Zones"
                value={ctrl.authorizedZones}
                onChange={(value) => ctrl.setAuthorizedZones(value || "lobby")}
                data={zoneOptions}
              />
            </Group>
            <Button onClick={ctrl.onIssueQrPass} disabled={!ctrl.visitId}>
              Issue QR Pass
            </Button>
            {ctrl.passQrCode && (
              <Paper withBorder p="md" radius="md" mt="sm">
                <Title order={5}>Visitor Pass QR Code</Title>
                <Text size="xs" c="dimmed" mb="sm">
                  Scan this QR to verify the pass at any gate.
                </Text>
                <img
                  src={ctrl.passQrCode}
                  alt="Visitor Pass QR Code"
                  style={{ maxWidth: 220, display: "block" }}
                />
              </Paper>
            )}
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
                {ctrl.currentVisitStatus || "not-started"}
              </Badge>
            </Group>
            <TextInput
              label="Visit ID"
              value={ctrl.visitId}
              onChange={(event) => ctrl.setVisitId(event.currentTarget.value)}
            />
            <Group grow>
              <Select
                label="Authorized Zones"
                value={ctrl.authorizedZones}
                onChange={(value) => ctrl.setAuthorizedZones(value || "lobby")}
                data={zoneOptions}
              />
              <Select
                label="Gate Name"
                value={ctrl.gateName}
                onChange={(value) => ctrl.setGateName(value || "Main Gate")}
                data={gateOptions}
              />
            </Group>
            <TextInput
              label="Items Declared"
              value={ctrl.itemsDeclared}
              onChange={(event) =>
                ctrl.setItemsDeclared(event.currentTarget.value)
              }
            />
            <Group>
              <Button onClick={() => ctrl.onVerifyVisitor(true)}>
                Verify ID
              </Button>
              <Button
                variant="outline"
                onClick={ctrl.onIssuePass}
                disabled={
                  !ctrl.visitId ||
                  !["id_verified", "pass_issued"].includes(
                    ctrl.currentVisitStatus,
                  )
                }
              >
                Issue Visitor Pass
              </Button>
              <Button
                variant="outline"
                onClick={ctrl.onRecordEntry}
                disabled={
                  !ctrl.visitId ||
                  !["pass_issued", "inside"].includes(ctrl.currentVisitStatus)
                }
              >
                Record Entry
              </Button>
              <Button
                variant="outline"
                onClick={ctrl.onRecordExit}
                disabled={
                  !ctrl.visitId ||
                  !["inside", "exited"].includes(ctrl.currentVisitStatus)
                }
              >
                Record Exit
              </Button>
              <Button variant="subtle" onClick={ctrl.onRefreshActiveVisitors}>
                Refresh
              </Button>
            </Group>
            <Group grow>
              <Select
                label="Deny Reason"
                value={ctrl.denyReason}
                onChange={(value) => ctrl.setDenyReason(value || "invalid_id")}
                data={denyReasonOptions}
              />
              <TextInput
                label="Deny Remarks"
                value={ctrl.denyRemarks}
                onChange={(event) =>
                  ctrl.setDenyRemarks(event.currentTarget.value)
                }
              />
            </Group>
            <Button
              color="red"
              onClick={ctrl.onDenyEntry}
              disabled={!ctrl.visitId || ctrl.currentVisitStatus === "exited"}
            >
              Deny Entry
            </Button>
          </Stack>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Title order={4}>Exit Visitor</Title>
          <Text size="sm" c="dimmed" mt={4}>
            Mark the visitor as having left campus. Any active escort assignment
            on this visit is released automatically.
          </Text>
          <Stack gap="sm" mt="sm">
            <Group grow>
              <TextInput
                label="Visit ID"
                placeholder="e.g. 42"
                value={ctrl.visitId}
                onChange={(event) => ctrl.setVisitId(event.currentTarget.value)}
              />
              <Select
                label="Exit Gate"
                value={ctrl.gateName}
                onChange={(value) => ctrl.setGateName(value || "Main Gate")}
                data={gateOptions}
              />
            </Group>
            <Group justify="space-between">
              <Button
                color="grape"
                onClick={ctrl.onRecordExit}
                disabled={
                  !ctrl.visitId ||
                  !["inside", "exited"].includes(ctrl.currentVisitStatus)
                }
              >
                Mark Visitor Exited
              </Button>
              {ctrl.currentVisitStatus === "exited" && (
                <Badge color="grape" variant="light" size="lg">
                  Visitor has left the campus
                </Badge>
              )}
            </Group>
          </Stack>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Title order={4}>Handle Security Issues</Title>
          <Text size="sm" c="dimmed" mt={4}>
            Log an incident tied to the current Visit ID, or leave the Visit ID
            blank for a general checkpoint incident.
          </Text>
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
          <Title order={4}>VIP Escort Assignment</Title>
          <Text size="sm" c="dimmed" mt={4}>
            Assign a dedicated escort to a VIP visit whose vip_level meets the
            configured escort threshold. Leave escort empty to auto-pick the
            first available qualified officer.
          </Text>
          <Group mt="sm" align="end" grow>
            <TextInput
              label="Visit ID"
              placeholder="e.g. 42"
              value={ctrl.escortVisitIdInput}
              onChange={(event) =>
                ctrl.setEscortVisitIdInput(event.currentTarget.value)
              }
            />
            <Select
              label="Escort (optional)"
              placeholder="auto-pick available"
              value={ctrl.escortSelectedId || null}
              onChange={(value) => ctrl.setEscortSelectedId(value || "")}
              data={ctrl.availableEscorts.map((e) => ({
                value: String(e.id),
                label: `${e.name || `Staff #${e.id}`}${
                  e.department ? ` · ${e.department}` : ""
                }`,
              }))}
              clearable
              searchable
            />
            <TextInput
              label="Notes"
              placeholder="Protocol details"
              value={ctrl.escortNotesInput}
              onChange={(event) =>
                ctrl.setEscortNotesInput(event.currentTarget.value)
              }
            />
            <Button onClick={ctrl.onAssignEscort}>Assign Escort</Button>
          </Group>
          <Stack mt="md" gap="xs">
            {ctrl.escortAssignments.length === 0 && (
              <Text size="sm" c="dimmed">
                No active escort assignments.
              </Text>
            )}
            {ctrl.escortAssignments.map((a) => (
              <Group key={a.id} justify="space-between">
                <Text size="sm">
                  #{a.id} · Visit {a.visit} · Escort ID {a.escort || "—"} ·
                  assigned {a.assigned_at?.slice(0, 16).replace("T", " ")}
                  {a.released_at ? " · released" : ""}
                </Text>
                {!a.released_at && (
                  <Button
                    size="xs"
                    variant="light"
                    color="red"
                    onClick={() => ctrl.onReleaseEscort(a.id)}
                  >
                    Release
                  </Button>
                )}
              </Group>
            ))}
          </Stack>
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

export default VmsStaffPage;

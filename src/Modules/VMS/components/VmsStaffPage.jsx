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
                    id_type: value || "passport",
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
            <Checkbox
              label="VIP"
              checked={ctrl.registerPayload.is_vip}
              onChange={(event) =>
                ctrl.setRegisterPayload({
                  ...ctrl.registerPayload,
                  is_vip: event.currentTarget.checked,
                })
              }
            />
            <Button onClick={ctrl.onRegisterVisitor}>Register Visitor</Button>
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
            {ctrl.passQrCode && (
              <Paper withBorder p="md" radius="md" mt="sm">
                <Title order={5}>Visitor Pass QR Code</Title>
                <Text size="xs" c="dimmed" mb="sm">
                  Scan this QR to verify the pass at any gate.
                </Text>
                <img
                  src={ctrl.passQrCode}
                  alt="Visitor Pass QR Code"
                  style={{ maxWidth: 200, display: "block" }}
                />
              </Paper>
            )}
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
      </Stack>

      <Divider my="lg" />
      <VmsTable
        visitorRows={ctrl.activeVisitors}
        recentRegistrations={ctrl.recentRegistrations}
        incidents={[]}
        staff={[]}
      />
    </Container>
  );
}

export default VmsStaffPage;

import {
  Button,
  Checkbox,
  Code,
  Container,
  Divider,
  Group,
  NumberInput,
  Paper,
  Select,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import axios from "axios";
import { useMemo, useState } from "react";
import { host } from "../routes/globalRoutes";

const defaultRegister = {
  full_name: "Alice Visitor",
  id_number: "ID12345",
  id_type: "passport",
  contact_phone: "9998887777",
  contact_email: "alice@example.com",
  photo_reference: "demo-photo-ref",
  purpose: "Client meeting",
  host_name: "Dr. Rao",
  host_department: "CSE",
  host_contact: "9990001111",
  expected_duration_minutes: 60,
  is_vip: false,
};

const defaultIncident = {
  severity: "medium",
  issue_type: "policy_violation",
  description: "Entered restricted corridor",
};

function VmsDemo() {
  const [registerPayload, setRegisterPayload] = useState(defaultRegister);
  const [visitId, setVisitId] = useState("");
  const [authorizedZones, setAuthorizedZones] = useState("lobby");
  const [gateName, setGateName] = useState("Main Gate");
  const [itemsDeclared, setItemsDeclared] = useState("Laptop");
  const [denyReason, setDenyReason] = useState("invalid_id");
  const [denyRemarks, setDenyRemarks] = useState("Photo mismatch");
  const [incidentPayload, setIncidentPayload] = useState(defaultIncident);
  const [output, setOutput] = useState("Ready.");

  const client = useMemo(() => {
    const token = localStorage.getItem("authToken");
    return axios.create({
      baseURL: host,
      headers: token ? { Authorization: `Token ${token}` } : {},
    });
  }, []);

  const show = (label, data) => {
    setOutput(`${label}\n${JSON.stringify(data, null, 2)}`);
  };

  const handleError = (label, error) => {
    const payload = error?.response?.data || error?.message || "Unknown error";
    show(`${label} (error)`, payload);
  };

  const registerVisitor = async () => {
    try {
      const { data, status } = await client.post(
        "/vms/register/",
        registerPayload,
      );
      show(`register (${status})`, data);
      if (data?.visit_id) {
        setVisitId(String(data.visit_id));
      }
    } catch (error) {
      handleError("register", error);
    }
  };

  const verifyVisitor = async (result) => {
    try {
      const { data, status } = await client.post("/vms/verify/", {
        visit_id: Number(visitId),
        method: "manual",
        result,
        notes: result ? "ID matched" : "ID mismatch",
      });
      show(`verify (${status})`, data);
    } catch (error) {
      handleError("verify", error);
    }
  };

  const issuePass = async () => {
    try {
      const { data, status } = await client.post("/vms/pass/", {
        visit_id: Number(visitId),
        authorized_zones: authorizedZones,
      });
      show(`issue-pass (${status})`, data);
    } catch (error) {
      handleError("issue-pass", error);
    }
  };

  const recordEntry = async () => {
    try {
      const { data, status } = await client.post("/vms/entry/", {
        visit_id: Number(visitId),
        gate_name: gateName,
        items_declared: itemsDeclared,
      });
      show(`record-entry (${status})`, data);
    } catch (error) {
      handleError("record-entry", error);
    }
  };

  const recordExit = async () => {
    try {
      const { data, status } = await client.post("/vms/exit/", {
        visit_id: Number(visitId),
        gate_name: gateName,
        items_declared: itemsDeclared,
      });
      show(`record-exit (${status})`, data);
    } catch (error) {
      handleError("record-exit", error);
    }
  };

  const denyEntry = async () => {
    try {
      const { data, status } = await client.post("/vms/deny/", {
        visit_id: Number(visitId),
        reason: denyReason,
        remarks: denyRemarks,
        escalated: true,
      });
      show(`deny-entry (${status})`, data);
    } catch (error) {
      handleError("deny-entry", error);
    }
  };

  const activeVisitors = async () => {
    try {
      const { data, status } = await client.get("/vms/active/");
      show(`active (${status})`, data);
    } catch (error) {
      handleError("active", error);
    }
  };

  const logIncident = async () => {
    try {
      const { data, status } = await client.post("/vms/incidents/", {
        visit_id: Number(visitId) || undefined,
        ...incidentPayload,
      });
      show(`incident (${status})`, data);
    } catch (error) {
      handleError("incident", error);
    }
  };

  return (
    <Container size="lg" py="xl">
      <Title order={2}>VMS API Demo</Title>
      <Divider my="md" />

      <Stack gap="lg">
        <Paper withBorder p="md" radius="md">
          <Title order={4}>1. Register Visitor</Title>
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
                data={[
                  { value: "passport", label: "Passport" },
                  { value: "national_id", label: "National ID" },
                  { value: "driver_license", label: "Driver License" },
                  { value: "aadhaar", label: "Aadhaar" },
                ]}
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
            <Button onClick={registerVisitor}>Register Visitor</Button>
          </Stack>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Title order={4}>2. Common Visit Inputs</Title>
          <Stack gap="sm" mt="sm">
            <TextInput
              label="Visit ID"
              value={visitId}
              onChange={(event) => setVisitId(event.currentTarget.value)}
            />
            <TextInput
              label="Authorized Zones"
              value={authorizedZones}
              onChange={(event) =>
                setAuthorizedZones(event.currentTarget.value)
              }
            />
            <TextInput
              label="Gate Name"
              value={gateName}
              onChange={(event) => setGateName(event.currentTarget.value)}
            />
            <TextInput
              label="Items Declared"
              value={itemsDeclared}
              onChange={(event) => setItemsDeclared(event.currentTarget.value)}
            />
            <Group>
              <Button onClick={() => verifyVisitor(true)}>Verify (Pass)</Button>
              <Button color="red" onClick={() => verifyVisitor(false)}>
                Verify (Fail)
              </Button>
            </Group>
            <Group>
              <Button onClick={issuePass}>Issue Pass</Button>
              <Button onClick={recordEntry}>Record Entry</Button>
              <Button onClick={recordExit}>Record Exit</Button>
              <Button color="red" onClick={denyEntry}>
                Deny Entry
              </Button>
            </Group>
          </Stack>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Title order={4}>3. Denial / Incident / Active</Title>
          <Stack gap="sm" mt="sm">
            <Group grow>
              <TextInput
                label="Denial Reason"
                value={denyReason}
                onChange={(event) => setDenyReason(event.currentTarget.value)}
              />
              <TextInput
                label="Denial Remarks"
                value={denyRemarks}
                onChange={(event) => setDenyRemarks(event.currentTarget.value)}
              />
            </Group>
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
                data={[
                  { value: "critical", label: "Critical" },
                  { value: "high", label: "High" },
                  { value: "medium", label: "Medium" },
                  { value: "low", label: "Low" },
                ]}
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
                data={[
                  {
                    value: "unauthorized_access",
                    label: "Unauthorized Access",
                  },
                  { value: "policy_violation", label: "Policy Violation" },
                  { value: "equipment_failure", label: "Equipment Failure" },
                  {
                    value: "suspicious_behavior",
                    label: "Suspicious Behavior",
                  },
                  { value: "other", label: "Other" },
                ]}
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
            <Group>
              <Button onClick={logIncident}>Log Incident</Button>
              <Button variant="outline" onClick={activeVisitors}>
                Refresh Active Visitors
              </Button>
            </Group>
          </Stack>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Title order={4}>Response</Title>
          <Code block>{output}</Code>
        </Paper>
      </Stack>
    </Container>
  );
}

export default VmsDemo;

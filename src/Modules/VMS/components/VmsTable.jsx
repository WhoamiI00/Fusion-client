import {
  Badge,
  Button,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import PropTypes from "prop-types";
import {
  exportVisitorRecordsPdf,
  exportSecuritySnapshotPdf,
  exportRecentlyRegisteredPdf,
} from "./vmsExportPdf";

function VmsTable({ visitorRows, recentRegistrations, incidents, staff }) {
  const onDutyCount = staff.filter(
    (member) => member.status === "on-duty",
  ).length;

  return (
    <Group align="start" grow>
      <Paper withBorder p="md" radius="md" className="vmsGridPanel">
        <Group justify="space-between" mb="xs">
          <Title order={4}>Visitor Records</Title>
          <Group gap="xs">
            <Badge color="blue" variant="light">
              {visitorRows.length} active
            </Badge>
            <Button
              size="xs"
              variant="light"
              color="blue"
              onClick={() => exportVisitorRecordsPdf(visitorRows)}
            >
              Export PDF
            </Button>
          </Group>
        </Group>
        {visitorRows.length === 0 ? (
          <Text size="sm" c="dimmed" mt="sm">
            No active visitors loaded yet.
          </Text>
        ) : (
          <ScrollArea mt="sm">
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Visit ID</Table.Th>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Gate</Table.Th>
                  <Table.Th>Zone</Table.Th>
                  <Table.Th>VIP</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {visitorRows.map((row) => (
                  <Table.Tr key={row.id}>
                    <Table.Td>{row.id || "-"}</Table.Td>
                    <Table.Td>{row.name || "-"}</Table.Td>
                    <Table.Td>{row.gate_name || "-"}</Table.Td>
                    <Table.Td>{row.authorized_zones || "-"}</Table.Td>
                    <Table.Td>{row.is_vip ? "Yes" : "No"}</Table.Td>
                    <Table.Td>{row.status || "-"}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        )}
      </Paper>

      <Paper withBorder p="md" radius="md" className="vmsGridPanel">
        <Group justify="space-between" mb="xs">
          <Title order={4}>Security Snapshot</Title>
          <Group gap="xs">
            <Badge color={onDutyCount < 2 ? "red" : "green"} variant="light">
              {onDutyCount} on-duty
            </Badge>
            <Button
              size="xs"
              variant="light"
              color="red"
              onClick={() => exportSecuritySnapshotPdf(incidents, staff)}
            >
              Export PDF
            </Button>
          </Group>
        </Group>
        <Text size="sm" fw={600} mb="xs">
          Recent Incident Log
        </Text>
        {incidents.length === 0 ? (
          <Text size="sm" c="dimmed">
            No incidents reported in this session.
          </Text>
        ) : (
          <ScrollArea h={180}>
            <Table withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Severity</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Visit ID</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {incidents.slice(0, 6).map((incident) => (
                  <Table.Tr key={incident.id}>
                    <Table.Td>{incident.severity}</Table.Td>
                    <Table.Td>{incident.issue_type}</Table.Td>
                    <Table.Td>{incident.visit_id}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        )}

        <Text size="sm" fw={600} mt="md" mb="xs">
          Personnel Status
        </Text>
        <ScrollArea h={170}>
          <Table withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {staff.map((member) => (
                <Table.Tr key={member.id}>
                  <Table.Td>{member.name}</Table.Td>
                  <Table.Td>{member.role}</Table.Td>
                  <Table.Td>{member.status}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>

      <Paper withBorder p="md" radius="md" className="vmsGridPanel">
        <Group justify="space-between" mb="xs">
          <Title order={4}>Recently Registered</Title>
          <Group gap="xs">
            <Badge color="indigo" variant="light">
              Last 5
            </Badge>
            <Button
              size="xs"
              variant="light"
              color="indigo"
              onClick={() => exportRecentlyRegisteredPdf(recentRegistrations)}
            >
              Export PDF
            </Button>
          </Group>
        </Group>

        {recentRegistrations.length === 0 ? (
          <Text size="sm" c="dimmed" mt="sm">
            No recent registrations yet.
          </Text>
        ) : (
          <Stack gap="xs" mt="sm">
            {recentRegistrations.map((entry) => (
              <Paper key={entry.id} withBorder p="xs" radius="sm">
                <Group justify="space-between" align="start">
                  <div>
                    <Text size="sm" fw={600}>
                      {entry.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Host: {entry.host_name || "-"}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Registered:{" "}
                      {new Date(entry.registered_at).toLocaleString()}
                    </Text>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <Badge size="sm" variant="light" color="gray">
                      {entry.status}
                    </Badge>
                    {entry.is_vip && (
                      <Badge size="sm" color="yellow" mt={6}>
                        VIP
                      </Badge>
                    )}
                  </div>
                </Group>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>
    </Group>
  );
}

const visitorShape = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  name: PropTypes.string,
  gate_name: PropTypes.string,
  authorized_zones: PropTypes.string,
  is_vip: PropTypes.bool,
  status: PropTypes.string,
};

const registrationShape = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  name: PropTypes.string,
  host_name: PropTypes.string,
  registered_at: PropTypes.string,
  status: PropTypes.string,
  is_vip: PropTypes.bool,
};

const incidentShape = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  severity: PropTypes.string,
  issue_type: PropTypes.string,
  visit_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const staffShape = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  name: PropTypes.string,
  role: PropTypes.string,
  status: PropTypes.string,
};

VmsTable.propTypes = {
  visitorRows: PropTypes.arrayOf(PropTypes.shape(visitorShape)).isRequired,
  recentRegistrations: PropTypes.arrayOf(PropTypes.shape(registrationShape))
    .isRequired,
  incidents: PropTypes.arrayOf(PropTypes.shape(incidentShape)).isRequired,
  staff: PropTypes.arrayOf(PropTypes.shape(staffShape)).isRequired,
};

export default VmsTable;

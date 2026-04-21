import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Alert, Container, Loader, Stack, Text, Title } from "@mantine/core";
import PropTypes from "prop-types";
import axios from "axios";
import { host } from "../../../routes/globalRoutes";

const VMS_ADMIN_AUTHORITIES = new Set(["super_admin", "admin"]);

/**
 * Route guard for the Visitor Management module.
 *
 * Calls /vms/me/ to resolve the current user's VMS authority level.
 * - null (no HostAuthority row) → student / generic user → redirect home.
 * - basic / department → staff tier → allowed on the Staff page only.
 * - admin / super_admin → Admin tier → allowed on either page.
 *
 * `require="staff"` admits anyone with *any* HostAuthority row.
 * `require="admin"` admits only admin + super_admin.
 */
function VmsAccessGuard({ require, children }) {
  const [state, setState] = useState({ status: "checking", authority: null });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setState({ status: "denied", authority: null });
      return;
    }
    axios
      .get(`${host}/vms/me/`, {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => {
        const authority = res.data?.authority_level ?? null;
        setState({ status: "loaded", authority });
      })
      .catch(() => setState({ status: "denied", authority: null }));
  }, []);

  if (state.status === "checking") {
    return (
      <Container size="lg" py="xl">
        <Stack align="center" gap="xs">
          <Loader />
          <Text size="sm" c="dimmed">
            Verifying access…
          </Text>
        </Stack>
      </Container>
    );
  }

  const { authority } = state;

  if (authority === null) {
    return <Navigate to="/dashboard" replace />;
  }

  if (require === "admin" && !VMS_ADMIN_AUTHORITIES.has(authority)) {
    return (
      <Container size="lg" py="xl">
        <Alert color="red" title="Access Denied" variant="light">
          <Title order={5} mb="xs">
            VMS administrator privileges required
          </Title>
          <Text size="sm">
            Your current role ({authority}) does not have access to the VMS
            administrator console.
          </Text>
        </Alert>
      </Container>
    );
  }

  return children;
}

VmsAccessGuard.propTypes = {
  require: PropTypes.oneOf(["staff", "admin"]).isRequired,
  children: PropTypes.node.isRequired,
};

export default VmsAccessGuard;

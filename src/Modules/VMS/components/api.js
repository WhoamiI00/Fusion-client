import axios from "axios";
import { host } from "../../../routes/globalRoutes";

const getClient = () => {
  const token = localStorage.getItem("authToken");
  return axios.create({
    baseURL: host,
    headers: token ? { Authorization: `Token ${token}` } : {},
  });
};

export const registerVisitor = (payload) =>
  getClient().post("/vms/register/", payload);

export const verifyVisitor = (payload) =>
  getClient().post("/vms/verify/", payload);

export const issuePass = (payload) => getClient().post("/vms/pass/", payload);

export const recordEntry = (payload) =>
  getClient().post("/vms/entry/", payload);

export const recordExit = (payload) => getClient().post("/vms/exit/", payload);

export const denyEntry = (payload) => getClient().post("/vms/deny/", payload);

export const fetchActiveVisitors = () => getClient().get("/vms/active/");

export const fetchRecentVisits = (limit = 5) =>
  getClient().get(`/vms/recent/?limit=${limit}`);

export const fetchIncidents = (limit = 20) =>
  getClient().get(`/vms/incidents/?limit=${limit}`);

export const logIncident = (payload) =>
  getClient().post("/vms/incidents/", payload);

export const processVipVisit = (payload) =>
  getClient().post("/vms/vip/process/", payload);

export const fetchVipVisitors = () => getClient().get("/vms/vip/");

export const generateReport = (payload) =>
  getClient().post("/vms/reports/", payload);

export const importVisitors = (payload) =>
  getClient().post("/vms/import/", payload);

export const fetchVisitorHistoryById = (idNumber) =>
  getClient().get(`/vms/history/${encodeURIComponent(idNumber)}/`);

export const fetchVisitorHistoryByVisit = (visitId) =>
  getClient().get(`/vms/visit-history/${encodeURIComponent(visitId)}/`);

export const fetchBlacklist = () => getClient().get("/vms/blacklist/");

export const addToBlacklist = (payload) =>
  getClient().post("/vms/blacklist/", payload);

export const removeFromBlacklist = (entryId) =>
  getClient().post(`/vms/blacklist/${encodeURIComponent(entryId)}/remove/`);

export const fetchEscorts = () => getClient().get("/vms/escorts/");

export const fetchAvailableEscorts = () =>
  getClient().get("/vms/escorts/available/");

export const assignEscort = (payload) =>
  getClient().post("/vms/escorts/", payload);

export const releaseEscort = (assignmentId) =>
  getClient().post(`/vms/escorts/${encodeURIComponent(assignmentId)}/release/`);

// WF-009: System configuration management (BR-057–066)
export const fetchSystemConfig = () => getClient().get("/vms/config/");

export const updateSystemConfig = (payload) =>
  getClient().post("/vms/config/", payload);

export const fetchConfigHistory = (key) =>
  getClient().get(
    `/vms/config/history/${key ? `?key=${encodeURIComponent(key)}` : ""}`,
  );

// WF-009 sub-flow S1: visiting hours (BR-063)
export const fetchVisitingHours = () => getClient().get("/vms/visiting-hours/");

export const configureVisitingHours = (payload) =>
  getClient().post("/vms/visiting-hours/", payload);

// WF-009 sub-flow S2: access zones (BR-064)
export const fetchAccessZones = () => getClient().get("/vms/zones/");

export const configureAccessZone = (payload) =>
  getClient().post("/vms/zones/", payload);

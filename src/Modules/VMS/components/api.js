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

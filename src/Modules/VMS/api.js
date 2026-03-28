import axios from "axios";
import { host } from "../../routes/globalRoutes";

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

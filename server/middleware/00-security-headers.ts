import { defineEventHandler, setResponseHeaders } from "h3";
import { getSecurityHeaders } from "@/config/securityHeaders";

export default defineEventHandler((event) => {
  setResponseHeaders(event, getSecurityHeaders());
});

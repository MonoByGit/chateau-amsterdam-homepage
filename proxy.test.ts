// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/db/sessions", () => ({
  validateSession: vi.fn(),
}));

import { validateSession } from "@/lib/db/sessions";
import { proxy } from "./proxy";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session-cookie";

function makeRequest(pathname: string, cookieValue?: string) {
  const req = new NextRequest(`https://example.com${pathname}`);
  if (cookieValue) {
    req.cookies.set(SESSION_COOKIE_NAME, cookieValue);
  }
  return req;
}

describe("proxy", () => {
  beforeEach(() => {
    vi.mocked(validateSession).mockReset();
  });

  it("allows /admin/login through without checking a session", async () => {
    const res = await proxy(makeRequest("/admin/login"));
    expect(res.headers.get("location")).toBeNull();
    expect(validateSession).not.toHaveBeenCalled();
  });

  it("redirects to /admin/login when there is no session cookie", async () => {
    const res = await proxy(makeRequest("/admin/content"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://example.com/admin/login");
  });

  it("redirects to /admin/login when the session is invalid or expired", async () => {
    vi.mocked(validateSession).mockResolvedValue(null);
    const res = await proxy(makeRequest("/admin/content", "some-token"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://example.com/admin/login");
  });

  it("allows the request through when the session is valid", async () => {
    vi.mocked(validateSession).mockResolvedValue({ userId: "11111111-1111-1111-1111-111111111111" });
    const res = await proxy(makeRequest("/admin/content", "some-token"));
    expect(res.headers.get("location")).toBeNull();
  });
});

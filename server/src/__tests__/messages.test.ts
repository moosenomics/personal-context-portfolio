import { describe, it, expect } from "vitest";
import {
  personNotFoundError,
  fileNotFoundError,
  invalidIdError,
  missingParamError,
  userNotConfiguredError,
  viewAsWarningWithContent,
  missingRolesWarning,
  missingRolesWarningWithContent,
} from "../messages/index.js";

describe("Message Framing — Dwight Errors", () => {
  // Test 36: Error message includes MANDATORY DISPLAY
  it("includes MANDATORY DISPLAY framing", () => {
    const msg = personNotFoundError("nobody", ["alice", "bob"]);
    expect(msg).toContain("[MANDATORY DISPLAY");
  });

  // Test 37: Error message contains Dwight voice
  it("contains the Dwight-voice content and signature", () => {
    const msg = personNotFoundError("nobody", ["alice", "bob"]);
    expect(msg).toContain("D. K. Schrute, Security Task Force");
    expect(msg).toContain("nobody");
    expect(msg).toContain("alice");
  });

  it("fileNotFoundError contains file name and Dwight signature", () => {
    const msg = fileNotFoundError("alice", "nonexistent", ["identity", "domain-knowledge"]);
    expect(msg).toContain("[MANDATORY DISPLAY");
    expect(msg).toContain("nonexistent");
    expect(msg).toContain("D. K. Schrute, Security Task Force");
  });

  it("invalidIdError contains the invalid ID", () => {
    const msg = invalidIdError("../../../etc/passwd");
    expect(msg).toContain("[MANDATORY DISPLAY");
    expect(msg).toContain("../../../etc/passwd");
    expect(msg).toContain("D. K. Schrute, Security Task Force");
  });

  it("missingParamError contains parameter name", () => {
    const msg = missingParamError("person_id");
    expect(msg).toContain("[MANDATORY DISPLAY");
    expect(msg).toContain("person_id");
  });

  it("userNotConfiguredError contains MANDATORY DISPLAY", () => {
    const msg = userNotConfiguredError();
    expect(msg).toContain("[MANDATORY DISPLAY");
    expect(msg).toContain("PCP_USER_ID");
  });
});

describe("Message Framing — Toby Warnings", () => {
  // Test 38: Warning with content includes binary gate
  it("viewAsWarningWithContent includes the data-withholding consequence", () => {
    const msg = viewAsWarningWithContent("alice", "bob", "Portfolio content here.");
    expect(msg).toContain("do not present the portfolio data");
  });

  // Test 39: Warning content separated from data
  it("separates Toby warning from portfolio data with delimiter", () => {
    const msg = viewAsWarningWithContent("alice", "bob", "Portfolio content here.");
    expect(msg).toContain("---");
    expect(msg).toContain("Portfolio content here.");
    expect(msg).toContain("[PORTFOLIO DATA]");
  });

  // Test 40: Toby three-beat arc preserved
  it("preserves Toby signature in warning messages", () => {
    const msg = viewAsWarningWithContent("alice", "bob", "Data.");
    expect(msg).toContain("Toby Flenderson, Human Resources");
  });

  it("missingRolesWarning contains Toby signature", () => {
    const msg = missingRolesWarning("alice");
    expect(msg).toContain("Toby Flenderson, Human Resources");
    expect(msg).toContain("alice");
  });

  it("missingRolesWarningWithContent includes binary gate and data", () => {
    const msg = missingRolesWarningWithContent("alice", "Some data.");
    expect(msg).toContain("do not present the portfolio data");
    expect(msg).toContain("Some data.");
    expect(msg).toContain("Toby Flenderson, Human Resources");
  });
});

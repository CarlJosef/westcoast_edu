import { describe, it, expect } from "vitest";
import { validateEmail, validateSwedishMobile } from "../validators";

describe("validateEmail", () => {
  it("fails on empty", () => {
    expect(validateEmail("")).toEqual({ ok: false, message: "Email is required." });
  });

  it("fails on invalid format", () => {
    expect(validateEmail("nope")).toEqual({ ok: false, message: "Email is invalid." });
  });

  it("passes on valid email", () => {
    expect(validateEmail("Test@Example.com")).toEqual({ ok: true });
  });
});

describe("validateSwedishMobile", () => {
  it("fails on empty", () => {
    expect(validateSwedishMobile("")).toEqual({ ok: false, message: "Mobile number is required." });
  });

  it("passes on 07-number", () => {
    expect(validateSwedishMobile("0701234567")).toEqual({ ok: true });
  });

  it("passes on +46-number", () => {
    expect(validateSwedishMobile("+46701234567")).toEqual({ ok: true });
  });

  it("fails on wrong prefix", () => {
    expect(validateSwedishMobile("031123456")).toEqual({ ok: false, message: "Mobile number is invalid." });
  });
});

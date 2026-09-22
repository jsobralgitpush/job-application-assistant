import { describe, expect, it, vi } from "vitest";
import { identifyField } from "./autofill";

describe("identifyField", () => {
  it("prioritizes semantic input types", () => {
    vi.stubGlobal("HTMLInputElement", class {});
    const email = Object.assign(Object.create(HTMLInputElement.prototype), {
      type: "email", name: "contact", id: "", labels: null,
      getAttribute: () => "", 
    });
    expect(identifyField(email)).toBe("email");
  });

  it("recognizes LinkedIn from field metadata", () => {
    vi.stubGlobal("HTMLInputElement", class {});
    const field = Object.assign(Object.create(HTMLInputElement.prototype), {
      type: "url", name: "linkedin_url", id: "", labels: null,
      getAttribute: () => "",
    });
    expect(identifyField(field)).toBe("linkedIn");
  });
});

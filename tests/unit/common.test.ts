import { describe, expect, it } from "vitest";
import { createSlug } from "../../src/utils/common";

describe("createSlug", () => {
  it("should convert text to a lowercase slug", () => {
    expect(createSlug("Fresh Floral Perfume")).toBe("fresh-floral-perfume");
  });

  it("should remove leading and trailing whitespace", () => {
    expect(createSlug("    Fresh Floral Perfume    ")).toBe(
      "fresh-floral-perfume",
    );
  });

  it("should replace multiple underscores with a hyphen", () => {
    expect(createSlug("Fresh__Floral")).toBe("fresh-floral");
  });

  it("should collapse multiple hyphens into one", () => {
    expect(createSlug("Fresh---Floral")).toBe("fresh-floral");
  });

  it("should remove special characters", () => {
    expect(createSlug("Rose & Vanilla!")).toBe("rose-vanilla");
  });

  it("should return an empty string for empty input", () => {
    expect(createSlug("")).toBe("");
  });

  it("should return an empty string for punctuation-only input", () => {
    expect(createSlug("!!!")).toBe("");
  });

  it("should remove unsupported accented characters", () => {
    expect(createSlug("Café")).toBe("caf");
  });
});

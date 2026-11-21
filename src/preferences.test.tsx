import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { usePreferences } from "./preferences";

const stored = () => JSON.parse(localStorage.getItem("liquid-preferences")!);
const root = document.documentElement;

function mockSystemDark(matches: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query) =>
      ({
        matches: query.includes("dark") && matches,
        media: query,
        addEventListener() {},
        removeEventListener() {},
      }) as unknown as MediaQueryList,
  );
}

afterEach(() => vi.restoreAllMocks());

describe("usePreferences", () => {
  it("follows the system theme until the user picks one", () => {
    mockSystemDark(true);
    const { result } = renderHook(() => usePreferences());
    expect(result.current.dark).toBe(true);
    expect(root.dataset.theme).toBe("dark");
    expect(stored()).not.toHaveProperty("dark");

    act(() => result.current.setDark(false));
    expect(root.dataset.theme).toBe("clean");
    expect(stored().dark).toBe(false);
  });

  it("restores a stored choice over the system theme", () => {
    mockSystemDark(false);
    localStorage.setItem(
      "liquid-preferences",
      JSON.stringify({ dark: true, palette: "amber" }),
    );
    const { result } = renderHook(() => usePreferences());
    expect(result.current.dark).toBe(true);
    expect(root.dataset.accent).toBe("amber");
  });

  it("ignores invalid or corrupt storage", () => {
    localStorage.setItem("liquid-preferences", "not json");
    const { result } = renderHook(() => usePreferences());
    expect(result.current.palette).toBe("indigo");
    localStorage.setItem(
      "liquid-preferences",
      JSON.stringify({ palette: "<script>" }),
    );
    const second = renderHook(() => usePreferences());
    expect(second.result.current.palette).toBe("indigo");
  });

  it("keeps theme-color in sync with theme and palette", () => {
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.append(meta);
    const { result } = renderHook(() => usePreferences());
    act(() => result.current.setPalette("emerald"));
    expect(meta.content).toBe("#047857");
    act(() => result.current.setDark(true));
    expect(meta.content).toBe("#0c0f15");
    meta.remove();
  });
});

describe("system accessibility preferences", () => {
  it("reports reduced motion and transparency coming from the system", () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query) =>
        ({
          matches: query.includes("reduced"),
          media: query,
          addEventListener() {},
          removeEventListener() {},
        }) as unknown as MediaQueryList,
    );
    const { result } = renderHook(() => usePreferences());
    expect(result.current.motionFromSystem).toBe(true);
    expect(result.current.transparencyFromSystem).toBe(true);
    expect(result.current.reduceMotion).toBe(false);
  });
});

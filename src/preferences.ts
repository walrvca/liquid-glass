import { useEffect, useState } from "react";
export const palettes = [
  { id: "indigo", label: "Indigo", color: "#4f46e5" },
  { id: "cyan", label: "Cyan", color: "#0e7490" },
  { id: "emerald", label: "Emerald", color: "#047857" },
  { id: "amber", label: "Amber", color: "#b45309" },
  { id: "magenta", label: "Magenta", color: "#a21caf" },
] as const;
export type Palette = (typeof palettes)[number]["id"];
const darkBackground = "#0c0f15";
function read() {
  try {
    const value = JSON.parse(
      localStorage.getItem("liquid-preferences") || "{}",
    );
    return value && typeof value === "object" && !Array.isArray(value)
      ? value
      : {};
  } catch {
    return {};
  }
}
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => matchMedia(query).matches);
  useEffect(() => {
    const media = matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);
  return matches;
}
export function usePreferences() {
  const [initial] = useState(read);
  const systemDark = useMediaQuery("(prefers-color-scheme: dark)");
  const motionFromSystem = useMediaQuery("(prefers-reduced-motion: reduce)");
  const transparencyFromSystem = useMediaQuery(
    "(prefers-reduced-transparency: reduce)",
  );
  const [darkChoice, setDarkChoice] = useState<boolean | null>(
    typeof initial.dark === "boolean" ? initial.dark : null,
  );
  const dark = darkChoice ?? systemDark;
  const [palette, setPalette] = useState<Palette>(
    palettes.some((p) => p.id === initial.palette) ? initial.palette : "indigo",
  );
  const [reduceMotion, setReduceMotion] = useState(
    initial.reduceMotion === true,
  );
  const [reduceTransparency, setReduceTransparency] = useState(
    initial.reduceTransparency === true,
  );
  useEffect(() => {
    const r = document.documentElement;
    r.dataset.theme = dark ? "dark" : "clean";
    r.classList.toggle("dark", dark);
    r.dataset.accent = palette;
    r.dataset.motion = reduceMotion ? "reduced" : "system";
    r.dataset.transparency = reduceTransparency ? "reduced" : "system";
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute(
        "content",
        dark ? darkBackground : palettes.find((p) => p.id === palette)!.color,
      );
    try {
      localStorage.setItem(
        "liquid-preferences",
        JSON.stringify({
          ...(darkChoice === null ? {} : { dark: darkChoice }),
          palette,
          reduceMotion,
          reduceTransparency,
        }),
      );
    } catch {
      /* Preferences remain usable when storage is unavailable. */
    }
  }, [dark, darkChoice, palette, reduceMotion, reduceTransparency]);
  return {
    dark,
    setDark: setDarkChoice,
    palette,
    setPalette,
    reduceMotion,
    setReduceMotion,
    motionFromSystem,
    reduceTransparency,
    setReduceTransparency,
    transparencyFromSystem,
  };
}

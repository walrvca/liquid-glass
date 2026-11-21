import { describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "./App";
import { palettes } from "./preferences";

function setup(hash = "") {
  history.replaceState(null, "", "/" + hash);
  const user = userEvent.setup();
  render(<App />);
  return user;
}
const sidebar = () =>
  within(screen.getByRole("complementary", { name: "Main navigation" }));
const breadcrumb = () => document.querySelector(".breadcrumb strong")!;

describe("navigation", () => {
  it("opens the section named in the URL", () => {
    setup("#table");
    expect(sidebar().getByRole("link", { name: "Data table" })).toHaveProperty(
      "ariaCurrent",
      "location",
    );
    expect(breadcrumb().textContent).toBe("Data table");
    expect(location.hash).toBe("#table");
  });

  it("lets the URL hash, not browser scroll restoration, decide the position", () => {
    history.scrollRestoration = "auto";
    setup("#table");
    expect(history.scrollRestoration).toBe("manual");
  });

  it("falls back to the overview on unknown or malformed hashes", () => {
    setup("#%E0%A4%A");
    expect(location.hash).toBe("#overview");
    expect(breadcrumb().textContent).toBe("Overview");
  });

  it("pushes a history entry and updates the breadcrumb on sidebar clicks", async () => {
    const user = setup();
    const before = history.length;
    await user.click(sidebar().getByRole("link", { name: "Forms" }));
    expect(location.hash).toBe("#forms");
    expect(history.length).toBe(before + 1);
    expect(breadcrumb().textContent).toBe("Forms");
  });

  it("leaves modified clicks to the browser", () => {
    setup();
    const link = sidebar().getByRole("link", { name: "Forms" });
    let preventedByApp: boolean | undefined;
    // Runs after React's handler; stops jsdom from following the link.
    const observe = (e: Event) => {
      preventedByApp = e.defaultPrevented;
      e.preventDefault();
    };
    window.addEventListener("click", observe);
    link.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        ctrlKey: true,
      }),
    );
    window.removeEventListener("click", observe);
    expect(preventedByApp).toBe(false);
    expect(location.hash).toBe("#overview");
  });

  it("switches tabs without adding history entries", async () => {
    const user = setup();
    const before = history.length;
    await user.click(screen.getByRole("tab", { name: /Foundations/ }));
    expect(location.hash).toBe("#foundations");
    expect(history.length).toBe(before);
  });

  it("links every tab to an existing panel", async () => {
    const user = setup();
    for (const name of [/Foundations/, /Guidelines/, /Components/]) {
      const tab = screen.getByRole("tab", { name });
      await user.click(tab);
      const panel = document.getElementById(tab.getAttribute("aria-controls")!);
      expect(panel?.getAttribute("role")).toBe("tabpanel");
    }
  });
});

describe("toast", () => {
  it("reports a copy failure when the clipboard is unavailable", async () => {
    const user = setup("#foundations");
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
    });
    await user.click(
      screen.getByRole("button", { name: "Copy token --brand" }),
    );
    const toast = document.querySelector(".toast")!;
    expect(toast.className).toContain("toast-danger");
    expect(toast.textContent).toContain("Copy it manually: --brand");
  });

  it("confirms a successful copy", async () => {
    const user = setup("#foundations");
    await user.click(
      screen.getByRole("button", { name: "Copy token --brand" }),
    );
    expect(await navigator.clipboard.readText()).toBe("--brand");
    expect(document.querySelector(".toast")!.className).toContain(
      "toast-success",
    );
  });

  it("uses the info tone for neutral messages", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(document.querySelector(".toast")!.className).toContain("toast-info");
  });
});

describe("forms", () => {
  it("starts the role select on one of its options", () => {
    setup();
    const role = screen.getByRole("combobox", { name: "Role" });
    expect((role as HTMLSelectElement).value).toBe("Researcher");
  });

  it("leaves the newsletter consent unchecked by default", () => {
    setup();
    expect(
      screen.getByRole("checkbox", { name: "Receive updates" }),
    ).toHaveProperty("ariaChecked", "false");
  });
});

const table = () => within(screen.getByRole("table"));
const rowNames = () =>
  table()
    .getAllByRole("row")
    .slice(1)
    .map((r) => within(r).getAllByRole("cell")[1].textContent);

describe("table", () => {
  it("exposes the sort direction and reverses the order", async () => {
    const user = setup();
    const header = table().getByRole("columnheader", { name: /Project/ });
    expect(header.getAttribute("aria-sort")).toBe("ascending");
    const first = rowNames();
    await user.click(within(header).getByRole("button"));
    expect(header.getAttribute("aria-sort")).toBe("descending");
    expect(rowNames()).toEqual([...first].reverse());
  });

  it("offers bulk actions for the selection and deletes after confirming", async () => {
    const user = setup();
    expect(
      screen.queryByRole("button", { name: /Delete selected/ }),
    ).toBeNull();
    await user.click(
      screen.getByRole("checkbox", {
        name: "Select Knowledge library",
      }),
    );
    await user.click(
      screen.getByRole("checkbox", {
        name: "Select Evidence explorer",
      }),
    );
    expect(screen.getByText("4 projects · 2 selected")).toBeTruthy();
    expect(
      screen.getByRole("checkbox", {
        name: "Select all visible projects",
      }),
    ).toHaveProperty("ariaChecked", "mixed");

    await user.click(screen.getByRole("button", { name: /Delete selected/ }));
    const dialog = within(screen.getByRole("dialog"));
    expect(dialog.getByRole("heading").textContent).toBe("Delete 2 projects?");
    await user.click(dialog.getByRole("button", { name: /Confirm deletion/ }));
    expect(rowNames()).toEqual(["Document assistant", "Research observatory"]);
    expect(screen.getByText("2 projects · 0 selected")).toBeTruthy();
    expect(document.querySelector(".toast")!.textContent).toContain(
      "2 projects removed",
    );
  });

  it("keeps every selection made within the same tick", () => {
    setup();
    act(() => {
      screen
        .getByRole("checkbox", {
          name: "Select Knowledge library",
        })
        .click();
      screen
        .getByRole("checkbox", { name: "Select Evidence explorer" })
        .click();
    });
    expect(screen.getByText("4 projects · 2 selected")).toBeTruthy();
  });

  it("clears the selection when the filter changes and says so", async () => {
    const user = setup();
    await user.click(
      screen.getByRole("checkbox", {
        name: "Select Knowledge library",
      }),
    );
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Filter projects by status" }),
      "Draft",
    );
    expect(screen.getByText("1 project · 0 selected")).toBeTruthy();
    expect(document.querySelector(".toast")!.textContent).toContain(
      "Selection cleared",
    );
    expect(
      screen.queryByRole("button", { name: /Delete selected/ }),
    ).toBeNull();
  });

  it("clears the selection from the bulk bar and keeps focus in the table", async () => {
    const user = setup();
    const selectAll = screen.getByRole("checkbox", {
      name: "Select all visible projects",
    });
    await user.click(selectAll);
    expect(screen.getByText("4 projects · 4 selected")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(screen.getByText("4 projects · 0 selected")).toBeTruthy();
    expect(document.activeElement).toBe(selectAll);
  });

  it("returns focus to the table after a bulk delete", async () => {
    const user = setup();
    await user.click(
      screen.getByRole("checkbox", {
        name: "Select Knowledge library",
      }),
    );
    await user.click(screen.getByRole("button", { name: /Delete selected/ }));
    await user.click(screen.getByRole("button", { name: /Confirm deletion/ }));
    expect(document.activeElement).toBe(
      screen.getByRole("checkbox", {
        name: "Select all visible projects",
      }),
    );
  });

  it("announces only selection changes, not search results", async () => {
    const user = setup();
    const live = document.querySelector("#table [aria-live]")!;
    expect(live.textContent).toBe("0 selected");
    await user.type(
      screen.getByRole("textbox", { name: "Search projects in the table" }),
      "know",
    );
    expect(live.textContent).toBe("0 selected");
    await user.click(
      screen.getByRole("checkbox", {
        name: "Select Knowledge library",
      }),
    );
    expect(live.textContent).toBe("1 selected");
  });
});

describe("chart", () => {
  it("shows every value without hover and highlights the peak by data", () => {
    setup();
    const chart = document.querySelector(".bar-chart")!;
    const labels = [...chart.querySelectorAll(".bar-value")].map(
      (e) => e.textContent,
    );
    expect(labels).toEqual(["35%", "58%", "45%", "76%", "62%", "93%", "72%"]);
    const peak = chart.querySelectorAll(".bar-peak");
    expect(peak.length).toBe(1);
    expect(peak[0].textContent).toBe("93%");
    expect(screen.getByText("vs. previous week")).toBeTruthy();
  });
});

describe("form validation", () => {
  it("validates the preferences form in context and focuses the first error", async () => {
    const user = setup();
    await user.type(screen.getByRole("textbox", { name: /Email/ }), "invalido");
    await user.click(screen.getByRole("button", { name: "Save preferences" }));
    const name = screen.getByRole("textbox", { name: "Full name" });
    expect(name.getAttribute("aria-invalid")).toBe("true");
    expect(document.activeElement).toBe(name);
    const email = screen.getByRole("textbox", { name: /Email/ });
    expect(email.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByText("Enter a valid email address.")).toBeTruthy();

    await user.type(name, "Ana");
    expect(name.getAttribute("aria-invalid")).toBe("false");
    await user.clear(email);
    await user.click(screen.getByRole("button", { name: "Save preferences" }));
    expect(document.querySelector(".toast")!.textContent).toContain("Ana");
  });

  it("validates the create-project dialog the same way", async () => {
    const user = setup();
    await user.click(
      screen.getAllByRole("button", { name: "Create project" })[0],
    );
    const dialog = within(screen.getByRole("dialog"));
    await user.click(dialog.getByRole("button", { name: "Create project" }));
    const input = dialog.getByRole("textbox", { name: "Project name" });
    expect(input.hasAttribute("required")).toBe(false);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(dialog.getByText("Enter a project name.")).toBeTruthy();
    expect(document.activeElement).toBe(input);

    await user.type(input, "New dashboard");
    await user.click(dialog.getByRole("button", { name: "Create project" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(rowNames()).toContain("New dashboard");
  });
});

describe("command palette", () => {
  it("navigates results with the keyboard", async () => {
    const user = setup();
    await user.keyboard("{Control>}k{/Control}");
    const input = screen.getByRole("combobox", { name: "Component name" });
    const options = screen.getAllByRole("option");
    expect(input.getAttribute("aria-activedescendant")).toBe(options[0].id);
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(options[2].getAttribute("aria-selected")).toBe("true");
    await user.keyboard("{ArrowUp}");
    expect(input.getAttribute("aria-activedescendant")).toBe(options[1].id);
    await user.keyboard("{End}");
    expect(options.at(-1)!.getAttribute("aria-selected")).toBe("true");
    await user.keyboard("{Home}{Enter}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(location.hash).toBe("#overview");
  });

  it("filters and opens the first match with Enter", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Search components" }));
    await user.type(screen.getByRole("combobox"), "table{Enter}");
    expect(location.hash).toBe("#table");
  });

  it("keeps the highlighted result in view", async () => {
    const user = setup();
    const scroll = vi.spyOn(Element.prototype, "scrollIntoView");
    await user.keyboard("{Control>}k{/Control}");
    scroll.mockClear();
    await user.keyboard("{End}");
    const last = screen.getAllByRole("option").at(-1)!;
    expect(scroll.mock.contexts).toContain(last);
    scroll.mockRestore();
  });

  it("reports an empty result list", async () => {
    const user = setup();
    await user.keyboard("{Control>}k{/Control}");
    const input = screen.getByRole("combobox");
    expect(input.getAttribute("aria-expanded")).toBe("true");
    await user.type(input, "zzz");
    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(screen.getByRole("status").textContent).toBe("No components found.");
  });

  it("keeps the chosen section when Enter navigates and the page scrolls", async () => {
    const tops: Record<string, number> = {};
    const rect = vi
      .spyOn(Element.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: Element) {
        return { top: tops[this.id] ?? 2000 } as DOMRect;
      });
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 10000,
      configurable: true,
    });
    const scrollTo = async (row: Record<string, number>) => {
      Object.assign(tops, row);
      window.dispatchEvent(new Event("scroll"));
      await new Promise((r) => requestAnimationFrame(r));
    };
    const user = setup();
    await user.keyboard("{Control>}k{/Control}");
    await user.type(screen.getByRole("combobox"), "contr{Enter}");
    // Mid-scroll: the buttons/forms row passes the top first.
    await scrollTo({
      overview: -900,
      buttons: 90,
      forms: 90,
      feedback: 500,
      controls: 500,
    });
    // End of scroll: the target shares its row with "feedback".
    await scrollTo({ buttons: -400, forms: -400, feedback: 92, controls: 92 });
    await scrollTo({ feedback: 91, controls: 91 });
    expect(breadcrumb().textContent).toBe("Controls");
    expect(location.hash).toBe("#controls");
    rect.mockRestore();
  });

  it("shows the shortcut for the current platform", () => {
    setup();
    expect(document.querySelector(".search-trigger kbd")!.textContent).toBe(
      "Ctrl K",
    );
  });
});

describe("mobile navigation", () => {
  it("makes the page inert while open and returns focus on Escape", async () => {
    const user = setup();
    const menu = screen.getByRole("button", { name: "Open navigation" });
    await user.click(menu);
    const shell = document.querySelector(".app-shell")!;
    expect(shell.hasAttribute("inert")).toBe(true);
    expect(document.activeElement?.closest(".sidebar")).not.toBeNull();
    await user.keyboard("{Escape}");
    expect(shell.hasAttribute("inert")).toBe(false);
    expect(document.activeElement).toBe(menu);
  });

  it("closes from the button inside the menu", async () => {
    const user = setup();
    const menu = screen.getByRole("button", { name: "Open navigation" });
    await user.click(menu);
    await user.click(
      sidebar().getByRole("button", { name: "Close navigation" }),
    );
    expect(document.querySelector(".app-shell")!.hasAttribute("inert")).toBe(
      false,
    );
    expect(document.activeElement).toBe(menu);
  });

  it("closes and moves focus to the chosen section", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Open navigation" }));
    await user.click(sidebar().getByRole("link", { name: "Controls" }));
    expect(location.hash).toBe("#controls");
    expect(document.querySelector(".app-shell")!.hasAttribute("inert")).toBe(
      false,
    );
    await waitFor(() =>
      expect(document.activeElement).toBe(document.getElementById("controls")),
    );
  });
});

describe("overview metrics", () => {
  it("counts the components shown in the gallery cards", () => {
    setup();
    const metric = (label: string) =>
      [...document.querySelectorAll(".metric-card")]
        .find((c) => c.querySelector(".metric-label")?.textContent === label)!
        .querySelector("strong")!.textContent;
    const shown = new Set(
      [
        ...document.querySelectorAll(
          "[role=tabpanel][data-state=active] .component-label",
        ),
      ].flatMap((l) => l.textContent!.split(" · ")),
    );
    expect(metric("Components")).toBe(String(shown.size));
    expect(
      screen.getByRole("tab", { name: /Components/ }).textContent,
    ).toContain(String(shown.size));
    expect(metric("Palettes")).toBe(String(palettes.length).padStart(2, "0"));
    expect(metric("Accessibility")).toBe("Target AA");
  });
});

describe("accessibility toggles", () => {
  it("shows system-driven reductions as on and locked", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query) =>
        ({
          matches: query.includes("reduced-motion"),
          media: query,
          addEventListener() {},
          removeEventListener() {},
        }) as unknown as MediaQueryList,
    );
    const user = setup("#guidelines");
    const motion = screen.getByRole("switch", { name: /Reduce motion/ });
    expect(motion.getAttribute("aria-checked")).toBe("true");
    expect(motion.getAttribute("aria-disabled")).toBe("true");
    expect(motion).toHaveProperty("disabled", false);
    expect(motion.tabIndex).toBe(0);
    await user.click(motion);
    expect(motion.getAttribute("aria-checked")).toBe("true");
    expect(screen.getByText("Turned on by the operating system.")).toBeTruthy();
    const transparency = screen.getByRole("switch", {
      name: /Reduce transparency/,
    });
    expect(transparency.hasAttribute("aria-disabled")).toBe(false);
  });
});

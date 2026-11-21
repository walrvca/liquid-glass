import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  DropdownMenu,
  Tabs,
  Tooltip,
  Slider,
  RadioGroup,
  Popover,
} from "radix-ui";
import {
  Activity,
  Bell,
  BookOpen,
  Box,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  CircleCheck,
  Command,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Folder,
  GitBranch,
  Layers,
  LayoutDashboard,
  LoaderCircle,
  Menu,
  MoreHorizontal,
  MousePointer2,
  Palette as PaletteIcon,
  PanelLeftClose,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Moon,
  Trash2,
  TriangleAlert,
  Type,
  X,
  ArrowUp,
  ArrowDown,
  Network,
  CheckCircle2,
  CircleAlert,
  Info,
  Inbox,
} from "lucide-react";
import { Badge, Button, Card, CheckField, Hint, Modal, Toggle } from "./ui";
import { usePreferences, palettes } from "./preferences";
import { CommandPalette } from "./CommandPalette";
import {
  activity,
  componentCount,
  initialRows,
  navigation,
  showcase,
  type DemoRow,
} from "./data";

type ToastTone = "success" | "info" | "danger";
type Toast = { message: string; tone: ToastTone };

const activityPeak = Math.max(...activity.map((d) => d.value));
const shortcutLabel = /Mac|iPhone|iPad/.test(navigator.platform)
  ? "⌘ K"
  : "Ctrl K";
const spyThreshold = 120;
const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;
function sectionFromHash() {
  let id = "";
  try {
    id = decodeURIComponent(location.hash.slice(1));
  } catch {
    /* Malformed hash: fall back to the overview. */
  }
  return navigation.some((n) => n.id === id) ? id : "overview";
}
const opensElsewhere = (e: ReactMouseEvent) =>
  e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
const sectionTab = (id: string) =>
  id === "foundations" || id === "guidelines" ? id : "components";

export function App() {
  const prefs = usePreferences();
  const [active, setActive] = useState(sectionFromHash),
    [tab, setTab] = useState(() => sectionTab(active)),
    [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null),
    [create, setCreate] = useState(false),
    [command, setCommand] = useState(false);
  const [rows, setRows] = useState(initialRows),
    [search, setSearch] = useState(""),
    [status, setStatus] = useState("All"),
    [ascending, setAscending] = useState(true),
    [selected, setSelected] = useState<number[]>([]);
  const [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [role, setRole] = useState("Researcher"),
    [formErrors, setFormErrors] = useState<{ name?: string; email?: string }>(
      {},
    );
  const [notifications, setNotifications] = useState(true),
    [autosave, setAutosave] = useState(false),
    [agreed, setAgreed] = useState(false),
    [density, setDensity] = useState("comfortable"),
    [volume, setVolume] = useState([64]);
  const [loading, setLoading] = useState(false),
    [newName, setNewName] = useState(""),
    [newNameError, setNewNameError] = useState(""),
    [newKind, setNewKind] = useState("Workspace"),
    [pendingDelete, setPendingDelete] = useState<DemoRow[] | null>(null),
    [detail, setDetail] = useState<DemoRow | null>(null);
  const [scrollTarget, setScrollTarget] = useState<{
    id: string;
    focus: boolean;
  } | null>(null);
  const spyLock = useRef<string | null>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  const navWasOpen = useRef(false);
  const focusTableAfterDelete = useRef(false);
  const focusSelectAll = () =>
    document
      .querySelector<HTMLElement>("#table thead [role=checkbox]")
      ?.focus();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = (message: string, tone: ToastTone = "success") => {
    setToast({ message, tone });
  };
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNav(false);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommand((v) => !v);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => {
    if (mobileNav)
      sidebar.current?.querySelector<HTMLElement>(".nav-item")?.focus();
    else if (navWasOpen.current) menuButton.current?.focus();
    navWasOpen.current = mobileNav;
  }, [mobileNav]);
  useEffect(() => {
    const desktop = matchMedia("(min-width: 761px)");
    const close = () => desktop.matches && setMobileNav(false);
    desktop.addEventListener("change", close);
    return () => desktop.removeEventListener("change", close);
  }, []);
  function navigate(id: string, push = true) {
    setMobileNav(false);
    setActive(id);
    setTab(sectionTab(id));
    spyLock.current = id;
    setScrollTarget({ id, focus: push });
    if (push && location.hash !== "#" + id)
      history.pushState(null, "", "#" + id);
  }
  useEffect(() => {
    if (!scrollTarget) return;
    // Next frame: lets dialogs and the mobile nav release scroll lock and focus first.
    const frame = requestAnimationFrame(() => {
      const el = document.getElementById(scrollTarget.id);
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      if (top >= 0 && top <= spyThreshold) spyLock.current = null;
      el.scrollIntoView({
        behavior:
          prefs.reduceMotion || prefs.motionFromSystem ? "instant" : "smooth",
        block: "start",
      });
      if (scrollTarget.focus) {
        if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
        el.focus({ preventScroll: true });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [scrollTarget]);
  useEffect(() => {
    const fromHash = () => navigate(sectionFromHash(), false);
    // The hash is the source of truth for position; browser restoration would fight it on reload.
    history.scrollRestoration = "manual";
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);
  useEffect(() => {
    if (location.hash !== "#" + active)
      history.replaceState(null, "", "#" + active);
  }, [active]);
  useEffect(() => {
    if (tab !== "components") {
      spyLock.current = null;
      return;
    }
    const ids = navigation
      .map((n) => n.id)
      .filter((id) => sectionTab(id) === "components");
    let frame = 0;
    const update = () => {
      frame = 0;
      const sections = ids
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => !!el)
        .map((el) => ({ id: el.id, top: el.getBoundingClientRect().top }));
      const atBottom =
        innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
      if (spyLock.current) {
        const target = sections.find((x) => x.id === spyLock.current);
        if (
          !target ||
          atBottom ||
          (target.top >= 0 && target.top <= spyThreshold)
        )
          spyLock.current = null;
        return;
      }
      if (atBottom) {
        const visible = sections
          .filter((x) => x.top < innerHeight)
          .map((x) => x.id);
        if (visible.length)
          setActive((current) =>
            visible.includes(current) ? current : visible[visible.length - 1],
          );
        return;
      }
      const passed = sections.filter((x) => x.top <= spyThreshold);
      if (!passed.length) return setActive(ids[0]);
      const rowTop = Math.max(...passed.map((x) => x.top));
      const row = passed
        .filter((x) => Math.abs(x.top - rowTop) < 2)
        .map((x) => x.id);
      setActive((current) => (row.includes(current) ? current : row[0]));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const release = () => {
      spyLock.current = null;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const releaseEvents = [
      "wheel",
      "touchstart",
      "pointerdown",
      "keydown",
      "scrollend",
    ];
    // Capture phase: runs before handlers that navigate on the same event (Enter in search).
    releaseEvents.forEach((type) =>
      window.addEventListener(type, release, { passive: true, capture: true }),
    );
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      releaseEvents.forEach((type) =>
        window.removeEventListener(type, release, { capture: true }),
      );
      cancelAnimationFrame(frame);
    };
  }, [tab]);
  function clearSelectionForFilter() {
    if (!selected.length) return;
    setSelected([]);
    notify("Selection cleared because the filter changed.", "info");
  }
  function copy(value: string) {
    const failed = () =>
      notify(`Could not copy. Copy it manually: ${value}`, "danger");
    if (!navigator.clipboard) return failed();
    navigator.clipboard
      .writeText(value)
      .then(() => notify("Token copied to the clipboard."))
      .catch(failed);
  }
  function download() {
    const csv =
      "Name,Type,Status\n" +
      rows
        .map((r) =>
          [r.name, r.kind, r.status]
            .map(
              (v) =>
                '"' +
                (/^[\s]*[=+\-@]/.test(v) ? "'" + v : v).replaceAll('"', '""') +
                '"',
            )
            .join(","),
        )
        .join("\n");
    const url = URL.createObjectURL(
      new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "liquid-glass-demo.csv";
    a.click();
    URL.revokeObjectURL(url);
    notify("Demo data exported.");
  }
  const visible = rows
    .filter(
      (r) =>
        r.name
          .toLocaleLowerCase("en")
          .includes(search.toLocaleLowerCase("en")) &&
        (status === "All" || r.status === status),
    )
    .sort((a, b) => (ascending ? 1 : -1) * a.name.localeCompare(b.name, "en"));
  const NavIcon = ({ id }: { id: string }) =>
    id === "overview" ? (
      <LayoutDashboard />
    ) : id === "foundations" ? (
      <Layers />
    ) : id === "buttons" ? (
      <MousePointer2 />
    ) : id === "forms" ? (
      <FileText />
    ) : id === "feedback" ? (
      <Bell />
    ) : id === "controls" ? (
      <SlidersHorizontal />
    ) : id === "table" ? (
      <Box />
    ) : id === "visualization" ? (
      <Activity />
    ) : (
      <BookOpen />
    );
  return (
    <Tooltip.Provider delayDuration={250}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {mobileNav && (
        <button
          className="nav-backdrop"
          tabIndex={-1}
          onClick={() => setMobileNav(false)}
          aria-label="Close navigation"
        />
      )}
      <aside
        ref={sidebar}
        id="main-navigation"
        className={`sidebar ${mobileNav ? "mobile-open" : ""}`}
        aria-label="Main navigation"
      >
        <a
          href="#overview"
          className="brand"
          onClick={(e) => {
            if (opensElsewhere(e)) return;
            e.preventDefault();
            navigate("overview");
          }}
        >
          <span className="brand-mark">
            <Layers size={21} />
          </span>
          <span>
            Liquid Glass<small>DESIGN SYSTEM</small>
          </span>
          <span className="brand-version">0.1</span>
        </a>
        <Button
          variant="ghost"
          size="icon"
          className="sidebar-close"
          aria-label="Close navigation"
          onClick={() => setMobileNav(false)}
        >
          <X size={18} />
        </Button>
        <div className="sidebar-nav">
          {navigation.map((n) => (
            <div key={n.id}>
              {n.group && <div className="nav-group">{n.group}</div>}
              <a
                href={`#${n.id}`}
                className={`nav-item ${active === n.id ? "active" : ""}`}
                onClick={(e) => {
                  if (opensElsewhere(e)) return;
                  e.preventDefault();
                  navigate(n.id);
                }}
                aria-current={active === n.id ? "location" : undefined}
              >
                <NavIcon id={n.id} />
                <span>{n.label}</span>
                {n.id === "overview" && <span className="nav-dot" />}
              </a>
            </div>
          ))}
        </div>
        <div className="sidebar-bottom">
          <div className="system-note">
            <ShieldCheck size={17} />
            <span>
              Clarity by principle.
              <br />
              <strong>Consistency by design.</strong>
            </span>
          </div>
          <div className="sidebar-footer">
            <span className="avatar">W</span>
            <div>
              <strong>wrvca</strong>
              <span>Personal workspace</span>
            </div>
            <Hint label="View repository">
              <Button asChild variant="ghost" size="icon">
                <a
                  href="https://github.com/walrvca/liquid-glass"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open repository on GitHub"
                >
                  <GitBranch size={17} />
                </a>
              </Button>
            </Hint>
          </div>
        </div>
      </aside>
      <div className="app-shell" inert={mobileNav}>
        <header className="topbar">
          <Button
            variant="ghost"
            size="icon"
            ref={menuButton}
            className="mobile-menu"
            aria-label="Open navigation"
            aria-expanded={mobileNav}
            aria-controls="main-navigation"
            onClick={() => setMobileNav(!mobileNav)}
          >
            <Menu size={20} />
          </Button>
          <div className="breadcrumb">
            <span>Design system</span>
            <ChevronRight size={13} />
            <strong>
              {navigation.find((n) => n.id === active)?.label ?? "Overview"}
            </strong>
          </div>
          <button
            className="search-trigger"
            aria-label="Search components"
            onClick={() => setCommand(true)}
          >
            <Search size={15} />
            <span>Search components...</span>
            <kbd>{shortcutLabel}</kbd>
          </button>
          <div className="topbar-actions">
            <Hint
              label={
                prefs.dark ? "Switch to light theme" : "Switch to dark theme"
              }
            >
              <Button
                variant="ghost"
                size="icon"
                aria-label={
                  prefs.dark ? "Switch to light theme" : "Switch to dark theme"
                }
                onClick={() => prefs.setDark(!prefs.dark)}
              >
                {prefs.dark ? <Sun size={18} /> : <Moon size={18} />}
              </Button>
            </Hint>
            <Popover.Root>
              <Popover.Trigger asChild>
                <Button variant="ghost" size="icon" aria-label="Notifications">
                  <Bell size={18} />
                </Button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  className="popover"
                  align="end"
                  sideOffset={12}
                >
                  <h3>You are all caught up</h3>
                  <p>This is a demo of the notifications panel.</p>
                  <Badge tone="success">No new notifications</Badge>
                  <Popover.Arrow className="popover-arrow" />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
            <span className="topbar-divider" />
            <span className="avatar avatar-small">W</span>
          </div>
        </header>
        <main id="main" className="main" tabIndex={-1}>
          <section className="page-intro" id="overview">
            <div className="eyebrow">
              <span className="eyebrow-line" />
              LIQUID GLASS TECHNICAL
            </div>
            <div className="intro-line">
              <div>
                <h1>
                  Consistency in every detail<span>.</span>
                </h1>
                <p>
                  A visual language for your next ideas. Explore, interact, and
                  customize.
                </p>
              </div>
              <Button variant="outline" asChild className="repo-button">
                <a
                  href="https://github.com/walrvca/liquid-glass"
                  target="_blank"
                  rel="noreferrer"
                >
                  <GitBranch size={16} />
                  Repository
                  <ExternalLink size={13} />
                </a>
              </Button>
            </div>
          </section>
          <Tabs.Root
            value={tab}
            onValueChange={(v) => {
              const id = v === "components" ? "overview" : v;
              setTab(v);
              setActive(id);
            }}
          >
            <div className="tab-row">
              <Tabs.List className="tabs" aria-label="Demo sections">
                <Tabs.Trigger value="components">
                  <Box size={15} />
                  Components<span className="count">{componentCount}</span>
                </Tabs.Trigger>
                <Tabs.Trigger value="foundations">
                  <Layers size={15} />
                  Foundations
                </Tabs.Trigger>
                <Tabs.Trigger value="guidelines">
                  <BookOpen size={15} />
                  Guidelines
                </Tabs.Trigger>
              </Tabs.List>
              <span className="demo-tag">
                <span />
                INTERACTIVE DEMO
              </span>
            </div>
            <div className="appearance-bar">
              <div className="appearance-title">
                <PaletteIcon size={18} />
                <div>
                  <strong>Your identity, your tone</strong>
                  <span>One palette per project.</span>
                </div>
              </div>
              <div
                className="palette-options"
                role="group"
                aria-label="Identity palette"
              >
                {palettes.map((p) => (
                  <Hint key={p.id} label={p.label}>
                    <button
                      className={`palette-option ${prefs.palette === p.id ? "selected" : ""}`}
                      aria-label={`Use the ${p.label} palette`}
                      aria-pressed={prefs.palette === p.id}
                      onClick={() => prefs.setPalette(p.id)}
                    >
                      <span style={{ background: p.color }}>
                        {prefs.palette === p.id && <Check size={12} />}
                      </span>
                      <span className="palette-name">{p.label}</span>
                    </button>
                  </Hint>
                ))}
              </div>
              <div className="theme-toggle" role="group" aria-label="Theme">
                <button
                  aria-label="Light theme"
                  aria-pressed={!prefs.dark}
                  className={!prefs.dark ? "selected" : ""}
                  onClick={() => prefs.setDark(false)}
                >
                  <Sun size={15} />
                  <span>Light</span>
                </button>
                <button
                  aria-label="Dark theme"
                  aria-pressed={prefs.dark}
                  className={prefs.dark ? "selected" : ""}
                  onClick={() => prefs.setDark(true)}
                >
                  <Moon size={15} />
                  <span>Dark</span>
                </button>
              </div>
            </div>
            <Tabs.Content value="components" className="tab-content">
              <div className="section-caption">
                <span>COMPONENT OVERVIEW</span>
                <span>Solid surfaces. Clear interactions.</span>
              </div>
              <div className="metrics-grid">
                {[
                  {
                    label: "Components",
                    value: String(componentCount),
                    note: "Ready to explore",
                    icon: <Box />,
                  },
                  {
                    label: "Palettes",
                    value: String(palettes.length).padStart(2, "0"),
                    note: "One identity per project",
                    icon: <PaletteIcon />,
                  },
                  {
                    label: "Themes",
                    value: "02",
                    note: "Clean and Graphite",
                    icon: <Sun />,
                  },
                  {
                    label: "Accessibility",
                    value: "Target AA",
                    note: "WCAG 2.2, not audited",
                    icon: <ShieldCheck />,
                  },
                ].map((m) => (
                  <div className="metric-card" key={m.label}>
                    <div>
                      <span className="metric-label">{m.label}</span>
                      <span className="metric-icon">{m.icon}</span>
                    </div>
                    <strong>{m.value}</strong>
                    <span className="metric-note">{m.note}</span>
                  </div>
                ))}
              </div>
              <div className="component-grid">
                <Card
                  title="Intent in every action"
                  label={showcase.buttons.join(" · ")}
                  id="buttons"
                >
                  <p className="card-description">
                    Visual hierarchy that makes the next step obvious.
                  </p>
                  <div className="button-showcase">
                    <div className="button-line">
                      <Button onClick={() => setCreate(true)}>
                        <Plus size={16} />
                        Create project
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => notify("Demo changes saved.")}
                      >
                        <Check size={16} />
                        Save changes
                      </Button>
                    </div>
                    <div className="button-line">
                      <Button variant="outline" onClick={download}>
                        <Download size={16} />
                        Export data
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => notify("No pending changes.", "info")}
                      >
                        Cancel
                      </Button>
                      <Hint label="Appearance settings">
                        <Button
                          size="icon"
                          variant="outline"
                          aria-label="Go to appearance controls"
                          onClick={() => navigate("controls")}
                        >
                          <Settings2 size={17} />
                        </Button>
                      </Hint>
                    </div>
                    <div className="showcase-divider" />
                    <div className="button-line">
                      <Button disabled>Unavailable</Button>
                      <Button
                        variant="outline"
                        disabled={loading}
                        onClick={() => {
                          setLoading(true);
                          timer.current = setTimeout(() => {
                            setLoading(false);
                            notify("Demo sync complete.");
                          }, 1400);
                        }}
                      >
                        <LoaderCircle
                          size={16}
                          className={loading ? "spin" : ""}
                        />
                        {loading ? "Syncing..." : "Sync"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setPendingDelete([
                            {
                              id: -1,
                              name: "Sample project",
                              kind: "Project",
                              status: "Draft",
                              date: "",
                            },
                          ])
                        }
                      >
                        <Trash2 size={14} />
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="component-footnote">
                    <MousePointer2 size={14} />
                    Try the hover, focus, and loading states.
                  </div>
                </Card>
                <Card
                  title="Input, well received"
                  label={showcase.forms.join(" · ")}
                  id="forms"
                >
                  <p className="card-description">
                    Explicit labels. Validation in context.
                  </p>
                  <form
                    className="demo-form"
                    noValidate
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const emailInput = form.elements.namedItem(
                        "email",
                      ) as HTMLInputElement;
                      const errors = {
                        name: name.trim()
                          ? undefined
                          : "Enter your name to continue.",
                        email: emailInput.validity.typeMismatch
                          ? "Enter a valid email address."
                          : undefined,
                      };
                      setFormErrors(errors);
                      const firstInvalid = errors.name
                        ? "name"
                        : errors.email
                          ? "email"
                          : null;
                      if (firstInvalid) {
                        (
                          form.elements.namedItem(firstInvalid) as HTMLElement
                        ).focus();
                        return;
                      }
                      notify(
                        `Preferences for ${name.trim()} saved in this demo.`,
                      );
                    }}
                  >
                    <div className="form-row">
                      <div className="field">
                        <label htmlFor="name">Full name</label>
                        <input
                          id="name"
                          placeholder="What should we call you?"
                          value={name}
                          name="name"
                          onChange={(e) => {
                            setName(e.target.value);
                            setFormErrors({ ...formErrors, name: undefined });
                          }}
                          aria-invalid={!!formErrors.name}
                          aria-describedby={
                            formErrors.name ? "name-error" : undefined
                          }
                        />
                        {formErrors.name && (
                          <span id="name-error" className="error-text">
                            {formErrors.name}
                          </span>
                        )}
                      </div>
                      <div className="field">
                        <label htmlFor="role">Role</label>
                        <div className="select-wrap">
                          <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                          >
                            <option>Researcher</option>
                            <option>Developer</option>
                            <option>Designer</option>
                          </select>
                          <ChevronDown size={14} />
                        </div>
                      </div>
                    </div>
                    <div className="field">
                      <label htmlFor="email">
                        Email <span className="optional">optional</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setFormErrors({ ...formErrors, email: undefined });
                        }}
                        aria-invalid={!!formErrors.email}
                        aria-describedby={
                          formErrors.email
                            ? "email-error email-hint"
                            : "email-hint"
                        }
                      />
                      {formErrors.email && (
                        <span id="email-error" className="error-text">
                          {formErrors.email}
                        </span>
                      )}
                      <span className="field-hint" id="email-hint">
                        The data in this form is not sent to a server.
                      </span>
                    </div>
                    <div className="form-bottom">
                      <CheckField
                        checked={agreed}
                        onCheckedChange={setAgreed}
                        label="Receive updates"
                      />
                      <Button type="submit" size="sm">
                        Save preferences
                      </Button>
                    </div>
                  </form>
                </Card>
                <Card
                  title="The right state, in the right context"
                  label={showcase.feedback.join(" · ")}
                  id="feedback"
                >
                  <div className="badge-showcase">
                    <Badge tone="brand">In progress</Badge>
                    <Badge tone="success">Done</Badge>
                    <Badge tone="warning">In review</Badge>
                    <Badge tone="danger">Failed</Badge>
                    <Badge>Draft</Badge>
                  </div>
                  <div className="alert alert-info">
                    <CircleHelp size={18} />
                    <div>
                      <strong>Transparency with purpose</strong>
                      <p>
                        Glass organizes the layers. Data keeps a solid base.
                      </p>
                    </div>
                  </div>
                  <div className="alert alert-success">
                    <CircleCheck size={18} />
                    <div>
                      <strong>All set to continue</strong>
                      <p>A clear message confirms the result of the action.</p>
                    </div>
                  </div>
                  <div className="feedback-bottom">
                    <span>Short messages that do not interrupt the flow.</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        notify("Done! Your action completed successfully.")
                      }
                    >
                      <Bell size={14} />
                      Test toast
                    </Button>
                  </div>
                </Card>
                <Card
                  title="Control without complexity"
                  label={showcase.controls.join(" · ")}
                  id="controls"
                >
                  <Toggle
                    id="notifications"
                    label="Notifications"
                    description="Get activity updates."
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                  <Toggle
                    id="autosave"
                    label="Autosave"
                    description="Keep your work up to date."
                    checked={autosave}
                    onCheckedChange={setAutosave}
                  />
                  <div className="showcase-divider" />
                  <div className="control-section">
                    <span className="control-label" id="density-label">
                      Interface density
                    </span>
                    <RadioGroup.Root
                      className="radio-group"
                      aria-labelledby="density-label"
                      value={density}
                      onValueChange={setDensity}
                    >
                      {[
                        { id: "comfortable", label: "Comfortable" },
                        { id: "compact", label: "Compact" },
                      ].map((v) => (
                        <label key={v.id}>
                          <RadioGroup.Item className="radio" value={v.id}>
                            <RadioGroup.Indicator className="radio-indicator" />
                          </RadioGroup.Item>
                          {v.label}
                        </label>
                      ))}
                    </RadioGroup.Root>
                  </div>
                  <div className="slider-label">
                    <label id="level-label">Sample intensity</label>
                    <span>{volume[0]}%</span>
                  </div>
                  <Slider.Root
                    className="slider"
                    value={volume}
                    onValueChange={setVolume}
                    max={100}
                    step={1}
                    aria-labelledby="level-label"
                  >
                    <Slider.Track className="slider-track">
                      <Slider.Range className="slider-range" />
                    </Slider.Track>
                    <Slider.Thumb
                      className="slider-thumb"
                      aria-label="Sample intensity"
                    />
                  </Slider.Root>
                  <div
                    className="density-preview"
                    style={{
                      padding: density === "compact" ? 8 : 14,
                      opacity: 0.4 + volume[0] / 170,
                    }}
                  >
                    <span />
                    <span />
                    <span />
                  </div>
                </Card>
                <Card
                  title="Data with room to breathe"
                  label={showcase.table.join(" · ")}
                  id="table"
                  className="full-width"
                >
                  <div className="table-toolbar">
                    <div className="table-search">
                      <Search size={16} />
                      <input
                        aria-label="Search projects in the table"
                        placeholder="Search projects..."
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          clearSelectionForFilter();
                        }}
                      />
                    </div>
                    <div className="table-actions">
                      <div className="select-wrap filter-select">
                        <select
                          aria-label="Filter projects by status"
                          value={status}
                          onChange={(e) => {
                            setStatus(e.target.value);
                            clearSelectionForFilter();
                          }}
                        >
                          <option>All</option>
                          <option>Published</option>
                          <option>In review</option>
                          <option>Draft</option>
                        </select>
                        <ChevronDown size={14} />
                      </div>
                      <Button size="sm" onClick={() => setCreate(true)}>
                        <Plus size={15} />
                        New project
                      </Button>
                    </div>
                  </div>
                  {selected.length > 0 && (
                    <div className="bulk-bar">
                      <span>{selected.length} selected</span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setPendingDelete(
                            rows.filter((r) => selected.includes(r.id)),
                          )
                        }
                      >
                        <Trash2 size={14} />
                        Delete selected
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelected([]);
                          focusSelectAll();
                        }}
                      >
                        Clear selection
                      </Button>
                    </div>
                  )}
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th className="check-cell">
                            <CheckField
                              checked={
                                visible.length > 0 &&
                                visible.every((r) => selected.includes(r.id))
                                  ? true
                                  : selected.length > 0
                                    ? "indeterminate"
                                    : false
                              }
                              onCheckedChange={(checked) =>
                                setSelected(
                                  checked ? visible.map((r) => r.id) : [],
                                )
                              }
                              label="Select all visible projects"
                            />
                          </th>
                          <th
                            aria-sort={ascending ? "ascending" : "descending"}
                          >
                            <button
                              className="sort-button"
                              onClick={() => setAscending(!ascending)}
                            >
                              Project
                              {ascending ? (
                                <ArrowUp size={13} />
                              ) : (
                                <ArrowDown size={13} />
                              )}
                            </button>
                          </th>
                          <th>Type</th>
                          <th>Status</th>
                          <th>Updated</th>
                          <th>
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {visible.map((r) => (
                          <tr
                            key={r.id}
                            data-selected={selected.includes(r.id)}
                          >
                            <td className="check-cell">
                              <CheckField
                                checked={selected.includes(r.id)}
                                onCheckedChange={(v) =>
                                  setSelected((current) =>
                                    v
                                      ? [...current, r.id]
                                      : current.filter((x) => x !== r.id),
                                  )
                                }
                                label={`Select ${r.name}`}
                              />
                            </td>
                            <td>
                              <button
                                className="project-name"
                                onClick={() => setDetail(r)}
                              >
                                <span className="project-icon">
                                  <Folder size={16} />
                                </span>
                                {r.name}
                              </button>
                            </td>
                            <td className="muted">{r.kind}</td>
                            <td>
                              <Badge
                                tone={
                                  r.status === "Published"
                                    ? "success"
                                    : r.status === "In review"
                                      ? "warning"
                                      : "neutral"
                                }
                              >
                                {r.status}
                              </Badge>
                            </td>
                            <td className="table-date">{r.date}</td>
                            <td>
                              <DropdownMenu.Root>
                                <DropdownMenu.Trigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label={`Actions for ${r.name}`}
                                  >
                                    <MoreHorizontal size={18} />
                                  </Button>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Portal>
                                  <DropdownMenu.Content
                                    className="dropdown"
                                    align="end"
                                    sideOffset={6}
                                  >
                                    <DropdownMenu.Item
                                      onSelect={() => setDetail(r)}
                                    >
                                      <FileText size={15} />
                                      View details
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item
                                      onSelect={() => {
                                        const item = {
                                          ...r,
                                          id: Date.now(),
                                          name: r.name + " (copy)",
                                          status: "Draft" as const,
                                        };
                                        setRows([...rows, item]);
                                        notify(
                                          "Project duplicated in the demo.",
                                        );
                                      }}
                                    >
                                      <Copy size={15} />
                                      Duplicate
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Separator />
                                    <DropdownMenu.Item
                                      className="danger-item"
                                      onSelect={() => setPendingDelete([r])}
                                    >
                                      <Trash2 size={15} />
                                      Delete
                                    </DropdownMenu.Item>
                                  </DropdownMenu.Content>
                                </DropdownMenu.Portal>
                              </DropdownMenu.Root>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!visible.length && (
                      <div className="table-empty">
                        <Search size={24} />
                        <strong>No projects found</strong>
                        <span>Try another name or status.</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearch("");
                            setStatus("All");
                            clearSelectionForFilter();
                          }}
                        >
                          Clear filters
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="table-footer">
                    <span>
                      {plural(visible.length, "project", "projects")} ·{" "}
                      {selected.length} selected
                    </span>
                    <span className="sr-only" aria-live="polite">
                      {selected.length} selected
                    </span>
                    <span>
                      <span className="demo-data-label">DEMO DATA</span>
                    </span>
                  </div>
                </Card>
                <Card
                  title="One reading, many perspectives"
                  label={showcase.visualization.join(" · ")}
                  id="visualization"
                >
                  <div className="chart-header">
                    <div>
                      <span className="muted">Demo activity</span>
                      <strong>
                        2,480<span>events</span>
                      </strong>
                    </div>
                    <div className="chart-trend">
                      <Badge tone="success">+12.8%</Badge>
                      <span>vs. previous week</span>
                    </div>
                  </div>
                  <div
                    className="bar-chart"
                    role="img"
                    aria-label={`Demo activity from Monday to Sunday: ${activity.map((d) => d.value).join(", ")} percent.`}
                  >
                    {activity.map((d) => (
                      <div className="bar-column" key={d.day}>
                        <div className="bar-track">
                          <div
                            className={`bar-fill ${d.value === activityPeak ? "bar-peak" : ""}`}
                            style={{ height: d.value + "%" }}
                          >
                            <span className="bar-value">{d.value}%</span>
                          </div>
                        </div>
                        <span>{d.day}</span>
                      </div>
                    ))}
                  </div>
                  <div className="progress-label">
                    <span>Weekly goal</span>
                    <strong>72%</strong>
                  </div>
                  <progress
                    className="progress"
                    max={100}
                    value={72}
                    aria-label="Weekly goal: 72 percent"
                  />
                </Card>
                <Card
                  title="Room for what comes next"
                  label={showcase.empty.join(" · ")}
                >
                  <div className="empty-state">
                    <div className="empty-icon">
                      <Inbox size={26} />
                    </div>
                    <h3>Your ideas start here</h3>
                    <p>
                      Create a project to organize information
                      <br />
                      and turn possibilities into work.
                    </p>
                    <Button size="sm" onClick={() => setCreate(true)}>
                      <Plus size={15} />
                      Create your first project
                    </Button>
                  </div>
                  <div
                    className="skeleton-example"
                    aria-label="Loading example"
                  >
                    <span className="skeleton square" />
                    <div>
                      <span className="skeleton" />
                      <span className="skeleton short" />
                    </div>
                    <Badge>Loading</Badge>
                  </div>
                </Card>
              </div>
            </Tabs.Content>
            <Tabs.Content value="foundations" className="tab-content">
              <div className="section-caption" id="foundations">
                <span>OS FUNDAMENTOS DA IDENTIDADE</span>
                <span>Shared tokens. Consistent expression.</span>
              </div>
              <div className="component-grid">
                <Card
                  title="One palette, different roles"
                  label="Color tokens"
                  className="full-width"
                >
                  <div className="token-grid">
                    {[
                      "--brand",
                      "--brand-soft",
                      "--background",
                      "--surface",
                      "--foreground",
                      "--muted-foreground",
                      "--success",
                      "--warning",
                      "--danger",
                      "--border",
                      "--border-strong",
                    ].map((token) => (
                      <button
                        className="token-card"
                        key={token}
                        onClick={() => copy(token)}
                        aria-label={`Copy token ${token}`}
                      >
                        <span
                          className="token-swatch"
                          style={{ background: `var(${token})` }}
                        />
                        <code>{token}</code>
                        <Copy size={13} />
                      </button>
                    ))}
                  </div>
                  <p className="field-hint">
                    Click a token to copy its name. Colors follow the selected
                    theme and palette.
                  </p>
                </Card>
                <Card title="Typography with a purpose" label="Typography">
                  <div className="type-sample heading-sample">
                    Aa Bb Cc<span>Space Grotesk · headings</span>
                  </div>
                  <div className="type-sample body-sample">
                    Clarity in every read.
                    <span>Inter · body and interface</span>
                  </div>
                  <div className="type-sample mono-sample">
                    const clarity = true;
                    <span>JetBrains Mono · code and data</span>
                  </div>
                </Card>
                <Card title="Rhythm and geometry" label="Spacing · Radius">
                  <p className="card-description">
                    A predictable spacing scale and subtle corners.
                  </p>
                  <div className="spacing-samples">
                    {[4, 8, 12, 16, 24, 32].map((v) => (
                      <div key={v}>
                        <span style={{ width: v * 2, height: v * 2 }} />
                        <code>{v}px</code>
                      </div>
                    ))}
                  </div>
                  <div className="geometry-example">
                    <div />
                    2px base radius. Thin borders. Restrained hierarchy.
                  </div>
                </Card>
                <Card
                  title="Consistent iconography"
                  label="Lucide"
                  className="full-width"
                >
                  <div className="icon-gallery">
                    {[
                      Layers,
                      LayoutDashboard,
                      Folder,
                      FileText,
                      Network,
                      Search,
                      Settings2,
                      ShieldCheck,
                      Activity,
                      BookOpen,
                      Inbox,
                      Command,
                    ].map((Icon, i) => (
                      <div key={i}>
                        <Icon size={24} />
                      </div>
                    ))}
                  </div>
                  <p className="field-hint">
                    Uniform stroke, contextual color, and accessible labels on
                    controls.
                  </p>
                </Card>
              </div>
            </Tabs.Content>
            <Tabs.Content value="guidelines" className="tab-content">
              <div className="section-caption" id="guidelines">
                <span>DECISÕES QUE SUSTENTAM O SISTEMA</span>
                <span>Aesthetics with responsibility.</span>
              </div>
              <div className="component-grid">
                <Card
                  title="Glass at the edges, solid at the core"
                  label="Material"
                >
                  <div className="material-comparison">
                    <div className="solid-sample">
                      <FileText size={23} />
                      <strong>Data surface</strong>
                      <span>Opaque, stable, and readable.</span>
                    </div>
                    <div className="glass-sample">
                      <Layers size={23} />
                      <strong>Peripheral layer</strong>
                      <span>Transparency with purpose.</span>
                    </div>
                  </div>
                  <p className="field-hint">
                    Tables, charts, and forms use solid surfaces. Glass stays in
                    navigation and floating layers.
                  </p>
                </Card>
                <Card title="The interface adapts to you" label="Accessibility">
                  <Toggle
                    id="reduce-motion"
                    label="Reduce motion"
                    description={
                      prefs.motionFromSystem
                        ? "Turned on by the operating system."
                        : "Minimizes transitions and animations."
                    }
                    checked={prefs.reduceMotion || prefs.motionFromSystem}
                    locked={prefs.motionFromSystem}
                    onCheckedChange={prefs.setReduceMotion}
                  />
                  <Toggle
                    id="reduce-transparency"
                    label="Reduce transparency"
                    description={
                      prefs.transparencyFromSystem
                        ? "Turned on by the operating system."
                        : "Uses opaque surfaces for layers."
                    }
                    checked={
                      prefs.reduceTransparency || prefs.transparencyFromSystem
                    }
                    locked={prefs.transparencyFromSystem}
                    onCheckedChange={prefs.setReduceTransparency}
                  />
                  <div className="alert alert-info">
                    <ShieldCheck size={18} />
                    <div>
                      <strong>Accessibility as a criterion</strong>
                      <p>
                        Navigate with Tab. Press Enter to activate controls and
                        Esc to close dialogs.
                      </p>
                    </div>
                  </div>
                  <p className="field-hint">
                    Target: WCAG 2.2 AA. This demo is not a conformance
                    certification.
                  </p>
                </Card>
                <Card
                  title="Well-defined responsibilities"
                  label="Architecture"
                  className="full-width"
                >
                  <div className="principle-grid">
                    {[
                      {
                        n: "Tokens",
                        t: "Identity independent of the framework.",
                      },
                      {
                        n: "Components",
                        t: "Presentation and accessible interaction.",
                      },
                      {
                        n: "Application",
                        t: "Features and flow coordination.",
                      },
                      { n: "Backend", t: "Data, secrets, and authorization." },
                    ].map((p) => (
                      <div key={p.n}>
                        <h3>{p.n}</h3>
                        <p>{p.t}</p>
                      </div>
                    ))}
                  </div>
                  <div className="alert alert-warning">
                    <TriangleAlert size={18} />
                    <div>
                      <strong>Demo without a backend</strong>
                      <p>
                        Projects and forms use temporary data. Only appearance
                        settings are kept in this browser.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </Tabs.Content>
          </Tabs.Root>
          <footer className="page-footer">
            <span>
              <Layers size={14} />
              Liquid Glass<span className="footer-separator">/</span>Design with
              purpose.
            </span>
            <span>Version 0.1 · Component demo</span>
          </footer>
        </main>
      </div>
      <Modal
        open={create}
        onOpenChange={(open) => {
          setCreate(open);
          if (!open) setNewNameError("");
        }}
        title="Create project"
        description="Try the form. The project is only added to this demo's table."
      >
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (!newName.trim()) {
              setNewNameError("Enter a project name.");
              (
                e.currentTarget.elements.namedItem("new-name") as HTMLElement
              ).focus();
              return;
            }
            setRows([
              ...rows,
              {
                id: Date.now(),
                name: newName.trim(),
                kind: newKind,
                status: "Draft",
                date: "Now",
              },
            ]);
            setNewName("");
            setCreate(false);
            notify("Project created in the demo.");
          }}
          className="modal-form"
        >
          <div className="field">
            <label htmlFor="new-name">Project name</label>
            <input
              autoFocus
              maxLength={100}
              id="new-name"
              name="new-name"
              placeholder="My next idea"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setNewNameError("");
              }}
              aria-invalid={!!newNameError}
              aria-describedby={newNameError ? "new-name-error" : undefined}
            />
            {newNameError && (
              <span id="new-name-error" className="error-text">
                {newNameError}
              </span>
            )}
          </div>
          <div className="field">
            <label htmlFor="new-kind">Type</label>
            <div className="select-wrap">
              <select
                id="new-kind"
                value={newKind}
                onChange={(e) => setNewKind(e.target.value)}
              >
                <option>Workspace</option>
                <option>Dashboard</option>
                <option>Application</option>
              </select>
              <ChevronDown size={15} />
            </div>
          </div>
          <div className="modal-actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreate(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              <Plus size={15} />
              Create project
            </Button>
          </div>
        </form>
      </Modal>
      <Modal
        open={!!pendingDelete}
        onOpenChange={(v) => !v && setPendingDelete(null)}
        onCloseAutoFocus={(e) => {
          if (!focusTableAfterDelete.current) return;
          focusTableAfterDelete.current = false;
          e.preventDefault();
          focusSelectAll();
        }}
        title={
          pendingDelete && pendingDelete.length > 1
            ? `Delete ${pendingDelete.length} projects?`
            : "Delete project?"
        }
        description={
          pendingDelete && pendingDelete.length > 1
            ? `This removes ${pendingDelete.length} projects from this demo's data.`
            : `This removes “${pendingDelete?.[0]?.name ?? ""}” from this demo's data.`
        }
      >
        <div className="alert alert-warning">
          <TriangleAlert size={18} />
          <div>
            <strong>Confirm before you continue</strong>
            <p>Destructive actions should make their impact explicit.</p>
          </div>
        </div>
        <div className="modal-actions">
          <Button
            variant="outline"
            autoFocus
            onClick={() => setPendingDelete(null)}
          >
            {pendingDelete && pendingDelete.length > 1
              ? "Keep projects"
              : "Keep project"}
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              const ids = new Set(pendingDelete?.map((r) => r.id));
              focusTableAfterDelete.current = rows.some((r) => ids.has(r.id));
              setRows(rows.filter((r) => !ids.has(r.id)));
              setSelected((current) => current.filter((id) => !ids.has(id)));
              setPendingDelete(null);
              notify(
                ids.size > 1
                  ? `${ids.size} projects removed from the demo.`
                  : "Project removed from the demo.",
              );
            }}
          >
            <Trash2 size={15} />
            Confirm deletion
          </Button>
        </div>
      </Modal>
      <Modal
        open={!!detail}
        onOpenChange={(v) => !v && setDetail(null)}
        title={detail?.name || "Project"}
        description="Details of the demo project."
      >
        <dl className="detail-list">
          <div>
            <dt>Type</dt>
            <dd>{detail?.kind}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{detail?.status}</dd>
          </div>
          <div>
            <dt>Updated</dt>
            <dd>{detail?.date}</dd>
          </div>
        </dl>
        <div className="modal-actions">
          <Button variant="outline" onClick={() => setDetail(null)}>
            Close details
          </Button>
        </div>
      </Modal>
      <CommandPalette
        open={command}
        onOpenChange={setCommand}
        items={navigation.map((n) => ({
          id: n.id,
          label: n.label,
          icon: <NavIcon id={n.id} />,
        }))}
        onSelect={navigate}
      />
      <div className="toast-region" aria-live="polite" aria-atomic="true">
        {toast && (
          <div className={`toast toast-${toast.tone}`}>
            {toast.tone === "danger" ? (
              <CircleAlert size={19} />
            ) : toast.tone === "info" ? (
              <Info size={19} />
            ) : (
              <CheckCircle2 size={19} />
            )}
            <span>{toast.message}</span>
            <button
              aria-label="Dismiss notification"
              onClick={() => setToast(null)}
            >
              <X size={15} />
            </button>
          </div>
        )}
      </div>
    </Tooltip.Provider>
  );
}

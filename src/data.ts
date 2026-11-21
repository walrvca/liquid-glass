export type DemoRow = {
  id: number;
  name: string;
  kind: string;
  status: "Published" | "In review" | "Draft";
  date: string;
};
export const initialRows: DemoRow[] = [
  {
    id: 1,
    name: "Knowledge library",
    kind: "Workspace",
    status: "Published",
    date: "Nov 20, 2026",
  },
  {
    id: 2,
    name: "Research observatory",
    kind: "Dashboard",
    status: "In review",
    date: "Nov 19, 2026",
  },
  {
    id: 3,
    name: "Evidence explorer",
    kind: "Application",
    status: "Published",
    date: "Nov 18, 2026",
  },
  {
    id: 4,
    name: "Document assistant",
    kind: "Workspace",
    status: "Draft",
    date: "Nov 17, 2026",
  },
];
export const navigation = [
  { id: "overview", label: "Overview", group: "START HERE" },
  { id: "foundations", label: "Foundations", group: "" },
  { id: "buttons", label: "Buttons and actions", group: "COMPONENTS" },
  { id: "forms", label: "Forms", group: "" },
  { id: "feedback", label: "Feedback and states", group: "" },
  { id: "controls", label: "Controls", group: "" },
  { id: "table", label: "Data table", group: "" },
  { id: "visualization", label: "Visualization", group: "" },
  { id: "guidelines", label: "Guidelines", group: "RESOURCES" },
];

export const activity = [
  { day: "Mon", value: 35 },
  { day: "Tue", value: 58 },
  { day: "Wed", value: 45 },
  { day: "Thu", value: 76 },
  { day: "Fri", value: 62 },
  { day: "Sat", value: 93 },
  { day: "Sun", value: 72 },
];

export const showcase = {
  buttons: ["Button", "Tooltip"],
  forms: ["Input", "Select", "Form"],
  feedback: ["Badge", "Alert", "Toast"],
  controls: ["Switch", "Radio", "Slider"],
  table: ["Table", "Dropdown", "Checkbox"],
  visualization: ["Chart", "Progress"],
  empty: ["Empty", "Dialog", "Skeleton"],
};
export const componentCount = new Set(Object.values(showcase).flat()).size;

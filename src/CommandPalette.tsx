import {
  useEffect,
  useId,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { ChevronRight, Search } from "lucide-react";
import { Modal } from "./ui";

export type CommandItem = { id: string; label: string; icon: ReactNode };

export function CommandPalette({
  open,
  onOpenChange,
  items,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CommandItem[];
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const listId = useId();
  const optionId = (id: string) => `${listId}-${id}`;
  const results = items.filter((item) =>
    item.label
      .toLocaleLowerCase("en")
      .includes(query.trim().toLocaleLowerCase("en")),
  );
  const active = results[Math.min(activeIndex, results.length - 1)];

  useEffect(() => {
    if (open) return;
    setQuery("");
    setActiveIndex(0);
  }, [open]);
  const activeId = active ? optionId(active.id) : undefined;
  useEffect(() => {
    if (activeId)
      document.getElementById(activeId)?.scrollIntoView({ block: "nearest" });
  }, [activeId]);
  function choose(id: string) {
    onOpenChange(false);
    onSelect(id);
  }
  function onKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
    const last = results.length - 1;
    const moves: Record<string, () => number> = {
      ArrowDown: () => (activeIndex >= last ? 0 : activeIndex + 1),
      ArrowUp: () => (activeIndex <= 0 ? last : activeIndex - 1),
      Home: () => 0,
      End: () => last,
    };
    if (moves[e.key] && results.length) {
      e.preventDefault();
      setActiveIndex(moves[e.key]());
    } else if (e.key === "Enter" && active) {
      e.preventDefault();
      choose(active.id);
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Search components"
      description="Find a section of the design system."
    >
      <div className="command-input">
        <Search size={18} />
        <input
          role="combobox"
          aria-label="Component name"
          aria-expanded={results.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          autoFocus
          placeholder="Type to search..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={onKeyDown}
        />
        <kbd>ESC</kbd>
      </div>
      <div
        className="command-results"
        id={listId}
        role="listbox"
        aria-label="Sections"
      >
        {results.map((item, index) => (
          <div
            key={item.id}
            id={optionId(item.id)}
            role="option"
            aria-selected={item === active}
            className={item === active ? "active" : undefined}
            onMouseMove={() => setActiveIndex(index)}
            onClick={() => choose(item.id)}
          >
            {item.icon}
            {item.label}
            <ChevronRight size={15} />
          </div>
        ))}
      </div>
      <p className="command-empty" role="status">
        {results.length ? "" : "No components found."}
      </p>
    </Modal>
  );
}

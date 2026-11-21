import * as React from "react";
import { Slot, Dialog, Tooltip, Switch, Checkbox } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Check, Minus, X } from "lucide-react";

export const cn = (...v: ClassValue[]) => twMerge(clsx(v));
const buttonVariants = cva("btn", {
  variants: {
    variant: {
      primary: "btn-primary",
      secondary: "btn-secondary",
      outline: "btn-outline",
      ghost: "btn-ghost",
      destructive: "btn-destructive",
    },
    size: { default: "", sm: "btn-sm", icon: "btn-icon" },
  },
  defaultVariants: { variant: "primary", size: "default" },
});
export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
export function Card({
  title,
  label,
  children,
  id,
  className = "",
}: {
  title: string;
  label: string;
  children: React.ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <section id={id} className={`card ${className}`}>
      <header className="card-heading">
        <h2>{title}</h2>
        <span className="component-label">{label}</span>
      </header>
      {children}
    </section>
  );
}
export function Toggle({
  id,
  checked,
  onCheckedChange,
  label,
  description,
  locked,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  label: string;
  description?: string;
  /** Not changeable, but stays focusable so its label explains why. */
  locked?: boolean;
}) {
  return (
    <div className="toggle-row">
      <label htmlFor={id}>
        <strong>{label}</strong>
        {description && <span>{description}</span>}
      </label>
      <Switch.Root
        id={id}
        className="switch"
        checked={checked}
        onCheckedChange={(v) => !locked && onCheckedChange(v)}
        aria-disabled={locked || undefined}
      >
        <Switch.Thumb className="switch-thumb" />
      </Switch.Root>
    </div>
  );
}
export function CheckField({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean | "indeterminate";
  onCheckedChange: (v: boolean) => void;
  label: string;
}) {
  const id = React.useId();
  return (
    <label className="check-label" htmlFor={id}>
      <Checkbox.Root
        id={id}
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
        className="checkbox"
      >
        <Checkbox.Indicator>
          {checked === "indeterminate" ? (
            <Minus size={13} />
          ) : (
            <Check size={13} />
          )}
        </Checkbox.Indicator>
      </Checkbox.Root>
      {label}
    </label>
  );
}
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  onCloseAutoFocus,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description: string;
  children: React.ReactNode;
  onCloseAutoFocus?: (event: Event) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content
          className="modal-content"
          onCloseAutoFocus={onCloseAutoFocus}
        >
          <Dialog.Title className="modal-title">{title}</Dialog.Title>
          <Dialog.Description className="modal-description">
            {description}
          </Dialog.Description>
          <Dialog.Close asChild>
            <Button
              size="icon"
              variant="ghost"
              className="modal-close"
              aria-label="Close dialog"
            >
              <X size={18} />
            </Button>
          </Dialog.Close>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function Hint({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className="tooltip" sideOffset={8}>
          {label}
          <Tooltip.Arrow className="tooltip-arrow" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

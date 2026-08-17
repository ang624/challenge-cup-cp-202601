"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export function DropdownMenuContent({ children }: { children: React.ReactNode }) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content className="dropdown-content" sideOffset={10} align="end">
        {children}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  );
}

export function DropdownMenuItem({
  children,
  onSelect,
}: {
  children: React.ReactNode;
  onSelect?: () => void;
}) {
  return (
    <DropdownMenuPrimitive.Item className="dropdown-item" onSelect={onSelect}>
      {children}
    </DropdownMenuPrimitive.Item>
  );
}

export const DropdownMenuSeparator = DropdownMenuPrimitive.Separator;

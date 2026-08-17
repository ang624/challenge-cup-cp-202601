"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";

export function Tooltip({
  children,
  content,
}: {
  children: React.ReactNode;
  content: string;
}) {
  return (
    <TooltipPrimitive.Provider delayDuration={180}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content className="tooltip-content" sideOffset={8}>
            {content}
            <TooltipPrimitive.Arrow className="tooltip-arrow" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

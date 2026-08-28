"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  // DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export function DrawerCreate({
  trigger,
  children,
  open,
  onOpenChange,
}: {
  trigger: string;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <Button variant="outline">{trigger}</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="p-4 sm:p-6 w-full max-w-lg sm:max-w-xl mx-auto flex flex-col max-h-[85vh]">
          <DrawerHeader className="p-0 pb-3 text-left shrink-0">
            <DrawerTitle className="text-lg font-bold text-neutral-900">{trigger}</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {children}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

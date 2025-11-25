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
}: {
  trigger: string;
  children: React.ReactNode;
}) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant='outline'>{trigger}</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className='p-3 w-full max-w-sm'>
          <DrawerHeader>
            <DrawerTitle>{trigger}</DrawerTitle>
          </DrawerHeader>
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

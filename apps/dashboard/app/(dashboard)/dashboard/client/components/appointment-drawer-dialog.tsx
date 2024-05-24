"use client";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import useMediaQuery from "@/hooks/useMediaQuery";
import AppointmentForm from "./appointment-form";

type AppointmentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  clientId: string;
};

export function AppointmentDrawerDialog({
  isOpen,
  onClose,
  clientId,
}: AppointmentModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendamento</DialogTitle>
          </DialogHeader>
          <AppointmentForm clientId={clientId} onClose={onClose} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onClose={onClose}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Agendamento</DrawerTitle>
        </DrawerHeader>
        <AppointmentForm
          className="px-4"
          clientId={clientId}
          onClose={onClose}
        />
      </DrawerContent>
    </Drawer>
  );
}

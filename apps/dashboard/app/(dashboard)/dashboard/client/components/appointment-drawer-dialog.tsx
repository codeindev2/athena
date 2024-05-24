"use client";
import * as React from "react";
import useMediaQuery from "@/hooks/useMediaQuery";
import { AppointmentForm } from "./appointment-form";
import { Modal } from "@/components/ui/modal";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

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
      <Modal title="Agendamento" isOpen={isOpen} onClose={onClose}>
        <AppointmentForm
          clientId={clientId}
          onClose={() => onClose()}
          isOpen={isOpen}
        />
      </Modal>
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
          isOpen
        />
      </DrawerContent>
    </Drawer>
  );
}

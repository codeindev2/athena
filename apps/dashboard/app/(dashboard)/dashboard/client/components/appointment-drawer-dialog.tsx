"use client";
import * as React from "react";
import useMediaQuery from "@/hooks/useMediaQuery";
import { AppointmentForm } from "./appointment-form";
import { Modal } from "@/components/ui/modal";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

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
      <Modal
        title="Agendamento"
        isOpen={isOpen}
        onClose={onClose}
        description="Agende um horário para seu cliente"
      >
        <AppointmentForm
          className="px-4"
          clientId={clientId}
          onClose={onClose}
          isOpen={isOpen}
        />
      </Modal>
    );
  }

  return (
    <Drawer open={isOpen} onClose={onClose}>
      <DrawerContent>
        <DrawerClose className="flex justify-end ">
          <Button variant={"ghost"} onClick={onClose}>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </DrawerClose>
        <DrawerHeader className="text-left">
          <DrawerTitle>Agendamento</DrawerTitle>
          <DrawerDescription>
            Agende um horário para seu cliente
          </DrawerDescription>
        </DrawerHeader>
        <AppointmentForm
          className="px-4"
          clientId={clientId}
          onClose={onClose}
          isOpen={isOpen}
        />
      </DrawerContent>
    </Drawer>
  );
}

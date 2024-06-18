import { NavItem } from "@/types";

export type User = {
  id: number;
  name: string;
  company: string;
  role: string;
  verified: boolean;
  status: string;
};

export type Employee = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth: string; // Consider using a proper date type if possible
  street: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  longitude?: number; // Optional field
  latitude?: number; // Optional field
  job: string;
  profile_picture?: string | null; // Profile picture can be a string (URL) or null (if no picture)
};

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
    label: "Dashboard",
  },
 
  {
    title: "Clientes",
    href: "/dashboard/client",
    icon: "users",
    label: "cliente",
  },
  {
    title: "Colaboradores",
    href: "/dashboard/employee",
    icon: "employee",
    label: "employee",
  },
  {
    title: "Serviços",
    href: "/dashboard/service",
    icon: "services",
    label: "user",
  },
  {
    title: "Agendamentos",
    href: "/dashboard/appointment",
    icon: "calendar",
    label: "user",
  }
];

import React from "react";
import { DashboardLayout } from "./Sidebar";

export default function DashboardLayoutWrapper({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

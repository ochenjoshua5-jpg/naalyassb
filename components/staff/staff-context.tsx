"use client";

import { createContext, useContext, type ReactNode } from "react";
import { hasPermission, type StaffRole } from "@/lib/staff/roles";

export interface StaffViewer {
  displayName: string;
  role: StaffRole | null;
}

interface StaffContextValue extends StaffViewer {
  canUpdate: boolean;
  canDelete: boolean;
  canPublish: boolean;
}

const StaffContext = createContext<StaffContextValue | null>(null);

export function StaffViewerProvider({ viewer, children }: { viewer: StaffViewer; children: ReactNode }) {
  const value: StaffContextValue = {
    ...viewer,
    canUpdate: hasPermission(viewer.role, "enquiries:update"),
    canDelete: hasPermission(viewer.role, "enquiries:delete"),
    canPublish: hasPermission(viewer.role, "news:publish"),
  };
  return <StaffContext.Provider value={value}>{children}</StaffContext.Provider>;
}

export function useStaff(): StaffContextValue {
  const value = useContext(StaffContext);
  if (!value) throw new Error("useStaff must be used inside the staff portal");
  return value;
}

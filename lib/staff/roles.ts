/**
 * Staff roles and the permission matrix. Pure: no imports, so the same rules run in the
 * server guard, the client UI and the Node unit tests.
 *
 * Only two roles can use the staff dashboard. Any other role value (for example "teacher")
 * is treated as "no staff access" and gets a 403 on every staff permission.
 */
export const STAFF_ROLES = ["admin", "admissions"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export const PERMISSIONS = ["enquiries:read", "enquiries:update", "enquiries:delete", "news:publish"] as const;
export type Permission = (typeof PERMISSIONS)[number];

const MATRIX: Record<StaffRole, readonly Permission[]> = {
  // The Headmaster (HM) account. Only role that may delete enquiries.
  admin: ["enquiries:read", "enquiries:update", "enquiries:delete", "news:publish"],
  // Admissions Officer and Deputy Head (admissions). Can work enquiries and publish news.
  admissions: ["enquiries:read", "enquiries:update", "news:publish"],
};

export function parseStaffRole(value: unknown): StaffRole | null {
  return typeof value === "string" && (STAFF_ROLES as readonly string[]).includes(value) ? (value as StaffRole) : null;
}

export function hasPermission(role: string | null | undefined, permission: Permission): boolean {
  const parsed = parseStaffRole(role);
  return parsed !== null && MATRIX[parsed].includes(permission);
}

export const ROLE_LABEL: Record<StaffRole, string> = {
  admin: "Headmaster (HM)",
  admissions: "Admissions",
};

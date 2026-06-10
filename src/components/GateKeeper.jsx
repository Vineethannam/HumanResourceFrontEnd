import React from "react";
import { usePermission } from "@/lib/permissions";

/**
 * Hide children if the current user lacks the required permission.
 * Usage:
 *   <GateKeeper module="users" action="create">
 *     <button>New user</button>
 *   </GateKeeper>
 */
export default function GateKeeper({ module, action, fallback = null, children }) {
  const allowed = usePermission(module, action);
  return allowed ? children : fallback;
}

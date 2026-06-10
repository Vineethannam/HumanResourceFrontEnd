import { useAuth } from "@/context/AuthContext";

/**
 * Check if current user has permission for a given module + action.
 * Modules: candidates | employees | users | roles | invites | categories | tech_stacks | settings
 * Actions: create | read | update | delete
 * ADMIN role always returns true.
 */
export function usePermission(module, action) {
  const { user } = useAuth();
  if (!user || user === false) return false;
  if (user.role === "ADMIN") return true;
  const perms = user.permissions || {};
  return !!(perms[module] && perms[module][action]);
}

import { hasPermission } from "../utils/authorization";

export const usePermission = (user: any, resource: string) => {
  const permissions = hasPermission(user, resource);

  const canCreate = permissions[`create-${resource}`] || false;
  const canView = permissions[`view-${resource}`] || false;
  const canUpdate = permissions[`update-${resource}`] || false;
  const canDelete = permissions[`delete-${resource}`] || false;

  return {
    canCreate,
    canView,
    canUpdate,
    canDelete,
  };
};
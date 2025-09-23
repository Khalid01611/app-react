import { Navigate } from "react-router";
import { useSelector } from "react-redux";
import { hasPermission } from "../utils/authorization";
import type { RootState } from "../interface/types";

interface PermissionMiddlewareProps {
  children: React.ReactNode;
  permission: string;
}

const PermissionMiddleware = ({ children, permission }: PermissionMiddlewareProps) => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userPermissions = hasPermission(user, "");
  const hasRequiredPermission = userPermissions[permission] || false;

  if (!hasRequiredPermission) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default PermissionMiddleware;
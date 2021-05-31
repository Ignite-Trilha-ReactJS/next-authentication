import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { validateUserPermissions } from "../utils/validateUserPermissions";

interface IUserCan {
  permissions?: string[];
  roles?: string[];
}

export function useCan({ permissions, roles }: IUserCan) {
  const { user, isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated && user != undefined) {
    return false;
  }

  const userHasValidPermission = validateUserPermissions({
    user,
    permissions,
    roles
  })

  return userHasValidPermission;

}
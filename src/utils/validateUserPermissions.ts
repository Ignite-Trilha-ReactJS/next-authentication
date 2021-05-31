interface User {
  permissions: string[];
  roles: string[];
}

interface IValidateUserPermissions {
  user: User;
  permissions?: string[];
  roles?: string[];
}

export function validateUserPermissions({ user, permissions, roles }: IValidateUserPermissions) {

  if (permissions != undefined && permissions.length > 0) {
    const hasAllPermissions = permissions.every(permission => {
      return user != undefined && user.permissions.includes(permission)
    });

    if (!hasAllPermissions)
      return false
  }

  if (roles != undefined && roles.length > 0) {
    const hasAllRoles = roles.some(role => {
      return user != undefined && user.roles.includes(role)
    });

    if (!hasAllRoles)
      return false
  }

  return true;
}
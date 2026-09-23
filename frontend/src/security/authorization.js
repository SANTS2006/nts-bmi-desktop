/*
 * ============================================================
 * NTS BMS - FRONTEND AUTHORIZATION
 * ============================================================
 *
 * Central frontend authorization layer.
 *
 * Responsibilities:
 *
 * - Sidebar visibility
 * - Navigation visibility
 * - Protected route checks
 * - Button visibility
 * - Action visibility
 * - Permission-denied UI
 * - Role/workspace resolution
 *
 * IMPORTANT:
 *
 * This file NEVER provides real backend security.
 *
 * The backend MUST continue to enforce:
 *
 * - Authentication
 * - Authorization
 * - Role authorization
 * - Permission authorization
 * - Object-level authorization
 * - Resource ownership
 *
 * Frontend authorization exists primarily to provide a correct
 * and professional user experience.
 *
 * ============================================================
 */


/*
 * ============================================================
 * ROLE NAMES
 * ============================================================
 */

export const ROLE_NAMES = Object.freeze({

  ADMIN:
    "ADMIN",

  FINANCE:
    "FINANCE",

  PROJECT_MANAGER:
    "PROJECT_MANAGER",

  DEVELOPER:
    "DEVELOPER",

  STAFF:
    "STAFF",

});


/*
 * ============================================================
 * NORMALIZE ROLE
 * ============================================================
 */

function normalizeRole(value) {

  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

}


/*
 * ============================================================
 * NORMALIZE PERMISSION
 * ============================================================
 */

function normalizePermission(value) {

  return String(value || "")
    .trim()
    .toLowerCase();

}


/*
 * ============================================================
 * EXTRACT PERMISSION KEY
 * ============================================================
 *
 * Supports:
 *
 * "projects.read"
 *
 * {
 *   name: "projects.read"
 * }
 *
 * {
 *   key: "projects.read"
 * }
 *
 * {
 *   permissionKey: "projects.read"
 * }
 *
 * {
 *   permission: {
 *     name: "projects.read"
 *   }
 * }
 *
 * {
 *   permission: {
 *     key: "projects.read"
 *   }
 * }
 *
 * {
 *   Permission: {
 *     name: "projects.read"
 *   }
 * }
 *
 * ============================================================
 */

function extractPermissionKey(value) {

  if (!value) {
    return null;
  }


  /*
   * ----------------------------------------------------------
   * Direct string
   * ----------------------------------------------------------
   */

  if (
    typeof value === "string"
  ) {

    return value;

  }


  /*
   * ----------------------------------------------------------
   * Invalid value
   * ----------------------------------------------------------
   */

  if (
    typeof value !== "object"
  ) {

    return null;

  }


  /*
   * ----------------------------------------------------------
   * Direct permission object
   * ----------------------------------------------------------
   */

  if (value.name) {

    return value.name;

  }


  if (value.key) {

    return value.key;

  }


  if (value.permissionKey) {

    return value.permissionKey;

  }


  /*
   * ----------------------------------------------------------
   * Lowercase Prisma relation
   * ----------------------------------------------------------
   */

  if (
    value.permission?.name
  ) {

    return value.permission.name;

  }


  if (
    value.permission?.key
  ) {

    return value.permission.key;

  }


  /*
   * ----------------------------------------------------------
   * Capitalized relation
   * ----------------------------------------------------------
   */

  if (
    value.Permission?.name
  ) {

    return value.Permission.name;

  }


  if (
    value.Permission?.key
  ) {

    return value.Permission.key;

  }


  /*
   * ----------------------------------------------------------
   * Additional defensive nesting
   * ----------------------------------------------------------
   */

  if (
    value.permission?.permission?.name
  ) {

    return value.permission.permission.name;

  }


  if (
    value.permission?.permission?.key
  ) {

    return value.permission.permission.key;

  }


  return null;

}


/*
 * ============================================================
 * GET USER ROLES
 * ============================================================
 */

export function getUserRoles(user) {

  if (!user) {
    return [];
  }


  if (
    Array.isArray(user.roles)
  ) {

    return user.roles;

  }


  return [];

}


/*
 * ============================================================
 * GET ACTIVE ROLE
 * ============================================================
 *
 * The active role is security-sensitive.
 *
 * We intentionally DO NOT fall back to:
 *
 * user.roles[0]
 *
 * because the first role is not necessarily the active role.
 *
 * ============================================================
 */

export function getActiveRole(user) {

  if (!user) {
    return null;
  }


  /*
   * ----------------------------------------------------------
   * PRIMARY SOURCE
   * ----------------------------------------------------------
   *
   * /api/auth/me should ideally return:
   *
   * user.activeRole
   */

  if (
    user.activeRole
  ) {

    return user.activeRole;

  }


  /*
   * ----------------------------------------------------------
   * SECONDARY SOURCE
   * ----------------------------------------------------------
   *
   * Some API implementations may return:
   *
   * user.activeRoleId
   *
   * together with:
   *
   * user.roles
   * ----------------------------------------------------------
   */

  if (
    user.activeRoleId &&
    Array.isArray(user.roles)
  ) {

    const role =
      user.roles.find(
        (item) =>
          item?.id ===
          user.activeRoleId
      );


    if (role) {

      return role;

    }

  }


  /*
   * ----------------------------------------------------------
   * NO ACTIVE ROLE
   * ----------------------------------------------------------
   */

  return null;

}


/*
 * ============================================================
 * GET ACTIVE ROLE ID
 * ============================================================
 */

export function getActiveRoleId(user) {

  const role =
    getActiveRole(user);


  return (
    role?.id ||
    user?.activeRoleId ||
    null
  );

}


/*
 * ============================================================
 * GET ACTIVE ROLE NAME
 * ============================================================
 */

export function getActiveRoleName(user) {

  const role =
    getActiveRole(user);


  return normalizeRole(
    role?.name ||
    role?.role?.name
  );

}


/*
 * ============================================================
 * CHECK ADMIN
 * ============================================================
 */

export function isAdmin(user) {

  return (
    getActiveRoleName(user) ===
    ROLE_NAMES.ADMIN
  );

}


/*
 * ============================================================
 * GET ACTIVE ROLE PERMISSIONS
 * ============================================================
 *
 * Permissions are taken from the ACTIVE ROLE only.
 *
 * This is important.
 *
 * If a user has:
 *
 * ADMIN
 * DEVELOPER
 *
 * and currently selected:
 *
 * DEVELOPER
 *
 * the frontend should not combine the permissions of both
 * roles into one giant permission set.
 *
 * ============================================================
 */

export function getActiveRolePermissions(user) {

  const permissions =
    new Set();


  const role =
    getActiveRole(user);


  /*
   * ----------------------------------------------------------
   * No active role
   * ----------------------------------------------------------
   */

  if (!role) {

    /*
     * Some /me implementations may expose direct permissions
     * without returning the role object.
     *
     * We support that as a fallback.
     */

    if (
      Array.isArray(
        user?.permissions
      )
    ) {

      for (
        const permission
        of user.permissions
      ) {

        const key =
          extractPermissionKey(
            permission
          );


        const normalized =
          normalizePermission(
            key
          );


        if (normalized) {

          permissions.add(
            normalized
          );

        }

      }

    }


    return permissions;

  }


  /*
   * ----------------------------------------------------------
   * PRIMARY:
   *
   * activeRole.permissions
   * ----------------------------------------------------------
   */

  if (
    Array.isArray(
      role.permissions
    )
  ) {

    for (
      const permission
      of role.permissions
    ) {

      const key =
        extractPermissionKey(
          permission
        );


      const normalized =
        normalizePermission(
          key
        );


      if (normalized) {

        permissions.add(
          normalized
        );

      }

    }

  }


  /*
   * ----------------------------------------------------------
   * SECONDARY:
   *
   * activeRole.rolePermissions
   * ----------------------------------------------------------
   *
   * Typical Prisma structure:
   *
   * rolePermissions: [
   *   {
   *     permission: {
   *       name: "projects.read"
   *     }
   *   }
   * ]
   * ----------------------------------------------------------
   */

  if (
    Array.isArray(
      role.rolePermissions
    )
  ) {

    for (
      const rolePermission
      of role.rolePermissions
    ) {

      const key =
        extractPermissionKey(
          rolePermission
        );


      const normalized =
        normalizePermission(
          key
        );


      if (normalized) {

        permissions.add(
          normalized
        );

      }

    }

  }


  /*
   * ----------------------------------------------------------
   * Prisma alternative:
   *
   * role.RolePermission
   * ----------------------------------------------------------
   */

  if (
    Array.isArray(
      role.RolePermission
    )
  ) {

    for (
      const rolePermission
      of role.RolePermission
    ) {

      const key =
        extractPermissionKey(
          rolePermission
        );


      const normalized =
        normalizePermission(
          key
        );


      if (normalized) {

        permissions.add(
          normalized
        );

      }

    }

  }


  /*
   * ----------------------------------------------------------
   * Alternative:
   *
   * role.permission
   * ----------------------------------------------------------
   */

  if (
    Array.isArray(
      role.permission
    )
  ) {

    for (
      const permission
      of role.permission
    ) {

      const key =
        extractPermissionKey(
          permission
        );


      const normalized =
        normalizePermission(
          key
        );


      if (normalized) {

        permissions.add(
          normalized
        );

      }

    }

  }


  /*
   * ----------------------------------------------------------
   * IMPORTANT
   *
   * We intentionally do NOT merge user.permissions into an
   * active role that already exists.
   *
   * The active role is the source of truth.
   * ----------------------------------------------------------
   */

  return permissions;

}


/*
 * ============================================================
 * HAS PERMISSION
 * ============================================================
 */

export function hasPermission(
  user,
  requiredPermission
) {

  /*
   * ----------------------------------------------------------
   * No permission requirement
   * ----------------------------------------------------------
   *
   * A navigation item without a permission requirement can
   * be displayed to an authenticated user.
   * ----------------------------------------------------------
   */

  if (
    !requiredPermission
  ) {

    return true;

  }


  /*
   * ----------------------------------------------------------
   * User must exist
   * ----------------------------------------------------------
   */

  if (!user) {

    return false;

  }


  /*
   * ----------------------------------------------------------
   * ADMIN SUPER ROLE
   * ----------------------------------------------------------
   *
   * ADMIN is allowed to see frontend functionality.
   *
   * The backend MUST still authorize every API request.
   * ----------------------------------------------------------
   */

  if (
    isAdmin(user)
  ) {

    return true;

  }


  /*
   * ----------------------------------------------------------
   * Resolve active role permissions
   * ----------------------------------------------------------
   */

  const permissions =
    getActiveRolePermissions(
      user
    );


  return permissions.has(
    normalizePermission(
      requiredPermission
    )
  );

}


/*
 * ============================================================
 * HAS ANY PERMISSION
 * ============================================================
 */

export function hasAnyPermission(
  user,
  permissions = []
) {

  if (
    !Array.isArray(
      permissions
    ) ||
    permissions.length === 0
  ) {

    return false;

  }


  return permissions.some(
    (permission) =>
      hasPermission(
        user,
        permission
      )
  );

}


/*
 * ============================================================
 * HAS ALL PERMISSIONS
 * ============================================================
 */

export function hasAllPermissions(
  user,
  permissions = []
) {

  if (
    !Array.isArray(
      permissions
    ) ||
    permissions.length === 0
  ) {

    return true;

  }


  return permissions.every(
    (permission) =>
      hasPermission(
        user,
        permission
      )
  );

}


/*
 * ============================================================
 * HAS ROLE
 * ============================================================
 */

export function hasRole(
  user,
  requiredRole
) {

  if (!requiredRole) {

    return true;

  }


  return (
    getActiveRoleName(user) ===
    normalizeRole(requiredRole)
  );

}


/*
 * ============================================================
 * HAS ANY ROLE
 * ============================================================
 */

export function hasAnyRole(
  user,
  roles = []
) {

  if (
    !Array.isArray(
      roles
    ) ||
    roles.length === 0
  ) {

    return false;

  }


  const activeRole =
    getActiveRoleName(
      user
    );


  if (!activeRole) {

    return false;

  }


  return roles.some(
    (role) =>
      normalizeRole(role) ===
      activeRole
  );

}


/*
 * ============================================================
 * HAS ALL ROLES
 * ============================================================
 *
 * Usually not needed for workspace navigation because the
 * application has one active role at a time.
 *
 * Included for reusable route/action guards.
 * ============================================================
 */

export function hasAllRoles(
  user,
  roles = []
) {

  if (
    !Array.isArray(
      roles
    ) ||
    roles.length === 0
  ) {

    return true;

  }


  const userRoles =
    getUserRoles(user);


  if (!userRoles.length) {

    return false;

  }


  const normalizedRoles =
    new Set(
      userRoles.map(
        (role) =>
          normalizeRole(
            role?.name ||
            role?.role?.name ||
            role
          )
      )
    );


  return roles.every(
    (role) =>
      normalizedRoles.has(
        normalizeRole(role)
      )
  );

}


/*
 * ============================================================
 * CAN ACCESS
 * ============================================================
 *
 * Supports:
 *
 * {
 *   permission: "projects.read"
 * }
 *
 * {
 *   roles: ["ADMIN"]
 * }
 *
 * {
 *   anyOf: [
 *     "projects.read",
 *     "projects.create"
 *   ]
 * }
 *
 * {
 *   allOf: [
 *     "projects.read",
 *     "projects.update"
 *   ]
 * }
 *
 * Multiple requirements are ANDed together.
 *
 * Example:
 *
 * {
 *   roles: ["PROJECT_MANAGER"],
 *   permission: "projects.update"
 * }
 *
 * means:
 *
 * Active role MUST be PROJECT_MANAGER
 *
 * AND
 *
 * User MUST have projects.update.
 *
 * ============================================================
 */

export function canAccess(
  user,
  {
    permission,
    anyOf,
    allOf,
    roles,
  } = {}
) {

  /*
   * ----------------------------------------------------------
   * Authentication requirement
   * ----------------------------------------------------------
   */

  if (!user) {

    return false;

  }


  /*
   * ----------------------------------------------------------
   * ACTIVE ROLE REQUIREMENT
   * ----------------------------------------------------------
   *
   * This check happens BEFORE permission evaluation.
   *
   * This is important because ADMIN's frontend permission
   * super-role must NOT cause an item explicitly restricted
   * to another role to appear.
   *
   * Example:
   *
   * roles: ["FINANCE"]
   *
   * An ADMIN does NOT pass this role requirement.
   *
   * This prevents accidental cross-workspace navigation.
   * ----------------------------------------------------------
   */

  if (
    Array.isArray(roles) &&
    roles.length > 0
  ) {

    if (
      !hasAnyRole(
        user,
        roles
      )
    ) {

      return false;

    }

  }


  /*
   * ----------------------------------------------------------
   * SINGLE PERMISSION
   * ----------------------------------------------------------
   */

  if (permission) {

    if (
      !hasPermission(
        user,
        permission
      )
    ) {

      return false;

    }

  }


  /*
   * ----------------------------------------------------------
   * ANY PERMISSION
   * ----------------------------------------------------------
   */

  if (
    Array.isArray(anyOf) &&
    anyOf.length > 0
  ) {

    if (
      !hasAnyPermission(
        user,
        anyOf
      )
    ) {

      return false;

    }

  }


  /*
   * ----------------------------------------------------------
   * ALL PERMISSIONS
   * ----------------------------------------------------------
   */

  if (
    Array.isArray(allOf) &&
    allOf.length > 0
  ) {

    if (
      !hasAllPermissions(
        user,
        allOf
      )
    ) {

      return false;

    }

  }


  /*
   * ----------------------------------------------------------
   * All requirements passed.
   * ----------------------------------------------------------
   */

  return true;

}


/*
 * ============================================================
 * FILTER NAVIGATION
 * ============================================================
 *
 * Filters navigation based on:
 *
 * 1. Authentication
 * 2. Role
 * 3. Permission
 * 4. anyOf
 * 5. allOf
 *
 * ============================================================
 */

export function filterNavigation(
  items = [],
  user
) {

  if (
    !Array.isArray(items)
  ) {

    return [];

  }


  return items.filter(
    (item) => {

      /*
       * ------------------------------------------------------
       * Public/authenticated navigation item
       * ------------------------------------------------------
       *
       * Example:
       *
       * Home
       * Notifications
       * Settings
       * Help
       *
       * ------------------------------------------------------
       */

      const requiresAuthorization =
        Boolean(

          item?.permission ||

          (
            Array.isArray(
              item?.anyOf
            ) &&
            item.anyOf.length > 0
          ) ||

          (
            Array.isArray(
              item?.allOf
            ) &&
            item.allOf.length > 0
          ) ||

          (
            Array.isArray(
              item?.roles
            ) &&
            item.roles.length > 0
          )

        );


      /*
       * No authorization requirements.
       */

      if (
        !requiresAuthorization
      ) {

        /*
         * Only authenticated users should receive
         * authenticated navigation.
         */

        return Boolean(user);

      }


      /*
       * Evaluate role + permissions.
       */

      return canAccess(
        user,
        item
      );

    }
  );

}


/*
 * ============================================================
 * FILTER BY ROLE
 * ============================================================
 *
 * Useful when a component needs only role-specific
 * configuration.
 * ============================================================
 */

export function filterByRole(
  items = [],
  user
) {

  if (
    !Array.isArray(items)
  ) {

    return [];

  }


  const activeRole =
    getActiveRoleName(
      user
    );


  return items.filter(
    (item) => {

      if (
        !Array.isArray(
          item?.roles
        ) ||
        item.roles.length === 0
      ) {

        return true;

      }


      return item.roles.some(
        (role) =>
          normalizeRole(role) ===
          activeRole
      );

    }
  );

}


/*
 * ============================================================
 * GET USER WORKSPACE
 * ============================================================
 *
 * This gives the frontend a central way to determine which
 * application workspace should be displayed.
 *
 * ============================================================
 */

export function getUserWorkspace(user) {

  const role =
    getActiveRoleName(
      user
    );


  switch (role) {

    case ROLE_NAMES.ADMIN:

      return "ADMIN";


    case ROLE_NAMES.FINANCE:

      return "FINANCE";


    case ROLE_NAMES.PROJECT_MANAGER:

      return "PROJECT_MANAGER";


    case ROLE_NAMES.DEVELOPER:

      return "DEVELOPER";


    case ROLE_NAMES.STAFF:

      return "STAFF";


    default:

      return null;

  }

}


/*
 * ============================================================
 * CHECK WORKSPACE
 * ============================================================
 */

export function hasWorkspace(
  user,
  workspace
) {

  if (!workspace) {

    return false;

  }


  return (
    getUserWorkspace(user) ===
    String(workspace)
      .trim()
      .toUpperCase()
  );

}


/*
 * ============================================================
 * GET AUTHORIZATION SNAPSHOT
 * ============================================================
 *
 * Extremely useful while debugging RBAC.
 *
 * Example:
 *
 * console.log(
 *   getAuthorizationSnapshot(user)
 * );
 *
 * ============================================================
 */

export function getAuthorizationSnapshot(
  user
) {

  const activeRole =
    getActiveRole(
      user
    );


  const permissions =
    getActiveRolePermissions(
      user
    );


  return {

    userId:
      user?.id ||
      null,

    email:
      user?.email ||
      null,

    activeRoleId:
      getActiveRoleId(
        user
      ),

    activeRole:
      activeRole?.name ||
      null,

    normalizedRole:
      getActiveRoleName(
        user
      ) ||
      null,

    workspace:
      getUserWorkspace(
        user
      ),

    permissions:
      Array.from(
        permissions
      ),

  };

}


/*
 * ============================================================
 * DEBUG AUTHORIZATION
 * ============================================================
 *
 * Development helper.
 *
 * Safe to call from components while developing.
 *
 * ============================================================
 */

export function debugAuthorization(
  user
) {

  const snapshot =
    getAuthorizationSnapshot(
      user
    );


  if (
    import.meta?.env?.DEV
  ) {

    console.group(
      "[NTS BMS AUTHORIZATION]"
    );


    console.log(
      snapshot
    );


    console.groupEnd();

  }


  return snapshot;

}
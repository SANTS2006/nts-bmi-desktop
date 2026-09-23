/*
 * ============================================================
 * NTS BMS - PERMISSION HELPERS
 * ============================================================
 */


/*
 * ============================================================
 * GET USER PERMISSIONS
 * ============================================================
 */

export function getUserPermissions(
    user
) {

    if (!user) {

        return [];

    }


    /*
     * Support the common permission shapes used by the
     * authorization layer.
     */

    if (
        Array.isArray(
            user.permissions
        )
    ) {

        return user.permissions
            .map(
                (permission) =>
                    typeof permission === "string"
                        ? permission
                        : permission?.name
            )
            .filter(Boolean);

    }


    if (
        Array.isArray(
            user.permissionNames
        )
    ) {

        return user.permissionNames;

    }


    /*
     * Some responses expose permissions through roles.
     */

    if (
        Array.isArray(
            user.userRoles
        )
    ) {

        return user.userRoles
            .flatMap(
                (userRole) =>
                    userRole?.role
                        ?.rolePermissions || []
            )
            .map(
                (rolePermission) =>
                    rolePermission
                        ?.permission
                        ?.name
            )
            .filter(Boolean);

    }


    return [];

}


/*
 * ============================================================
 * HAS PERMISSION
 * ============================================================
 */

export function hasPermission(
    user,
    permission
) {

    if (!permission) {

        return false;

    }


    const permissions =
        getUserPermissions(
            user
        );


    return permissions.includes(
        permission
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

    return permissions.every(
        (permission) =>
            hasPermission(
                user,
                permission
            )
    );

}
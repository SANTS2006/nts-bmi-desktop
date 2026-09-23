import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  loginUser,
  logoutUser,
} from "../api/auth";

import { apiRequest } from "../api/client";


const AuthContext =
  createContext(null);


export function AuthProvider({
  children,
}) {

  const [
    user,
    setUser,
  ] = useState(null);


  const [
    isLoading,
    setIsLoading,
  ] = useState(true);


  const [
    isAuthenticated,
    setIsAuthenticated,
  ] = useState(false);


  /*
   * ==================================================
   * FETCH CURRENT AUTHENTICATED USER
   * ==================================================
   */

  const fetchCurrentUser =
    useCallback(
      async () => {

        try {

          const response =
            await apiRequest(
              "/api/auth/me",
              {
                method: "GET",
              }
            );


          /*
           * Expected backend response:
           *
           * {
           *   success: true,
           *
           *   data: {
           *
           *     user: {
           *       id,
           *       email,
           *       firstName,
           *       lastName,
           *       status,
           *       roles: [...]
           *     },
           *
           *     activeRole: {
           *       id,
           *       name,
           *       description
           *     }
           *   }
           * }
           */


          if (
            response?.success &&
            response?.data?.user
          ) {

            const currentUser =
              response.data.user;


            /*
             * Active role is returned
             * separately by the backend.
             */

            const activeRole =
              response.data.activeRole ||
              null;


            /*
             * Store the active role
             * together with the user.
             *
             * This means components can
             * simply use:
             *
             * user.roles
             *
             * user.activeRole
             */

            const authenticatedUser =
              {
                ...currentUser,

                activeRole,
              };


            setUser(
              authenticatedUser
            );


            setIsAuthenticated(
              true
            );


            return authenticatedUser;

          }


          /*
           * No authenticated user.
           */

          setUser(null);

          setIsAuthenticated(false);


          return null;


        } catch (error) {

          /*
           * If /me fails, the current
           * session cannot be considered
           * authenticated.
           */

          setUser(null);

          setIsAuthenticated(false);


          return null;

        }

      },
      []
    );


  /*
   * ==================================================
   * INITIAL SESSION CHECK
   * ==================================================
   */

  useEffect(() => {

    const initializeAuth =
      async () => {

        setIsLoading(
          true
        );


        await fetchCurrentUser();


        setIsLoading(
          false
        );

      };


    initializeAuth();

  }, [
    fetchCurrentUser,
  ]);


  /*
   * ==================================================
   * LOGIN
   * ==================================================
   */

  const login =
    useCallback(
      async ({
        email,
        password,
      }) => {

        /*
         * POST /api/auth/login
         */

        const response =
          await loginUser({
            email,
            password,
          });


        /*
         * Verify the newly-created
         * session against /me.
         */

        const currentUser =
          await fetchCurrentUser();


        if (!currentUser) {

          throw new Error(
            "Login succeeded, but the authenticated session could not be verified."
          );

        }


        return {
          response,
          user:
            currentUser,
        };

      },
      [
        fetchCurrentUser,
      ]
    );


  /*
   * ==================================================
   * LOGOUT
   * ==================================================
   */

  const logout =
    useCallback(
      async () => {

        try {

          /*
           * POST /api/auth/logout
           */

          await logoutUser();

        } finally {

          /*
           * Always clear local
           * authentication state.
           */

          setUser(null);

          setIsAuthenticated(
            false
          );

        }

      },
      []
    );


  /*
   * ==================================================
   * CONTEXT VALUE
   * ==================================================
   */

  const value = {

    user,

    isAuthenticated,

    isLoading,


    login,

    logout,


    /*
     * Used after role switching.
     *
     * This does NOT reload the browser.
     * It simply requests /me again and
     * updates React state.
     */

    refreshUser:
      fetchCurrentUser,

  };


  return (

    <AuthContext.Provider
      value={value}
    >

      {children}

    </AuthContext.Provider>

  );

}


/*
 * ==================================================
 * USE AUTH HOOK
 * ==================================================
 */

export function useAuth() {

  const context =
    useContext(
      AuthContext
    );


  if (!context) {

    throw new Error(
      "useAuth must be used inside an AuthProvider."
    );

  }


  return context;

}
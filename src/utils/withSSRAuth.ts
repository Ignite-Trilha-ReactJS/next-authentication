import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies, destroyCookie } from "nookies";
import { AuthTokenError } from "../errors/AuthTokenError";
import decode from 'jwt-decode';
import { validateUserPermissions } from "./validateUserPermissions";


interface WithSSRAuthOptions {
  permissions: string[];
  roles: string[];
}


export function withSSRAuth<P>(fn: GetServerSideProps<P>, options?: WithSSRAuthOptions): GetServerSideProps {
  return async (ctx: GetServerSidePropsContext) => {
    const cookies = parseCookies(ctx);
    const token = cookies['@nextauth:token'];

    try {
      if (!token)
        throw new AuthTokenError();

      if (options) {
        const { permissions, roles } = options;
        const user = decode<{ permissions: string[], roles: string[] }>(token);

        const userHasValidPermissions = validateUserPermissions({
          permissions,
          roles,
          user
        });

        if (!userHasValidPermissions) {
          return {
            redirect: {
              destination: "/dashboard",
              permanent: false
            }
          }
        }
      }

      return await fn(ctx);
    }
    catch (err) {

      if (err instanceof AuthTokenError) {
        destroyCookie(ctx, '@nextauth:token');
        destroyCookie(ctx, '@nextauth:refreshToken');

        return {
          redirect: {
            destination: "/",
            permanent: false
          }
        }
      }
    }
    return {
      props: {}
    }
  }
}
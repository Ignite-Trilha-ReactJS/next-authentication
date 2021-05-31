import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies, destroyCookie } from "nookies";
import { AuthTokenError } from "../errors/AuthTokenError";

export function withSSRAuth<P>(fn: GetServerSideProps<P>): GetServerSideProps {
  return async (ctx: GetServerSidePropsContext) => {
    const cookies = parseCookies(ctx);

    try {
      if (!cookies['@nextauth:token'])
        throw new AuthTokenError();

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
import { createContext, ReactNode, useState, useEffect } from "react";

import Router from 'next/router';

import { setCookie, parseCookies, destroyCookie } from 'nookies'

import { api } from "../services/api";


interface IUser {
  email: string;
  permissions: string[];
  rules: string[];
}

interface ISignInCredentials {
  email: string;
  password: string;
}

interface IAuthContextData {
  signIn(credentials: ISignInCredentials): Promise<void>;
  isAuthenticated: boolean;
  user: IUser;
}

interface IAuthProvider {
  children: ReactNode;
}

export const AuthContext = createContext({} as IAuthContextData);

export function signOut() {
  destroyCookie(undefined, '@nextauth:token');
  destroyCookie(undefined, '@nextauth:refreshToken');

  Router.push('/');
}

export function AuthProvider({ children }: IAuthProvider) {
  const [user, setUser] = useState<IUser>({} as IUser);
  const isAuthenticated = !!user;

  useEffect(() => {
    const { "@nextauth:token": token } = parseCookies();

    if (token) {
      api.get("/me")
        .then(response => {
          const { email, permissions, rules } = response.data;
          setUser({ email, permissions, rules })
        })
        .catch(() => {
          signOut();
        })
    }

  }, []);


  async function signIn({ email, password }: ISignInCredentials) {
    try {
      const response = await api.post("sessions", {
        email, password
      });

      const { rules, permissions, token, refreshToken } = response.data;

      setCookie(undefined, '@nextauth:token', token, {
        maxAge: 60 * 60 * 24 * 30, // 30dias,
        path: "/"
      });
      setCookie(undefined, '@nextauth:refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30dias,
        path: "/"
      });

      setUser({
        email,
        rules,
        permissions
      })

      api.defaults.headers['Authorization'] = `Bearer ${token}`;


      Router.push("/dashboard")
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <AuthContext.Provider value={{
      signIn,
      isAuthenticated,
      user
    }}>
      {children}
    </AuthContext.Provider>
  )
}
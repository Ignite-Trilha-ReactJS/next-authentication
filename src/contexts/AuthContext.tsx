import { createContext, ReactNode, useState, useEffect } from "react";

import Router from 'next/router';

import { setCookie, parseCookies, destroyCookie } from 'nookies'

import { api } from "../services/apiClient";
import { channel } from "diagnostic_channel";


interface IUser {
  email: string;
  permissions: string[];
  roles: string[];
}

interface ISignInCredentials {
  email: string;
  password: string;
}

interface IAuthContextData {
  signOut(): void;
  signIn(credentials: ISignInCredentials): Promise<void>;
  isAuthenticated: boolean;
  user: IUser | undefined;
}

interface IAuthProvider {
  children: ReactNode;
}


export const AuthContext = createContext({} as IAuthContextData);

let authChannel: BroadcastChannel;

export function signOut() {
  destroyCookie(undefined, '@nextauth:token');
  destroyCookie(undefined, '@nextauth:refreshToken');

  authChannel.postMessage("signout");

  Router.push('/');
}

export function AuthProvider({ children }: IAuthProvider) {
  const [user, setUser] = useState<IUser>();
  const isAuthenticated = Boolean(user);

  useEffect(() => {
    authChannel = new BroadcastChannel("auth");

    authChannel.onmessage = (message) => {
      switch (message.data) {
        case 'signout':
          signOut();
          break;

        case 'signin':
          Router.push("/dashboard");
          break;

        default:
          break;
      }
    }
  }, [])

  useEffect(() => {
    const { "@nextauth:token": token } = parseCookies();

    if (token) {
      api.get("/me")
        .then(response => {
          const { email, permissions, roles } = response.data;
          setUser({ email, permissions, roles })
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

      const { roles, permissions, token, refreshToken } = response.data;

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
        roles,
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
      signOut,
      isAuthenticated,
      user
    }}>
      {children}
    </AuthContext.Provider>
  )
}
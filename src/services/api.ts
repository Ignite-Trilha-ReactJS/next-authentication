import axios, { AxiosError } from 'axios'
import { parseCookies, setCookie } from 'nookies'

import { signOut } from '../contexts/AuthContext';
import { AuthTokenError } from '../errors/AuthTokenError';


let isRefreshing = false;
let failedRequestKill: any[] = [];

export function setupApiClient(ctx: any = undefined) {
  let cookies = parseCookies(ctx);

  const api = axios.create({
    baseURL: "http://localhost:3333",
    headers: {
      Authorization: `Bearer ${cookies['@nextauth:token']}`
    }
  });


  api.interceptors.response.use(response => response, (error: AxiosError) => {
    if (error ?.response.status == 401) {
      if (String(error ?.response.data.code).toUpperCase() == "TOKEN.EXPIRED") {
        //Renovar token

        cookies = parseCookies(ctx);
        const { "@nextauth:refreshToken": refreshToken } = cookies;
        const originalConfig = error.config;


        if (!isRefreshing) {
          isRefreshing = true;

          api.post("/refresh", { refreshToken })
            .then(response => {
              const { token } = response.data;

              setCookie(ctx, '@nextauth:token', token, {
                maxAge: 60 * 60 * 24 * 30, // 30dias,
                path: "/"
              });
              setCookie(ctx, '@nextauth:refreshToken', response.data.refreshToken, {
                maxAge: 60 * 60 * 24 * 30, // 30dias,
                path: "/"
              });

              api.defaults.headers['Authorization'] = `Bearer ${token}`;

              failedRequestKill.forEach(request => request.onSucess(token));
              failedRequestKill = [];
            }).catch(error => {
              failedRequestKill.forEach(request => request.onFailure(error));
              failedRequestKill = [];

              if (process.browser) {
                signOut();
              } else {
                return Promise.reject(new AuthTokenError());
              }
            }).finally(() => {
              isRefreshing = false
            })
        }

        return new Promise((resolve, reject) => {
          failedRequestKill.push({
            onSucess: (token: string) => {
              originalConfig.headers["Authorization"] = `Bearer ${token}`;
              resolve(api(originalConfig))
            },
            onFailure: (error: AxiosError) => { reject(error) }
          })
        })

      } else {
        //Deslogar usuário
        if (process.browser) {
          signOut();
        }
      }
    }

    return Promise.reject(error);
  })

  return api
}


import axios, { AxiosError } from 'axios'
import { parseCookies, setCookie } from 'nookies'


let cookies = parseCookies();
let isRefreshing = false;
let failedRequestKill: any[] = [];

export const api = axios.create({
  baseURL: "http://localhost:3333",
  headers: {
    Authorization: `Bearer ${cookies['@nextauth:token']}`
  }
});


api.interceptors.response.use(response => response, (error: AxiosError) => {
  if (error ?.response.status == 401) {
    if (error ?.response.data.code) {
      //Renovar token

      cookies = parseCookies();
      const { "@nextauth:refreshToken": refreshToken } = cookies;
      const originalConfig = error.config;


      if (!isRefreshing) {
        isRefreshing = true;

        api.post("/refresh", { refreshToken })
          .then(response => {
            const { token } = response.data;

            setCookie(undefined, '@nextauth:token', token, {
              maxAge: 60 * 60 * 24 * 30, // 30dias,
              path: "/"
            });
            setCookie(undefined, '@nextauth:refreshToken', response.data.refreshToken, {
              maxAge: 60 * 60 * 24 * 30, // 30dias,
              path: "/"
            });

            api.defaults.headers['Authorization'] = `Bearer ${token}`;

            failedRequestKill.forEach(request => request.onSucess(token));
            failedRequestKill = [];
          }).catch(error => {
            failedRequestKill.forEach(request => request.onFailure(error));
            failedRequestKill = [];
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
    }
  }
})

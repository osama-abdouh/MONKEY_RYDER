import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token'); // o sessionStorage
  console.log('Interceptor called, token:', token ? 'Present' : 'Missing'); // Aggiungi questo

  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
    console.log('Authorization header set'); // Aggiungi questo
    return next(cloned);
  }

  console.log('No token, proceeding without auth'); // Aggiungi questo
  return next(req);
};

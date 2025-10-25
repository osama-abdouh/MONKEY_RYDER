import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  console.log('Interceptor called, token:', token ? 'Present' : 'Missing');

  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
    console.log('Authorization header set');
    return next(cloned);
  }

  console.log('No token, proceeding without auth');
  return next(req);
};
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from "@angular/common/http";
import { catchError, EMPTY, Observable, throwError } from "rxjs";
import { inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { LoginService } from "../services/login.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  router = inject(Router);

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const loginService = inject(LoginService);
    const creds = loginService.getCredentials();

    const authHeader = "Basic " + btoa(`${creds.username}:${creds.password}`);

    const authReq = request.clone({
      setHeaders: {
        Authorization: authHeader,
      },
    });

    return next.handle(authReq).pipe(
      catchError((err: HttpResponse<any>) => {
        if (err.status === 401) {
          console.log("Unauthorized");
          loginService.logout();
          this.router.navigate(["/login"]);
          return EMPTY;
        }
        return throwError(() => err);
      })
    );
  }
}

import { inject, Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class LoginService {
  router = inject(Router);

  login$ = new BehaviorSubject<boolean>(false);

  constructor() {
    if (this.hasCredentials()) {
      this.login$.next(true);
    }
  }

  login(username: string, password: string) {
    localStorage.setItem("username", username);
    localStorage.setItem("password", password);
    this.login$.next(true);

    this.router.navigate(["mappings"]);
  }

  logout() {
    localStorage.removeItem("username");
    localStorage.removeItem("password");
    this.login$.next(false);

    this.router.navigate(["login"]);
  }

  getCredentials() {
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");
    return {
      username: username,
      password: password,
    };
  }

  hasCredentials() {
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");

    return username && password;
  }
}

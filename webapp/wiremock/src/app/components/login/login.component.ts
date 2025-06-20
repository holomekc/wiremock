import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { LoginService } from "../../services/login.service";
import { Router } from "@angular/router";

@Component({
  selector: "wm-login",
  imports: [FormsModule],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
})
export class LoginComponent {
  loginService = inject(LoginService);
  router = inject(Router);

  username: string = "";
  password: string = "";

  login() {
    this.loginService.login(this.username, this.password);
  }
}

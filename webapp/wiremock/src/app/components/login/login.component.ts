import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { LoginService } from "../../services/login.service";
import { Router } from "@angular/router";
import { NgIf } from "@angular/common";
import { NgbDropdown, NgbDropdownMenu, NgbDropdownToggle } from "@ng-bootstrap/ng-bootstrap";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";

@Component({
  selector: "wm-login",
  imports: [FormsModule, NgIf, NgbDropdown, NgbDropdownToggle, FaIconComponent, NgbDropdownMenu],
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

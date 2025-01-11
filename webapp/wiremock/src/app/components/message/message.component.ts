import { Component } from "@angular/core";
import { Message, MessageService, MessageType } from "./message.service";

@Component({
  selector: "wm-message",
  templateUrl: "./message.component.html",
  styleUrls: ["./message.component.scss"],
  standalone: false,
})
export class MessageComponent {
  messages: Message[] = [];

  type = MessageType;

  constructor(private messageService: MessageService) {
    this.messages = [];
    this.messageService.getSubject().subscribe(next => {
      if (next) {
        this.messages.push(next);
      }
    });
  }

  remove(message: Message) {
    this.messages = this.messages.filter(m => m != message);
  }
}

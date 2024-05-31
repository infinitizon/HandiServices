import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-chat-pane',
  templateUrl: './chat-pane.component.html',
  styleUrls: ['./chat-pane.component.scss']
})
export class ChatPaneComponent implements OnInit {

  @Input('chats') chats: any;
  @Input('user') user: any;
  @Input('sessionId') sessionId: any;
  @Output() chatted = new EventEmitter<any>();
  @ViewChild('chatPane') private myChatPane: ElementRef;

  msgForm!: FormGroup;
  container = {
    showtime: false
  }

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.msgForm = this.fb.group({
      message: [null, [Validators.required ],],
    });
    this.scrollToBottom();
  }
  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
        this.myChatPane.nativeElement.scrollTop = this.myChatPane.nativeElement.scrollHeight;
    } catch(err) { }
  }

  onChatSubmit(chat: any) {
    chat = { ...chat, userId: this.user?.id, timestamp: new Date().toString(), strike: false, sessionId: this.sessionId};
    this.chats = [...this.chats, chat];
    this.msgForm.patchValue({message: null});

    this.chatted.emit(chat);
    this.saveChat(chat);
  }
  saveChat(chat: any) {
    this.http.post(`${environment.baseApiUrl}/chats/messages`, chat)
              .subscribe({
                next: (response: any) => {
                  chat.delivered = true;
                },
                error: (err: any) => {
                  chat.strike = true
                }
              })
  }

}

import { ChangeDetectionStrategy, Component, Input, OnInit, } from '@angular/core';
import { MatDialog, } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { Socket } from 'ngx-socket-io';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { environment } from '@environments/environment';
import { CommonService } from '@app/_shared/services/common.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent implements OnInit {
  // https://www.youtube.com/watch?v=cUNmtRNc-8s
  chats = new Array
  container = {};

  @Input() data: any;

  constructor(
    public dialog: MatDialog,
    private commonServices: CommonService,
    private appContext: ApplicationContextService,
    private socket: Socket,
    private http: HttpClient,
  ) {

  }
  ngOnInit() {
    this.socket.connect()
    this.appContext
      .getUserInformation()
      .subscribe((user: any) => {
        this.container['user'] = user;
      });
    this.startSession();
    this.socket.on(`getMessage`, (msg) =>{
      if(msg.userId != this.container['user'].id)
        this.chats = [...this.chats, msg];
    })
  }
  startSession() {
    this.chats = [];
    const session = { sessionId: this.data.id, tenantId: this.data?.Tenant?.id }
    this.http.post(`${environment.baseApiUrl}/chats/claim-session`, {session})
              .subscribe({
                next: (response: any) => {
                  this.container['startSessMsg'] = null;

                  this.socket.emit(`joinRoom`, {userId: this.container['user'].id, sessionId: this.data.id })
                  this.container['session'] = response.data;
                  this.getChatHistory(session)
                },
                error: (err: any) => {
                  const msg = `Error claiming session: ${err.message}`;
                  this.container['startSessMsg'] = msg;
                  this.commonServices.snackBar(msg, 'error')
                }
              })
  }

  chatted(chat: any) {
    this.socket.emit(`sendMessage`, chat)
  }

  getChatHistory(session) {
    this.http.post(`${environment.baseApiUrl}/chats/history`, session)
            .subscribe({
              next: (response: any) => {
                console.log(`Got history...`, session, this.container['session'], response.data);
                this.chats = [...response.data];
              },
              error: (err: any) => {
                this.commonServices.snackBar(err.msg, 'error')
              }
            })

  }

  ngOnDestroy() {
    this.socket.disconnect()
  }
}

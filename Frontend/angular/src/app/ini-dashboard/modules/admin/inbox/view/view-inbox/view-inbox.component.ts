import { HttpClient } from '@angular/common/http';
import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { environment } from '@environments/environment';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { CommonService } from '@app/_shared/services/common.service';
import { Socket } from 'ngx-socket-io';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-view-inbox',
  templateUrl: './view-inbox.component.html',
  styleUrls: ['./view-inbox.component.scss'],
})
export class ViewInboxComponent implements OnInit {
  @Input() data: any;
  @ViewChild('search') searchElementRef: ElementRef = {
    nativeElement: undefined,
  };
  container: any = {
    countdown: 20,
  };
  userInformation!: any;
  chats = new Array

  submitting = false;
  id: any;
  categories: any;
  constructor(
    private http: HttpClient,
    private commonServices: CommonService,
    public appContext: ApplicationContextService,
    private socket: Socket,
  ) {
  }

  ngOnInit() {
    this.socket.connect()
    this.appContext
      .getUserInformation()
      .pipe(switchMap((user: any)=>{
        this.container['user'] = user;
        return  this.http.get(`${environment.baseApiUrl}/chats/get-sessions`);
      }))
      .subscribe({
            next: (response: any) => {
              this.container['sessions'] = response.data
              this.container['sessions'].forEach(session => {
                this.socket.emit(`joinRoom`, {userId: this.container['user']?.id, sessionId: session.sessionId })
              });
            },
            error: (err: any) => {
            }
      });

      this.socket.on(`getOnlineUsers`, (onlineUsers) =>{
        this.container.onlineUsers = onlineUsers;
      })
      this.socket.on(`getMessage`, (msg) =>{
        if(msg.userId != this.container['user'].id && this.container['session'] == msg.sessionId) this.chats = [...this.chats, msg];
        const owner = this.container['sessions'].find(sess=>sess.sessionId == msg.sessionId)
        owner.message = msg.message
        owner.timestamp = msg.timestamp
        owner.count = (owner.count||0 )+ 1
      })
  }

  isOnline(session) {
    return this.container?.onlineUsers?.some(user=>user?.userId===session?.Customer?.id)
  }

  startSession(session: any) {
    console.log(session?.Admin?.id, this.container['user'].id)
    this.container['startSessMsg'] = `Claiming Session`;
    this.chats = [];
    if(session?.Admin) {
      if(session?.Admin?.id === this.container['user'].id) {
        this.container['startSessMsg'] = null;
        this.container['session'] = session?.sessionId;
        this.getChatHistory(session)
        // this.container['sessionUsers'] = { sessionId: this.data.id, participants: [{userId: this.container['user']?.id, tenantId: this.data.Tenant?.id}] }
      } else {
        const msg = `Session already being handled by ${session?.Admin?.firstName} ${session?.Admin?.lastName}`;
        this.container['startSessMsg'] = msg;
        return this.commonServices.snackBar(msg, 'error')
      }
    } else {
      this.http.post(`${environment.baseApiUrl}/chats/claim-session`, {session})
              .subscribe({
                next: (response: any) => {
                  this.container['startSessMsg'] = null;
                  this.container['session'] = session?.sessionId;
                  this.getChatHistory(session)
                  // this.socket.emit(`addNewUser`, {userId:this.container['user'].id, sessionId: session?.sessionId})
                },
                error: (err: any) => {
                  const msg = `Error claiming session: ${err.message}`;
                  this.container['startSessMsg'] = msg;
                  this.commonServices.snackBar(msg, 'error')
                }
              })
    }
  }
  getChatHistory(session) {
    this.http.post(`${environment.baseApiUrl}/chats/history`, session)
            .subscribe({
              next: (response: any) => {
                this.chats = response.data;
              },
              error: (err: any) => {
                this.commonServices.snackBar(err.msg, 'error')
              }
            })

  }
  chatted(chat: any) {
    this.socket.emit(`sendMessage`, chat)
  }

  ngOnDestroy() {
    this.socket.disconnect()
  }
}

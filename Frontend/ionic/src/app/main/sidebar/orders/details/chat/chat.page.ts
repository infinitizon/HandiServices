import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IonContent, NavController, ToastController } from '@ionic/angular';

import { Socket } from 'ngx-socket-io';
import { environment } from '@environments/environment';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { IChatMsg } from '@app/_shared/models/chat-msg.interface';
import { ActivatedRoute } from '@angular/router';
import { of, switchMap, take, throwError } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit, AfterViewInit {

  @ViewChild('content') content!: IonContent;

  chats!: IChatMsg[];
  msgForm!: FormGroup;
  chatSession: any;
  loggedInUser: any;
  container = {
    orderId: '',
    tenantId: '',
    user: {}
  };

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private aRoute: ActivatedRoute,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private socket: Socket,
    private appCtx: ApplicationContextService,
  ) { }

  ngOnInit() {
    console.log(`Entered ngOnInit`);

    this.msgForm = this.fb.group({
      message: [null, [Validators.required ],],
    });

    this.socket.connect();
    this.aRoute.paramMap
        .pipe(
          take(1),
          switchMap((params: any)=>{
            if(!params.has('orderId')) {
              this.navCtrl.navigateBack('/main/orders');
              return throwError(() => new Error(`You arrived here mistakenly`));
            }
            this.container.orderId = params.get('orderId') || '';
            this.container.tenantId = params.get('tenantId') || '';

            return this.appCtx.getUserInformation()
          }),
          take(1),
          switchMap((user: any)=>{
            if(!user) {
              return this.http.get(`${environment.baseApiUrl}/users`)
            }
            return of({data: user})
          }),
          take(1),
        )
        .subscribe((user: any)=>{
          this.loggedInUser = user?.data;
          this.startSession();
        })
    this.socket.on(`getMessage`, (msg: IChatMsg) =>{
      console.log(msg);

    })
  }
  ngAfterViewInit() {
    this.content.scrollToBottom();
  }

  startSession() {
    this.chats = [];
    const session = { orderId: this.container.orderId, tenantId: this.container.tenantId }
    this.http.post(`${environment.baseApiUrl}/chats/claim-session`, {session})
        .pipe(take(1))
        .subscribe({
          next: (response: any) => {
            this.chatSession = response.data;

            this.socket.emit(`joinRoom`, {userId: this.loggedInUser?.id, sessionId: this.chatSession.id })
            this.getChatHistory(session)
          },
          error: async (err: any) => {
            const toastEl = await this.toastCtrl.create({ message: `Error creating a chat session`, duration: 3500, color: 'danger'});
            await toastEl.present();
          }
        })
  }

  getChatHistory(session: any) {
    this.http.post(`${environment.baseApiUrl}/chats/history`, session)
            .subscribe({
              next: (response: any) => {
                console.log(`Got history...`, session, this.chatSession, response.data);
                this.chats = [...response.data];
                this.content.scrollToBottom();
              },
              error: async (err: any) => {
                const toastEl = await this.toastCtrl.create({ message: `Error fetching your chat history`, duration: 3500, color: 'danger'});
                await toastEl.present();
              }
            })

  }
  onChatSubmit(chat: any) {

    chat = { ...chat, userId: this.loggedInUser?.id, timestamp: new Date().toString(), strike: false, sessionId: this.chatSession?.id};
    this.chats = [...this.chats, chat];
    console.log(this.chats);

    this.msgForm.patchValue({message: null});

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
  ionViewDidLeave() {
    this.socket.disconnect()
  }
}

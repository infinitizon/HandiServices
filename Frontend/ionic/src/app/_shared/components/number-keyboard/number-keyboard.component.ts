import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormErrors, ValidationMessages } from './number-keyboard.validators';
import { CommonService } from '@app/_shared/services/common.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-number-keyboard',
  templateUrl: './number-keyboard.component.html',
  styleUrls: ['./number-keyboard.component.scss'],
})
export class NumberKeyboardComponent {

  amount = '0';
  value = new EventEmitter<number>();

  constructor(
    private toastCtrl: ToastController,
  ) { }

  addNumber(value: number|string) {
    let parts = (this.amount+"").split(".");
    if(parts[1]?.length == 2 && value!=='backspace') return;
    if(typeof value==='number') {
      if(this.amount === '0') {
        this.amount = ''+value;
        return;
      } ;
      if(parts[1]) {
        parts[1] = parseInt(parts[1] +''+value).toString()
        this.amount = parts[0]+'.'+parts[1];
        return;
      }
      this.amount = parseFloat(this.amount +''+value).toString()
    } else {
      if(value==='.') {
        this.amount = this.amount +value + '0'
      }
      if(value==='backspace') {
        this.amount = this.amount.slice(0, this.amount.slice(-1)==='.'?-2:-1);
        this.amount = this.amount==''?'0':this.amount;
      }
    }
  }

  onSubmit() {
    if(this.amount === '0') {
      this.toastCtrl.create({
        message: `Please enter a valid amount`, duration: 3000, color: 'danger', position: 'top',
      }).then(toastEl=>{
        toastEl.present();
      })
      return;
    }
    this.value.emit(parseFloat(this.amount));
  }
}

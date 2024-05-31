import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'in-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss']
})
export class MessageDialogComponent implements OnInit {


  constructor(
    public _dialogRef: MatDialogRef<MessageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      faIcon: any,
      image: string,
      title: string,
      acceptButtonText: string,
      cancelButtonText: string,
      message: string
    }) { }

  ngOnInit(): void {
    this._dialogRef.disableClose = true;
  }

  accept() {
    this._dialogRef.close(true);
  }
}

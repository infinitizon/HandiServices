import { group } from '@angular/animations';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.page.html',
  styleUrls: ['./faq.page.scss'],
})
export class FaqPage implements OnInit {

  faqs = [
    {
      id: 'first',
      group: {
        header: `Can I buy multiple times?`,
        content: `Yes, you can buy multiple times on a single vendor. Different vendors will require different orders`
      }
    },
    {
      id: 'second',
      group: {
        header: `What do i do when a transaction fails?`,
        content: `If a transaction fails and you have not been debited, you can simply retry the transaction. If you have been debited however, please send an email to us at info@homeservices.ng.`
      }
    },
    {
      id: 'third',
      group: {
        header: `How long would it take for my settlement to arrive?`,
        content: `Settlements for transactions happen on T+1. This means if you pay today, we get the money tomorrow.
              However, we notify the vendor of your transaction and give you value for the transaction immediately.`
      }
    },
  ]
  constructor() { }

  ngOnInit() {
    const x=0;
  }

}

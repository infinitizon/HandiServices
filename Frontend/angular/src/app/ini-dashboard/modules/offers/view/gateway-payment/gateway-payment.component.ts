import { Component, OnInit } from '@angular/core';
import { OffersService } from '../../offers.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gateway-payment',
  templateUrl: './gateway-payment.component.html',
  styleUrls: ['./gateway-payment.component.scss']
})
export class GatewayPaymentComponent implements OnInit {

  gatewayDetails!: any;

  constructor(
    public offerService: OffersService,
    private router: Router
  ) { }

  ngOnInit() {
    this.gatewayDetails = this.offerService.gatewayDetails;
    console.log(this.offerService.gatewayDetails);
    if(Object.keys(this.gatewayDetails).length === 0) {
      this.router.navigate(['/app/home/'])
    }
  }

}

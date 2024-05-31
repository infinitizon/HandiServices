import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletComponent } from './wallet.component';
import { SharedModule } from '@app/_shared/shared.module';
import { ViewWalletComponent } from './view/view-wallet/view-wallet.component';
import { WalletRoutingModule } from './wallet-routing.module';
import { HomeComponent } from './view/home/home.component';
import { BanksComponent } from './view/banks/banks.component';
import { CreateBankComponent } from './add/create-bank/create-bank.component';
import { WithdrawComponent } from './add/withdraw/withdraw.component';
import { TransactionsComponent } from './view/transactions/transactions.component';
import { UtilitiesComponent } from './view/utilities/utilities.component';
import { PurchaseAirtimeComponent } from './add/purchase-airtime/purchase-airtime.component';
import { PurchaseElectricityComponent } from './add/purchase-electricity/purchase-electricity.component';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    WalletRoutingModule
  ],
  declarations: [
    WalletComponent,
    ViewWalletComponent,
    HomeComponent,
    BanksComponent,
    CreateBankComponent,
    WithdrawComponent,
    TransactionsComponent,
    UtilitiesComponent,
    PurchaseAirtimeComponent,
    PurchaseElectricityComponent
  ]
})
export class WalletModule { }

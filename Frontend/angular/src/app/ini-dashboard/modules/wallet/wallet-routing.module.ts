import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WalletComponent } from './wallet.component';
import { ViewWalletComponent } from './view/view-wallet/view-wallet.component';
import { HomeComponent } from './view/home/home.component';
import { BanksComponent } from './view/banks/banks.component';
import { CreateBankComponent } from './add/create-bank/create-bank.component';
import { WithdrawComponent } from './add/withdraw/withdraw.component';
import { TransactionsComponent } from './view/transactions/transactions.component';
import { UtilitiesComponent } from './view/utilities/utilities.component';
import { PurchaseAirtimeComponent } from './add/purchase-airtime/purchase-airtime.component';
import { PurchaseElectricityComponent } from './add/purchase-electricity/purchase-electricity.component';

const routes: Routes = [
  {
    path: '',
    component: WalletComponent,
    children: [
      {
        path: 'view',
        component: HomeComponent
      },
      {
        path: 'banks-list',
        component: BanksComponent
      },
      {
        path: 'create-bank',
        component: CreateBankComponent
      },
      {
        path: 'withdraw',
        component: WithdrawComponent
      },
      {
        path: 'transactions',
        component: TransactionsComponent
      },
      {
        path: 'utilities',
        component: UtilitiesComponent
      },
      {
        path: 'purchase-airtime',
        component: PurchaseAirtimeComponent
      },
      {
        path: 'purchase-electricity',
        component: PurchaseElectricityComponent
      },
      { path: '', redirectTo: 'view', pathMatch: 'full' }
    ]
   },
   { path: '', redirectTo: '/app/wallet/view', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WalletRoutingModule { }

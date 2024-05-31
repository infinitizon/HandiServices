import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProfileComponent } from './profile.component';
import { ProfileContainerComponent } from './profile-container/profile-container.component';

const routes: Routes = [
  {
    path: '',
    component: ProfileComponent,
    children: [
      {
        path: 'view',
        component: ProfileContainerComponent
      },
      { path: '', redirectTo: 'view', pathMatch: 'full' }
    ]
   },
   { path: '', redirectTo: '/app/profile/view', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }

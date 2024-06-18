import { Component, OnInit } from '@angular/core';
import { register } from 'swiper/element/bundle';
import { StorageService } from '@app/_shared/services/storage.service';

register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private storageService: StorageService,
  ) {}

  onLogout() {
    console.log(`I'm logging out`);
  }
  async ngOnInit() {
    await this.storageService.remove('vendor');
  }
}

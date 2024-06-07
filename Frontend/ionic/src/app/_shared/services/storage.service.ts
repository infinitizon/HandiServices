import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(
    private storage: Storage
  ) {
    this.initStorage();
  }

  async initStorage() {
    await this.storage.create()
  }

  async set(key: string, value: any) {
    await this.storage.set(key, value);
  }

  async get(key: string) {
    const value = await this.storage.get(key);
    return value;
    // return this.storage.get(key)
  }
  async remove(key: string) {
    return this.storage.remove(key);
  }
}

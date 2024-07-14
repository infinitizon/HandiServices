import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';

export type Maps = typeof google.maps;

@Injectable({
  providedIn: 'root'
})
export class GMapService {
  public readonly api = this.load();

  script: any;
  private async load(): Promise<Maps> {
    this.script = document.createElement('script');
    this.script.type = 'text/javascript';
    this.script.async = true;
    this.script.defer = true;
    // tslint:disable-next-line:no-bitwise
    const callbackName = `GooglePlaces_cb_` + ((Math.random() * 1e9) >>> 0);
    this.script.src = this.getScriptSrc(callbackName);

    interface MyWindow { [name: string]: Function; };
    const myWindow: MyWindow = window as any;

    const promise = new Promise((resolve, reject) => {
      myWindow[callbackName] = resolve;
      this.script.onerror = reject;
    });
    document.body.appendChild(this.script);
    await promise;
    return google.maps;
  }


  private getScriptSrc(callback: string): string {
    interface QueryParams { [key: string]: string; };
    const query: QueryParams = {
      v: '3',
      callback,
      key: environment.GOOGLE_MAPS_API_KEY,
      libraries: 'places',
    };
    const params = Object.keys(query).map(key => `${key}=${query[key]}`).join('&');
    return `//maps.googleapis.com/maps/api/js?${params}`;
  }

  getAddresses(address_components: any) {
    let address: any = {}
    for(var i = 0; i < address_components.length; i += 1) {
      var addressObj = address_components[i];
      if(addressObj.types.includes('street_number')) {
        address['number'] = addressObj.short_name;
        address['houseNo'] = addressObj.short_name;
      }
      if(addressObj.types.includes('route')) {
        address['address1'] = addressObj.short_name;
      }
      if(addressObj.types.includes('administrative_area_level_2')) {
        address['lga'] = addressObj.short_name;
      }
      if(addressObj.types.includes('administrative_area_level_3')) {
        address['address2'] = addressObj.short_name;
      }
      if(addressObj.types.includes('neighborhood')) {
        address['city'] = addressObj.short_name;
      }
      if(addressObj.types.includes('postal_code')) {
        address['postal_code'] = addressObj.short_name;
      }
      if(addressObj.types.includes('administrative_area_level_1')) {
        address['state'] = {code: addressObj.short_name, name: addressObj.long_name};
      }
      if(addressObj.types.includes('country')) {
        address['country'] = {code: addressObj.short_name, name: addressObj.long_name};
      }
    }
    return address;
  }

  remove(): void {
    // this should be called in OnDestroy
    if(this.script) document.body.removeChild(this.script);
  }
}

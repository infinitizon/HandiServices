import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, of, switchMap, take } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { ToastController } from '@ionic/angular';
import { FingerprintAIO } from '@awesome-cordova-plugins/fingerprint-aio';
import { IAddress } from '../models/address.interface';
import { GMapService, Maps } from './google-map.service';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApplicationContextService {
  countries = [
    { code: "AD", country: "Andorra", nationality: "Andorran", states: [] }, { code: "AE", country: "United Arab Emirates", nationality: "Emirati", states: [] }, { code: "AF", country: "Afghanistan", nationality: "Afghan", states: [] }, { code: "AG", country: "Antigua and Barbuda", nationality: "Antiguan, Barbudan", states: [] }, { code: "AI", country: "Anguilla", nationality: "Anguillian", states: [] }, { code: "AL", country: "Albania", nationality: "Albanian", states: [] }, { code: "AM", country: "Armenia", nationality: "Armenian", states: [] }, { code: "AN", country: "Netherlands Antilles", nationality: "Dutch", states: [] }, { code: "AO", country: "Angola", nationality: "Angolan", states: [] }, { code: "AQ", country: "Antarctica", nationality: "???", states: [] }, { code: "AR", country: "Argentina", nationality: "Argentinean", states: [] }, { code: "AS", country: "American Samoa", nationality: "American Samoan", states: [] }, { code: "AT", country: "Austria", nationality: "Austrian", states: [] }, { code: "AU", country: "Australia", nationality: "Australian", states: [] }, { code: "AW", country: "Aruba", nationality: "Aruban", states: [] }, { code: "AX", country: "Åland Islands", nationality: "Swedish", states: [] }, { code: "AZ", country: "Azerbaijan", nationality: "Azerbaijani", states: [] }
    , { code: "BA", country: "Bosnia and Herzegovina", nationality: "Bosnian, Herzegovinian", states: [] }, { code: "BB", country: "Barbados", nationality: "Barbadian", states: [] }, { code: "BD", country: "Bangladesh", nationality: "Bangladeshi", states: [] }, { code: "BE", country: "Belgium", nationality: "Belgian", states: [] }, { code: "BF", country: "Burkina Faso", nationality: "Burkinabe", states: [] }, { code: "BG", country: "Bulgaria", nationality: "Bulgarian", states: [] }, { code: "BH", country: "Bahrain", nationality: "Bahraini", states: [] }, { code: "BI", country: "Burundi", nationality: "Burundian", states: [] }, { code: "BJ", country: "Benin", nationality: "Beninese", states: [] }, { code: "BL", country: "Saint Barthélemy", nationality: "Saint Barthélemy Islander", states: [] }, { code: "BM", country: "Bermuda", nationality: "Bermudian", states: [] }, { code: "BN", country: "Brunei", nationality: "Bruneian", states: [] }, { code: "BO", country: "Bolivia", nationality: "Bolivian", states: [] }, { code: "BQ", country: "British Antarctic Territory", nationality: "Dutch", states: [] }, { code: "BR", country: "Brazil", nationality: "Brazilian", states: [] }, { code: "BS", country: "Bahamas", nationality: "Bahamian", states: [] }, { code: "BT", country: "Bhutan", nationality: "Bhutanese", states: [] }, { code: "BV", country: "Bouvet Island", nationality: "???", states: [] }, { code: "BW", country: "Botswana", nationality: "Motswana", states: [] }, { code: "BY", country: "Belarus", nationality: "Belarusian", states: [] }, { code: "BZ", country: "Belize", nationality: "Belizean", states: [] }, { code: "CA", country: "Canada", nationality: "Canadian", states: [] }, { code: "CC", country: "Cocos [Keeling] Islands", nationality: "Cocos Islander", states: [] }, { code: "CD", country: "Congo - Kinshasa", nationality: "Congolese", states: [] }, { code: "CF", country: "Central African Republic", nationality: "Central African", states: [] }, { code: "CG", country: "Congo - Brazzaville", nationality: "Congolese", states: [] }, { code: "CH", country: "Switzerland", nationality: "Swiss", states: [] }, { code: "CI", country: "Côte d’Ivoire", nationality: "Ivorian", states: [] }, { code: "CK", country: "Cook Islands", nationality: "Cook Islander", states: [] }, { code: "CL", country: "Chile", nationality: "Chilean", states: [] }, { code: "CM", country: "Cameroon", nationality: "Cameroonian", states: [] }, { code: "CN", country: "China", nationality: "Chinese", states: [] }, { code: "CO", country: "Colombia", nationality: "Colombian", states: [] }, { code: "CR", country: "Costa Rica", nationality: "Costa Rican", states: [] }, { code: "CS", country: "Serbia and Montenegro", nationality: "Montenegrins, Serbs", states: [] }, { code: "CT", country: "Canton and Enderbury Islands", nationality: "???", states: [] }, { code: "CU", country: "Cuba", nationality: "Cuban", states: [] }, { code: "CV", country: "Cape Verde", nationality: "Cape Verdian", states: [] }, { code: "CW", country: "Curaçao", nationality: "Curaçaoan", states: [] }, { code: "CX", country: "Christmas Island", nationality: "Christmas Island", states: [] }
    , { code: "CY", country: "Cyprus", nationality: "Cypriot", states: [] }, { code: "CZ", country: "Czech Republic", nationality: "Czech", states: [] }, { code: "DE", country: "Germany", nationality: "German", states: [] }, { code: "DJ", country: "Djibouti", nationality: "Djibouti", states: [] }, { code: "DK", country: "Denmark", nationality: "Danish", states: [] }, { code: "DM", country: "Dominica", nationality: "Dominican", states: [] }, { code: "DO", country: "Dominican Republic", nationality: "Dominican", states: [] }, { code: "DZ", country: "Algeria", nationality: "Algerian", states: [] }, { code: "EC", country: "Ecuador", nationality: "Ecuadorean", states: [] }, { code: "EE", country: "Estonia", nationality: "Estonian", states: [] }, { code: "EG", country: "Egypt", nationality: "Egyptian", states: [] }, { code: "EH", country: "Western Sahara", nationality: "Sahrawi", states: [] }, { code: "ER", country: "Eritrea", nationality: "Eritrean", states: [] }, { code: "ES", country: "Spain", nationality: "Spanish", states: [] }, { code: "ET", country: "Ethiopia", nationality: "Ethiopian", states: [] }, { code: "FI", country: "Finland", nationality: "Finnish", states: [] }, { code: "FJ", country: "Fiji", nationality: "Fijian", states: [] }, { code: "FK", country: "Falkland Islands", nationality: "Falkland Islander", states: [] }, { code: "FM", country: "Micronesia", nationality: "Micronesian", states: [] }, { code: "FO", country: "Faroe Islands", nationality: "Faroese", states: [] }, { code: "FQ", country: "French Southern and Antarctic Territories", nationality: "???", states: [] }, { code: "FR", country: "France", nationality: "French", states: [] }, { code: "FX", country: "Metropolitan France", nationality: "???", states: [] }, { code: "GA", country: "Gabon", nationality: "Gabonese", states: [] }, { code: "GB", country: "United Kingdom", nationality: "British", states: [] }, { code: "GD", country: "Grenada", nationality: "Grenadian", states: [] }, { code: "GE", country: "Georgia", nationality: "Georgian", states: [] }, { code: "GF", country: "French Guiana", nationality: "???", states: [] }, { code: "GG", country: "Guernsey", nationality: "Channel Islander", states: [] }, { code: "GH", country: "Ghana", nationality: "Ghanaian", states: [] }, { code: "GI", country: "Gibraltar", nationality: "Gibraltar", states: [] }, { code: "GL", country: "Greenland", nationality: "Greenlandic", states: [] }, { code: "GM", country: "Gambia", nationality: "Gambian", states: [] }, { code: "GN", country: "Guinea", nationality: "Guinean", states: [] }, { code: "GP", country: "Guadeloupe", nationality: "Guadeloupian", states: [] }, { code: "GQ", country: "Equatorial Guinea", nationality: "Equatorial Guinean", states: [] }, { code: "GR", country: "Greece", nationality: "Greek", states: [] }, { code: "GS", country: "South Georgia and the South Sandwich Islands", nationality: "South Georgia and the South Sandwich Islander", states: [] }, { code: "GT", country: "Guatemala", nationality: "Guatemalan", states: [] }, { code: "GU", country: "Guam", nationality: "Guamanian", states: [] }, { code: "GW", country: "Guinea-Bissau", nationality: "Guinea-Bissauan", states: [] }
    , { code: "GY", country: "Guyana", nationality: "Guyanese", states: [] }, { code: "HK", country: "Hong Kong SAR China", nationality: "Chinese", states: [] }, { code: "HM", country: "Heard Island and McDonald Islands", nationality: "Heard and McDonald Islander", states: [] }, { code: "HN", country: "Honduras", nationality: "Honduran", states: [] }, { code: "HR", country: "Croatia", nationality: "Croatian", states: [] }, { code: "HT", country: "Haiti", nationality: "Haitian", states: [] }, { code: "HU", country: "Hungary", nationality: "Hungarian", states: [] }, { code: "ID", country: "Indonesia", nationality: "Indonesian", states: [] }, { code: "IE", country: "Ireland", nationality: "Irish", states: [] }, { code: "IL", country: "Israel", nationality: "Israeli", states: [] }, { code: "IM", country: "Isle of Man", nationality: "Manx", states: [] }, { code: "IN", country: "India", nationality: "Indian", states: [] }, { code: "IO", country: "British Indian Ocean Territory", nationality: "Indian", states: [] }, { code: "IQ", country: "Iraq", nationality: "Iraqi", states: [] }, { code: "IR", country: "Iran", nationality: "Iranian", states: [] }, { code: "IS", country: "Iceland", nationality: "Icelander", states: [] }, { code: "IT", country: "Italy", nationality: "Italian", states: [] }, { code: "JE", country: "Jersey", nationality: "Channel Islander", states: [] }, { code: "JM", country: "Jamaica", nationality: "Jamaican", states: [] }, { code: "JO", country: "Jordan", nationality: "Jordanian", states: [] }, { code: "JP", country: "Japan", nationality: "Japanese", states: [] }, { code: "JT", country: "Johnston Island", nationality: "???", states: [] }, { code: "KE", country: "Kenya", nationality: "Kenyan", states: [] }, { code: "KG", country: "Kyrgyzstan", nationality: "Kirghiz", states: [] }, { code: "KH", country: "Cambodia", nationality: "Cambodian", states: [] }, { code: "KI", country: "Kiribati", nationality: "I-Kiribati", states: [] }, { code: "KM", country: "Comoros", nationality: "Comoran", states: [] }, { code: "KN", country: "Saint Kitts and Nevis", nationality: "Kittian and Nevisian", states: [] }, { code: "KP", country: "North Korea", nationality: "North Korean", states: [] }, { code: "KR", country: "South Korea", nationality: "South Korean", states: [] }, { code: "KW", country: "Kuwait", nationality: "Kuwaiti", states: [] }, { code: "KY", country: "Cayman Islands", nationality: "Caymanian", states: [] }, { code: "KZ", country: "Kazakhstan", nationality: "Kazakhstani", states: [] }, { code: "LA", country: "Laos", nationality: "Laotian", states: [] }, { code: "LB", country: "Lebanon", nationality: "Lebanese", states: [] }, { code: "LC", country: "Saint Lucia", nationality: "Saint Lucian", states: [] }, { code: "LI", country: "Liechtenstein", nationality: "Liechtensteiner", states: [] }, { code: "LK", country: "Sri Lanka", nationality: "Sri Lankan", states: [] }, { code: "LR", country: "Liberia", nationality: "Liberian", states: [] }, { code: "LS", country: "Lesotho", nationality: "Mosotho", states: [] }, { code: "LT", country: "Lithuania", nationality: "Lithuanian", states: [] }, { code: "LU", country: "Luxembourg", nationality: "Luxembourger", states: [] }
    , { code: "LV", country: "Latvia", nationality: "Latvian", states: [] }, { code: "LY", country: "Libya", nationality: "Libyan", states: [] }, { code: "MA", country: "Morocco", nationality: "Moroccan", states: [] }, { code: "MC", country: "Monaco", nationality: "Monegasque", states: [] }, { code: "MD", country: "Moldova", nationality: "Moldovan", states: [] }, { code: "ME", country: "Montenegro", nationality: "Montenegrin", states: [] }, { code: "MF", country: "Saint Martin", nationality: "Saint Martin Islander", states: [] }, { code: "MG", country: "Madagascar", nationality: "Malagasy", states: [] }, { code: "MH", country: "Marshall Islands", nationality: "Marshallese", states: [] }, { code: "MI", country: "Midway Islands", nationality: "???", states: [] }, { code: "MK", country: "Macedonia", nationality: "Macedonian", states: [] }, { code: "ML", country: "Mali", nationality: "Malian", states: [] }, { code: "MM", country: "Myanmar [Burma]", nationality: "Myanmar", states: [] }, { code: "MN", country: "Mongolia", nationality: "Mongolian", states: [] }, { code: "MO", country: "Macau SAR China", nationality: "Chinese", states: [] }, { code: "MP", country: "Northern Mariana Islands", nationality: "American", states: [] }, { code: "MQ", country: "Martinique", nationality: "French", states: [] }, { code: "MR", country: "Mauritania", nationality: "Mauritanian", states: [] }, { code: "MS", country: "Montserrat", nationality: "Montserratian", states: [] }, { code: "MT", country: "Malta", nationality: "Maltese", states: [] }, { code: "MU", country: "Mauritius", nationality: "Mauritian", states: [] }, { code: "MV", country: "Maldives", nationality: "Maldivan", states: [] }, { code: "MW", country: "Malawi", nationality: "Malawian", states: [] }, { code: "MX", country: "Mexico", nationality: "Mexican", states: [] }, { code: "MY", country: "Malaysia", nationality: "Malaysian", states: [] }, { code: "MZ", country: "Mozambique", nationality: "Mozambican", states: [] }, { code: "NA", country: "Namibia", nationality: "Namibian", states: [] }, { code: "NC", country: "New Caledonia", nationality: "New Caledonian", states: [] }, { code: "NE", country: "Niger", nationality: "Nigerien", states: [] }, { code: "NF", country: "Norfolk Island", nationality: "Norfolk Islander", states: [] }
    , {
      code: "NG", country: "Nigeria", nationality: "Nigerian"
      , states: [
        { code: 'AB', name: 'Abia State' }, { code: 'FC', name: 'Abuja Federal Capital Territory State' }, { code: 'AD', name: 'Adamawa State' }, { code: 'AK', name: 'Akwa Ibom State' }, { code: 'AN', name: 'Anambra State' }, { code: 'BA', name: 'Bauchi State' }, { code: 'BY', name: 'Bayelsa State' }, { code: 'BE', name: 'Benue State' }, { code: 'BO', name: 'Borno State' }, { code: 'CR', name: 'Cross River State' }, { code: 'DE', name: 'Delta State' }, { code: 'EB', name: 'Ebonyi State' }, { code: 'ED', name: 'Edo State' }, { code: 'EK', name: 'Ekiti State' }, { code: 'EN', name: 'Enugu State' }, { code: 'GO', name: 'Gombe State' }, { code: 'IM', name: 'Imo State' }, { code: 'JI', name: 'Jigawa State' }, { code: 'KD', name: 'Kaduna State' }, { code: 'KN', name: 'Kano State' }, { code: 'KT', name: 'Katsina State' }, { code: 'KE', name: 'Kebbi State' }, { code: 'KO', name: 'Kogi State' }, { code: 'KW', name: 'Kwara State' }, { code: 'LA', name: 'Lagos State' }, { code: 'NA', name: 'Nasarawa State' }, { code: 'NI', name: 'Niger State' }, { code: 'OG', name: 'Ogun State' }, { code: 'ON', name: 'Ondo State' }, { code: 'OS', name: 'Osun State' }, { code: 'OY', name: 'Oyo State' }, { code: 'PL', name: 'Plateau State' }, { code: 'RI', name: 'Rivers State' }, { code: 'SO', name: 'Sokoto State' }, { code: 'TA', name: 'Taraba State' }, { code: 'YO', name: 'Yobe State' }, { code: 'ZA', name: 'Zamfara State' }
      ]
    }, { code: "NI", country: "Nicaragua", nationality: "Nicaraguan", states: [] }, { code: "NL", country: "Netherlands", nationality: "Dutch", states: [] }, { code: "NO", country: "Norway", nationality: "Norwegian", states: [] }, { code: "NP", country: "Nepal", nationality: "Nepalese", states: [] }, { code: "NQ", country: "Dronning Maud Land", nationality: "???", states: [] }, { code: "NR", country: "Nauru", nationality: "Nauruan", states: [] }, { code: "NT", country: "Neutral Zone", nationality: "???", states: [] }, { code: "NU", country: "Niue", nationality: "Niuean", states: [] }, { code: "NZ", country: "New Zealand", nationality: "New Zealander", states: [] }, { code: "OM", country: "Oman", nationality: "Omani", states: [] }, { code: "PA", country: "Panama", nationality: "Panamanian", states: [] }
    , { code: "PC", country: "Pacific Islands Trust Territory", nationality: "???", states: [] }, { code: "PE", country: "Peru", nationality: "Peruvian", states: [] }, { code: "PF", country: "French Polynesia", nationality: "French Polynesian", states: [] }, { code: "PG", country: "Papua New Guinea", nationality: "Papua New Guinean", states: [] }, { code: "PH", country: "Philippines", nationality: "Filipino", states: [] }, { code: "PK", country: "Pakistan", nationality: "Pakistani", states: [] }, { code: "PL", country: "Poland", nationality: "Polish", states: [] }, { code: "PM", country: "Saint Pierre and Miquelon", nationality: "French", states: [] }, { code: "PN", country: "Pitcairn Islands", nationality: "Pitcairn Islander", states: [] }, { code: "PR", country: "Puerto Rico", nationality: "Puerto Rican", states: [] }, { code: "PS", country: "Palestinian Territories", nationality: "Palestinian", states: [] }, { code: "PT", country: "Portugal", nationality: "Portuguese", states: [] }, { code: "PU", country: "U.S. Miscellaneous Pacific Islands", nationality: "???", states: [] }, { code: "PW", country: "Palau", nationality: "Palauan", states: [] }, { code: "PY", country: "Paraguay", nationality: "Paraguayan", states: [] }, { code: "PZ", country: "Panama Canal Zone", nationality: "???", states: [] }, { code: "QA", country: "Qatar", nationality: "Qatari", states: [] }, { code: "RE", country: "Réunion", nationality: "French", states: [] }, { code: "RO", country: "Romania", nationality: "Romanian", states: [] }, { code: "RS", country: "Serbia", nationality: "Serbian", states: [] }, { code: "RU", country: "Russia", nationality: "Russian", states: [] }, { code: "RW", country: "Rwanda", nationality: "Rwandan", states: [] }, { code: "SA", country: "Saudi Arabia", nationality: "Saudi Arabian", states: [] }, { code: "SB", country: "Solomon Islands", nationality: "Solomon Islander", states: [] }, { code: "SC", country: "Seychelles", nationality: "Seychellois", states: [] }, { code: "SD", country: "Sudan", nationality: "Sudanese", states: [] }, { code: "SE", country: "Sweden", nationality: "Swedish", states: [] }, { code: "SG", country: "Singapore", nationality: "Singaporean", states: [] }, { code: "SH", country: "Saint Helena", nationality: "Saint Helenian", states: [] }, { code: "SI", country: "Slovenia", nationality: "Slovene", states: [] }, { code: "SJ", country: "Svalbard and Jan Mayen", nationality: "Norwegian", states: [] }, { code: "SK", country: "Slovakia", nationality: "Slovak", states: [] }, { code: "SL", country: "Sierra Leone", nationality: "Sierra Leonean", states: [] }, { code: "SM", country: "San Marino", nationality: "Sammarinese", states: [] }, { code: "SN", country: "Senegal", nationality: "Senegalese", states: [] }, { code: "SO", country: "Somalia", nationality: "Somali", states: [] }, { code: "SR", country: "Suriname", nationality: "Surinamer", states: [] }, { code: "ST", country: "São Tomé and Príncipe", nationality: "Sao Tomean", states: [] }, { code: "SU", country: "Union of Soviet Socialist Republics", nationality: "???", states: [] }
    , { code: "SV", country: "El Salvador", nationality: "Salvadoran", states: [] }, { code: "SY", country: "Syria", nationality: "Syrian", states: [] }, { code: "SZ", country: "Swaziland", nationality: "Swazi", states: [] }, { code: "TC", country: "Turks and Caicos Islands", nationality: "Turks and Caicos Islander", states: [] }, { code: "TD", country: "Chad", nationality: "Chadian", states: [] }, { code: "TF", country: "French Southern Territories", nationality: "French", states: [] }, { code: "TG", country: "Togo", nationality: "Togolese", states: [] }, { code: "TH", country: "Thailand", nationality: "Thai", states: [] }, { code: "TJ", country: "Tajikistan", nationality: "Tadzhik", states: [] }, { code: "TK", country: "Tokelau", nationality: "Tokelauan", states: [] }, { code: "TL", country: "Timor-Leste", nationality: "East Timorese", states: [] }, { code: "TM", country: "Turkmenistan", nationality: "Turkmen", states: [] }, { code: "TN", country: "Tunisia", nationality: "Tunisian", states: [] }, { code: "TO", country: "Tonga", nationality: "Tongan", states: [] }, { code: "TR", country: "Turkey", nationality: "Turkish", states: [] }, { code: "TT", country: "Trinidad and Tobago", nationality: "Trinidadian", states: [] }, { code: "TV", country: "Tuvalu", nationality: "Tuvaluan", states: [] }, { code: "TW", country: "Taiwan", nationality: "Taiwanese", states: [] }, { code: "TZ", country: "Tanzania", nationality: "Tanzanian", states: [] }, { code: "UA", country: "Ukraine", nationality: "Ukrainian", states: [] }, { code: "UG", country: "Uganda", nationality: "Ugandan", states: [] }, { code: "UM", country: "U.S. Minor Outlying Islands", nationality: "American", states: [] }, { code: "US", country: "United States", nationality: "American", states: [] }, { code: "UY", country: "Uruguay", nationality: "Uruguayan", states: [] }, { code: "UZ", country: "Uzbekistan", nationality: "Uzbekistani", states: [] }, { code: "VA", country: "Vatican City", nationality: "Italian", states: [] }, { code: "VC", country: "Saint Vincent and the Grenadines", nationality: "Saint Vincentian", states: [] }, { code: "VD", country: "North Vietnam", nationality: "???", states: [] }, { code: "VE", country: "Venezuela", nationality: "Venezuelan", states: [] }, { code: "VG", country: "British Virgin Islands", nationality: "Virgin Islander", states: [] }, { code: "VI", country: "U.S. Virgin Islands", nationality: "Virgin Islander", states: [] }, { code: "VN", country: "Vietnam", nationality: "Vietnamese", states: [] }, { code: "VU", country: "Vanuatu", nationality: "Ni-Vanuatu", states: [] }, { code: "WF", country: "Wallis and Futuna", nationality: "Wallis and Futuna Islander", states: [] }, { code: "WK", country: "Wake Island", nationality: "???", states: [] }, { code: "WS", country: "Samoa", nationality: "Samoan", states: [] }, { code: "YE", country: "Yemen", nationality: "Yemeni", states: [] }, { code: "YT", country: "Mayotte", nationality: "French", states: [] }, { code: "ZA", country: "South Africa", nationality: "South African" }, { code: "ZM", country: "Zambia", nationality: "Zambian" }, { code: "ZW", country: "Zimbabwe", nationality: "Zimbabwean", states: [] }
  ];
  relationships: any = [
    {code: "husband", name: "Husband"},
    {code: "wife", name: "Wife"},
    {code: "son", name: "Son"},
    {code: "daughter", name: "Daughter"},
    {code: "brother", name: "Brother"},
    {code: "sister", name: "Sister"},
    {code: "parent", name: "Parent"},
    {code: "others", name: "Others"},
  ]



  private _notificationInformation: any;
  private _notificationInformationObs = new ReplaySubject(1);

  userInformation$ = new BehaviorSubject<any>(null);
  userRole$ = new BehaviorSubject<any>(null);
  location$ = new BehaviorSubject<IAddress>({})
  walletBalance$ = new BehaviorSubject<any>(null)

  constructor(
    private http: HttpClient,
    private toastCtrl: ToastController,
    private gMapService: GMapService,
  ) { }



  set notificationInformation(value) {
    this._notificationInformation = value;
    this._notificationInformationObs.next(value);
  }

  get notificationInformation() {
    return this._notificationInformation;
  }

  notificationInformationObs() {
    return this._notificationInformationObs.asObservable();
  }

   //-------------------- user Information-----------------------------//
  getUserInformation(): Observable<any> {
    return this.userInformation$.asObservable();
  }
  //-------------------------- user Information end --------------------------//

  getUserLocation(): Observable<any> {
    return this.location$.asObservable();
  }
  getWalletBalance(): Observable<any> {
    return this.walletBalance$.asObservable();
  }
  setUserInformation() {
    this.getUserInformation()
        .pipe(
          take(1),
          switchMap((user: any)=>{
            if(!user) {
              return this.http.get(`${environment.baseApiUrl}/users`)
            }
            return of({data: user})
          }),
          take(1),
        )
        .subscribe((user: any)=>{
          if (user) {
            console.log(`this.userInformation => `, user);
            this.userInformation$.next(user.data);
            this.userRole$.next(user.data?.Tenant[0].Roles[0].name);
          }
        })
  }
  setCurrentLocation() {
    this.gMapService.api.then(async (maps) => {
      this.setLocation(maps);
    });
  }
  setLocation(maps: Maps) {
    if(!Capacitor.isPluginAvailable('Geolocation')) {
      this.toastCtrl.create({ message: `Your phone does not support location services`, duration: 2000, color: 'danger', position: 'top', })
          .then(toastEl=>{
            toastEl.present();
          })
      return;
    }
    Geolocation.getCurrentPosition({ timeout: 10000 }).then(coordinates=>{
      const geometry = {lat: coordinates.coords.latitude, lng: coordinates.coords.longitude};
      const geocoder = new maps.Geocoder();
      geocoder.geocode({location: {lat: geometry?.lat ||0, lng: geometry?.lng||0} },  (results, status)=>{
        if (status == maps.GeocoderStatus.OK) {
          const currentLocation = this.gMapService.getAddresses(results?.find(a=>(a.types.includes("street_address")||a.types.includes("premise")) && !a.plus_code)?.address_components);
          this.location$.next({...geometry, ...currentLocation })
        }
      })
    }).catch( async error=>{
      const toastEl = await this.toastCtrl.create({ message: `Could not locate your position`, duration: 2000, color: 'danger', position: 'top', });
      await toastEl.present();
    });
  }
  authByFingerPrint(): Promise<any> {
    return FingerprintAIO.isAvailable()
                  .then(()=>{
                    return FingerprintAIO.show({
                      title: 'Authentication required',
                      subtitle: 'Verify identity',
                      description: 'Authenticate with fingerprints',
                      disableBackup: true,
                      cancelButtonTitle: "Return"
                    })
                  })
  }
  registerBiometricSecret(mySecret: any): Promise<any> {
    return FingerprintAIO.isAvailable()
                  .then(()=>{
                    return FingerprintAIO.registerBiometricSecret({
                      title: 'Authentication required',
                      subtitle: 'Verify identity',
                      description: 'Register your fingerprints for future requests',
                      secret: mySecret,
                      disableBackup: true,
                      cancelButtonTitle: "Return"
                    })
                  })
  }
  loadBiometricSecret() {
    return FingerprintAIO.isAvailable()
                  .then(()=>{
                    return FingerprintAIO.loadBiometricSecret({
                      title: 'Authentication required',
                      subtitle: 'Verify identity',
                      description: 'Signin using fingerprints',
                      disableBackup: true,
                      cancelButtonTitle: "Return"
                    })
                  })
          }
}

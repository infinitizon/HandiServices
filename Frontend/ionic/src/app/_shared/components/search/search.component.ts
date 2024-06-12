import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Item } from './types';
import { ISearchOptions } from './search-options';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent  implements OnInit {

  @Input() options!: ISearchOptions;
  @Input() items: any;
  @Input() selectedItems: string[] = [];

  @Output() selectionCancel = new EventEmitter<void>();
  @Output() selectionChange = new EventEmitter<any>();

  workingSelectedValues: string[] = [];
  data: any;
  filteredItems: any;
  container = {
    fetching: false,
  }

  constructor(
    private http: HttpClient,
    private loadingCtrl: LoadingController
  ){}

  ngOnInit() {
    console.log('In ngOnInit enter', this.options.endpoint);
    if(!this.options.endpoint) return;

    this.getSearch();
    this.workingSelectedValues = [...this.selectedItems];
  }
  getSearch() {
    this.container['fetching'] = true;
    this.loadingCtrl.create({
      message: `Loading...`,
      spinner: 'circles'
    }).then(loadingEl => {
      loadingEl.present()
      this.http
        .get(this.options.endpoint)
        .subscribe({
          next: (response: any) => {
            this.data = response.data;
            this.filteredItems = [...this.data];
            loadingEl.dismiss();
            this.container['fetching'] = false;
          },
          error: (errResp) => {
            loadingEl.dismiss();
            this.container['fetching'] = false;
          }
        });
    })
  }
  trackItems(index: number, item: any) {
    return index;
  }

  cancelChanges() {
    this.selectionCancel.emit();
  }

  confirmChanges() {
    this.selectionChange.emit(this.workingSelectedValues);
  }

  searchbarInput(ev: any) {
    this.filterList(ev.target.value);
  }

  /**
   * Update the rendered view with
   * the provided search query. If no
   * query is provided, all data
   * will be rendered.
   */
  filterList(searchQuery: string | undefined) {
    /**
     * If no search query is defined,
     * return all options.
     */
    if (searchQuery === undefined) {
      this.filteredItems = [...this.data];
    } else {
      /**
       * Otherwise, normalize the search
       * query and check to see which items
       * contain the search query as a substring.
       */
      const normalizedQuery = searchQuery.toLowerCase();
      this.filteredItems = this.data.filter((item: any) => {
        return item[this.options.label].toLowerCase().includes(normalizedQuery);
      });
    }
  }

  isChecked(value: string) {
    return this.workingSelectedValues.find((item) => item === value);
  }

  selectChange(data: any) {
    this.workingSelectedValues = data;
    return this.confirmChanges()
  }
  checkboxChange(ev: any) {
    const { checked, value } = ev.detail;

    if (checked) {
      this.workingSelectedValues = [...this.workingSelectedValues, value];
    } else {
      this.workingSelectedValues = this.workingSelectedValues.filter((item) => item !== value);
    }
  }
}

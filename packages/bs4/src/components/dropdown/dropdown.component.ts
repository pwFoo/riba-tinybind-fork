import { Component, Binder } from '@ribajs/core';
import { JQuery as $ } from '@ribajs/jquery';
import { DropdownService } from '../../services/dropdown.service';

export class DropdownComponent extends Component {

  public static tagName: string = 'bs4-dropdown';

  protected scope: any = {
    toggle: this.toggle,
  };

  protected dropdownService: DropdownService;

  static get observedAttributes() {
    return [];
  }

  constructor(element?: HTMLElement) {
    super(element);
    const $el = $(this.el);
    this.dropdownService = new DropdownService($el.find('.dropdown-toggle')[0] as HTMLButtonElement);
    this.init(DropdownComponent.observedAttributes);
  }

  public toggle(context: Binder<any>, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    return this.dropdownService.toggle();
  }

  protected template() {
    return null;
  }
}

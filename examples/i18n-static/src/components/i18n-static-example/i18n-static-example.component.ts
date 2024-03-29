import {
  Component,
} from '@ribajs/core';

import template from './i18n-static-example.component.html';

export class I18nStaticExampleComponent extends Component {

  public static tagName: string = 'rv-i18n-static-example';

  protected autobind = true;

  static get observedAttributes() {
    return [];
  }

  protected scope = {};

  constructor(element?: HTMLElement) {
    super(element);
    this.init(I18nStaticExampleComponent.observedAttributes);
  }

  protected async init(observedAttributes: string[]) {
    return super.init(observedAttributes)
    .then((view) => {
      return view;
    });
  }

  protected requiredAttributes() {
    return [];
  }

  protected template() {
    return template;
  }
}

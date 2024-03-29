import {
  Component,
  Binder,
  View,
} from '@ribajs/core';
import { Langcode } from '../../interfaces';
import { ALocalesService } from '../../services/locales-base.service';

export interface Scope {
  langcodes: Langcode[];
  switch: AI18nSwitcherComponent['switch'];
  toggle: AI18nSwitcherComponent['toggle'];
  ready: boolean;
}

export abstract class AI18nSwitcherComponent extends Component {

  protected abstract localesService: ALocalesService;

  protected scope = {
    langcodes: <Langcode[]> [],
    switch: this.switch,
    toggle: this.toggle,
    ready: <boolean> false,
  };

  constructor(element?: HTMLElement) {
    super(element);
  }

  /**
   * Switch to language by langcode
   * @param langcode
   * @param event
   */
  public switch(langcode: Langcode, context?: Binder<any>, event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!langcode.active) {
      this.setLangcode(langcode.code);
    }
  }

  /**
   * Toggle language, makes only sense if you have only two languages
   * @param langcode
   * @param event
   */
  public toggle(context?: Binder<any>, event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    for (const i in this.scope.langcodes) {
      if (this.scope.langcodes.hasOwnProperty(i)) {
        if (this.scope.langcodes[i].active !== true) {
          this.setLangcode(this.scope.langcodes[i].code);
          return;
        }
      }
    }
  }

  protected async init(observedAttributes: string[]) {
    if (this.localesService.ready) {
      const langcode = this.localesService.getLangcode();
      if (langcode) {
        return this.initLocales(langcode)
        .then((langcodes) => {
          return super.init(observedAttributes);
        });
      }
    }
    return new Promise<View | null | undefined>((resolve, reject) => {
      this.localesService.event.on('ready', (langcode: string, translationNeeded: boolean) => {
        this.initLocales(langcode)
        .then((langcodes) => {
          super.init(observedAttributes)
          .then((view) => {
            resolve(view);
          });
        });
      });
    });
  }

  protected async initLocales(langcode: string) {
    // set avaible langcodes
    return this.localesService.getAvailableLangcodes()
    .then((langcodes) => {
      this.scope.langcodes = langcodes;
      // set active langcodes
      this.scope.langcodes.forEach((langCode) => {
        langCode.active = (langCode.code === langcode);
      });
      return this.scope.langcodes;
    })
    .then((langcodes) => {
      this.localesService.event.on('changed', (changedLangcode: string, initial: boolean) => {
        // Activate localcode and disable the other
        this.scope.langcodes.forEach((langCode) => {
          langCode.active = (langCode.code === changedLangcode);
        });
      });
      return langcodes;
    })
    .then((langcodes) => {
      this.scope.ready = true;
      return langcodes;
    });
  }

  protected setLangcode(langcode: string) {
    this.localesService.setLangcode(langcode);
  }

  protected requiredAttributes() {
    return [];
  }

  protected disconnectedCallback() {
    super.disconnectedCallback();
  }

  protected template() {
    return null;
  }
}

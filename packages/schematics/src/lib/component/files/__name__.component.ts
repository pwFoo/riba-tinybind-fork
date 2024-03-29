import {
  Component,
} from '@ribajs/core';

<% if (templateEngine === 'pug') { %>import pugTemplate from './<%= name %>.component.pug';<% } %><% if (templateEngine === 'html') { %>import template from './<%= name %>.component.html';<% } %>

interface Scope {
  hello?: string;
}

export class <%= classify(name) %>Component extends Component {

  public static tagName: string = 'rv-<%= name %>';

  protected autobind = true;

  static get observedAttributes() {
    return ['hello'];
  }

  protected scope: Scope = {
    hello: undefined,
  };

  constructor(element?: HTMLElement) {
    super(element);
    console.debug('constructor', this);
    this.init(<%= classify(name) %>Component.observedAttributes);
  }

  protected async init(observedAttributes: string[]) {
    return super.init(observedAttributes)
    .then((view) => {
      return view;
    });
  }

  protected async beforeBind() {
    console.debug('beforeBind');
  }

  protected async afterBind() {
    console.debug('afterBind', this.scope);
  }

  protected requiredAttributes() {
    return [];
  }

  protected parsedAttributeChangedCallback(attributeName: string, oldValue: any, newValue: any, namespace: string | null) {
    super.parsedAttributeChangedCallback(attributeName, oldValue, newValue, namespace);
  }

  // deconstructor
  protected disconnectedCallback() {
    super.disconnectedCallback();
  }

  protected template() {
    // Only set the component template if there no childs already
    if (this.el.hasChildNodes()) {
      console.debug('Do not use template, because element has child nodes');
      return null;
    } else {
      <% if (templateEngine === 'pug') { %>const template = pugTemplate(this.scope);<% } %>console.debug('Use template', template);
      return template;
    }
  }
}

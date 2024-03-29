import { Binder, EventDispatcher, Utils, View as RivetsView } from '@ribajs/core';
import { Pjax, Prefetch, HideShowTransition } from '../services';
import { State } from '../interfaces';

/**
 * The main wrapper for the riba router
 * TODO convert this to a component
 *
 * ```
 *   <div rv-view='{"listenAllLinks": true}'>
 *     <div class="rv-view-container" {% include 'jumplink-utils-barba-container-attributes', parseCollection: true %}>
 *       {{ content_for_layout }}
 *     </div>
 *   </div>
 * ```
 */
export const viewBinder: Binder<string> = {
  name: 'view',
  block: true,

  bind(el: Element) {
    const self = this;
    if (!this.customData) {
      this.customData = {};
    }

    this.customData.nested = this.customData.nested || null,
    this.customData.wrapper = this.customData.wrapper || el,

    this.customData.onPageReady = (viewId: string, currentStatus: State, prevStatus: State, container: HTMLElement, newPageRawHTML: string, dataset: any, isInit: boolean) => {
      // Only to anything if the viewID is eqal (in this way it is possible to have multiple views)
      if (viewId !== self.customData.options.viewId) {
        console.warn('not the right view', self.customData.options.viewId, viewId);
        return;
      }

      // unbind the old rivets view
      if (self.customData.nested) {
        if (self.customData.options.action === 'replace') {
          self.customData.nested.unbind();
        }
      }

      // add the dateset to the model
      if (!Utils.isObject(self.view.models)) {
        self.view.models = {};
      }

      if (self.customData.options.datasetToModel === true && Utils.isObject(dataset)) {
        self.view.models.dataset = dataset; // = container.data();
      }

      // TODO append on action append
      self.customData.nested = new RivetsView(container, self.view.models, self.view.options);
      self.customData.nested.bind();
    };

    this.customData.onTransitionCompleted = (viewId: string) => {

      // Only to anything if the viewID is eqal (in this way it is possible to have multiple views)
      if (viewId !== self.customData.options.viewId) {
        return;
      }

      // scroll to Anchor of hash
      if (this.customData.options.scrollToAnchorHash && window.location.hash) {
        const scrollToMe = document.getElementById(window.location.hash.substr(1));
        if (scrollToMe) {
          return new Promise((resolve, reject) => {
            resolve(Utils.scrollTo(scrollToMe, 0, window));
          });
        }
      }
      return Promise.resolve();
    };

    /*
    * Make the dispatcher available in the model to register event handlers.
    *
    * I.e., if we have initialized rivets/riba with:
    *
    *  `rivets.bind(document.body, model)`,
    *
    * then we can register event handlers for the Barba router dispatcher like this:
    *
    *  `model.routerDispatcher.on('newPageReady', ...);`
    *  `model.routerDispatcher.on('transitionCompleted', ...);`
    * ...etc.
    *
    */
    // this.view.models.routerDispatcher = dispatcher;
  },

  routine(el: HTMLUnknownElement, options: any) {
    // Set default options
    this.customData.options = options || {};

    this.customData.options.viewId = this.customData.options.viewId || el.getAttribute('id') || 'main';
    this.customData.options.action = this.customData.options.action || 'replace'; // replace / append

    if (this.customData.options.viewId === 'main') {
      this.customData.options.containerSelector = this.customData.options.containerSelector || '[data-namespace]';
      this.customData.options.scrollToTop = Utils.isBoolean(this.customData.options.scrollToTop) ? this.customData.options.scrollToTop : true;
      this.customData.options.listenAllLinks = Utils.isBoolean(this.customData.options.listenAllLinks) ? this.customData.options.listenAllLinks : true;
      this.customData.options.listenPopstate = Utils.isBoolean(this.customData.options.listenPopstate) ? this.customData.options.listenPopstate : true;
      this.customData.options.scrollToAnchorHash = Utils.isBoolean(this.customData.options.scrollToAnchorHash) ? this.customData.options.scrollToAnchorHash : true;
      this.customData.options.datasetToModel = Utils.isBoolean(this.customData.options.datasetToModel) ? this.customData.options.datasetToModel : true;
      this.customData.options.parseTitle = Utils.isBoolean(this.customData.options.parseTitle) ? this.customData.options.parseTitle : true;
      this.customData.options.changeBrowserUrl = Utils.isBoolean(this.customData.options.changeBrowserUrl) ? this.customData.options.changeBrowserUrl : true;
    } else {
      this.customData.options.containerSelector = this.customData.options.containerSelector || `#${this.customData.options.viewId} > *:first-child`;
      this.customData.options.scrollToTop = Utils.isBoolean(this.customData.options.scrollToTop) ? this.customData.options.scrollToTop : false;
      this.customData.options.listenAllLinks = Utils.isBoolean(this.customData.options.listenAllLinks) ? this.customData.options.listenAllLinks : false;
      this.customData.options.listenPopstate = Utils.isBoolean(this.customData.options.listenPopstate) ? this.customData.options.listenPopstate : false;
      this.customData.options.scrollToAnchorHash = Utils.isBoolean(this.customData.options.scrollToAnchorHash) ? this.customData.options.scrollToAnchorHash : false;
      this.customData.options.datasetToModel = Utils.isBoolean(this.customData.options.datasetToModel) ? this.customData.options.datasetToModel : false;
      this.customData.options.parseTitle = Utils.isBoolean(this.customData.options.parseTitle) ? this.customData.options.parseTitle : false;
      this.customData.options.changeBrowserUrl = Utils.isBoolean(this.customData.options.changeBrowserUrl) ? this.customData.options.changeBrowserUrl : false;
    }

    this.customData.options.autoprefetchLinks = Utils.isBoolean(this.customData.options.autoprefetchLinks) ? this.customData.options.autoprefetchLinks : this.customData.options.listenAllLinks;
    this.customData.options.transition = this.customData.options.transition || new HideShowTransition(this.customData.options.action, this.customData.options.scrollToTop);

    this.customData.dispatcher = new EventDispatcher(this.customData.options.viewId);
    this.customData.prefetch = new Prefetch();

    this.customData.wrapper.setAttribute('id', this.customData.options.viewId);

    this.customData.dispatcher.on('newPageReady', this.customData.onPageReady);
    this.customData.dispatcher.on('transitionCompleted', this.customData.onTransitionCompleted);

    const pjax = new Pjax(this.customData.options.viewId, this.customData.wrapper, this.customData.options.containerSelector, this.customData.options.listenAllLinks, this.customData.options.listenPopstate, this.customData.options.transition, this.customData.options.parseTitle, this.customData.options.changeBrowserUrl);
    this.customData.prefetch.init(this.customData.options.autoprefetchLinks);
    pjax.start();
  },

  unbind(el: HTMLUnknownElement) {
    if (this.customData.dispatcher) {
      this.customData.dispatcher.off('newPageReady', this.customData.onPageReady);
      this.customData.dispatcher.off('transitionCompleted', this.customData.onTransitionCompleted);
    }

    if (this.customData && this.customData.nested !== null) {
      this.customData.nested.unbind();
    }

    delete this.customData;
  },
};

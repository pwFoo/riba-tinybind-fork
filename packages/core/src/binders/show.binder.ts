import { Binder } from '../interfaces';

/**
 * Shows the element when value is true.
 */
export const showBinder: Binder<boolean> = {
  name: 'show',
  routine(el: HTMLElement, value: boolean) {
    el.style.display = value ? '' : 'none';
    if (value) {
      el.removeAttribute('hidden');
    } else {
      el.setAttribute('hidden', 'true');
    }
  },
};

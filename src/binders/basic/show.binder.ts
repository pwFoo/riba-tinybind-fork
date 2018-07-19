import { IOneWayBinder } from '../../binder.service';

/**
 * Shows the element when value is true.
 */
export const show: IOneWayBinder<boolean> = (el: HTMLElement, value: boolean) => {
  el.style.display = value ? '' : 'none';
};
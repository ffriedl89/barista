/**
 * @license
 * Copyright 2020 Dynatrace LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  LitElement,
  CSSResult,
  property,
  TemplateResult,
  html,
} from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import styles from './tab.scss';
import {
  FluidTabDisabledEvent,
  FluidTabActivatedEvent,
} from '../../utils/tab-events';

let _unique = 0;

/**
 * This is a experimental version of the tab component
 * It registers itself as `fluid-tab` custom element.
 * @element fluid-tab
 * @slot - Default slot to provide a label for the tab.
 */
export class FluidTab extends LitElement {
  /** Styles for the tab component */
  static get styles(): CSSResult {
    return styles;
  }

  /**
   * Defines the tab element with an id attribute
   * @attr
   * @type string
   */
  @property({ type: String, reflect: true })
  tabid = `fluid-tab-${_unique++}`;

  /**
   * Defines whether a tab is disabled or not
   * @attr
   * @type boolean
   */
  @property({ type: Boolean, reflect: true })
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    const oldValue = this._disabled;
    if (this._disabled !== value) {
      this._disabled = value;
      this.requestUpdate('disabled', oldValue);
      if (this._disabled) {
        this.active = false;
        this.tabindex = -1;
        this.dispatchEvent(new FluidTabDisabledEvent(this.tabid));
      }
    }
  }
  private _disabled = false;

  /**
   * Defines the tabindex attribute
   * @attr
   * @type number
   */
  @property({ type: Number, reflect: true })
  get tabindex(): number {
    return this._tabindex;
  }
  set tabindex(value: number) {
    this._tabindex = value;
    // TODO: Figure out why using the old value does not work. The attribute vanishes in the dom/is not set
    this.requestUpdate('tabindex');
  }
  private _tabindex = 0;

  /**
   * Defines whether a tab is active or not
   * @attr
   * @type boolean
   */
  @property({ type: Boolean, reflect: false })
  get active(): boolean {
    return this._active;
  }
  set active(active: boolean) {
    // Only set active true if not disabled
    this._active = this.disabled === false ? active : false;
    // TODO: Figure out why using the old value does not work. The attribute vanishes in the dom/is not set
    this.requestUpdate('active');
    this.tabindex = this.active ? 0 : -1;
  }
  private _active = false;

  /** Dispatches the custom event  */
  private dispatchActiveTabEvent(): void {
    this.dispatchEvent(new FluidTabActivatedEvent(this.tabid));
  }

  /** Handles the click event */
  private handleClick(): void {
    if (!this._active) {
      this.dispatchActiveTabEvent();
    }
  }

  /**
   * Render function of the custom element. It is called when one of the
   * observedProperties (annotated with @property) changes.
   */
  render(): TemplateResult {
    const classes = {
      'fluid-tab': true,
      'fluid-state--active': this._active,
    };

    // Linebreak causes the element to have a space
    return html`<span
      class=${classMap(classes)}
      ?disabled="${this.disabled}"
      @click="${this.handleClick}"
    >
      <slot></slot>
    </span>`;
  }
}

if (!customElements.get('fluid-tab')) {
  customElements.define('fluid-tab', FluidTab);
}

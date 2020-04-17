import { LitElement } from 'lit-element';
import render from "./app-header.tpl.js"

import "./views/map/app-map-info-panel"
import "./views/app-about"
import "./views/app-home"
import "./views/app-story"

// TODO: This is temporary and will be replaced once we have a live source for the data
let jsonData = require('../../../mock/story_json.json');

export default class AppHeader extends Mixin(LitElement)
  .with(LitCorkUtils){

  static get properties() {
    return {
      baseUrl: { type: String },
      subtitle: { type: String },
      jsonData: { type: Object },
      moments: { type: Array }
    }
  }

  constructor() {
    super();
    this.baseUrl = window.location.protocol + '//' + window.location.host;
    this.subtitle = '';
    this.jsonData = jsonData; // temp while using mock data
    this.moments = [];

    this.render = render.bind(this);

    this._injectModel('AppStateModel', 'MomentModel');
  }

  /**
   * @method _onAppStateUpdate
   * @description bound to AppStateModel app-state-update events
   *
   * @param {Object} e
  */
  async _onAppStateUpdate(e) {
    if ( e.page === 'home' || e.page === 'about' ) {
      this.subtitle = 'California\'s Modern Wine Network';
    } else {
      this.moment = e.moment;

      let payload = await this.MomentModel.get(this.moment);

      this._setSubtitle(payload.payload);
    }
  }

  _setSubtitle(data) {
    if ( Object.keys(data.graph.story).length !== 0 ) {
      this.subtitle = data.graph.story.entrypoint.name;
    } else { // TEMP while using mock data
      this.subtitle = this.jsonData.moments[this.moment].entrypoint.name;
    }
  }

  /**
   * @method _onAboutClick
   * @description send the user to the About page
   * @param {*} e
  */
  _onAboutClick() {
    this.AppStateModel.setLocation('/about/');
  }
}

customElements.define('app-header', AppHeader);

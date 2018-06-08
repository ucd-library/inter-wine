import {PolymerElement, html} from "@polymer/polymer"
import template from "./app-map-node.html"

export default class AppMapNode extends PolymerElement {

  static get template() {
    return html([template]);
  }

  static get properties() {
    return {
      label : {
        type : 'String',
        value : ''
      }
    }
  }

  constructor(data, map) {
    super();
    this.map = map;
    this.data = data;
    this.visible = false;

    this.normalFeature = L.circleMarker(data, {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.5,
      radius: 20
    });

    // this.fakedFeature = L.circleMarker(data, {
    //   color: 'blue',
    //   fillColor: '#888',
    //   fillOpacity: 0.5,
    //   radius: 40
    // });

    this.rendered = null;
  }

  render(ll, fake) {
    if( this.visible ) {
      if( this.render === 'normal' ) return;

      this.style.display = 'none';
      // this.map.removeLayer(this.fakedFeature);
      this.normalFeature.addTo(this.map);
      this.rendered = 'normal';
      return;
    }

    this.style.top = (fake.y-37)+'px';
    this.style.left = (fake.x-37)+'px';
    this.fakeData = ll;
    this.label = fake.id;
    // this.fakedFeature.setLatLng(ll);

    if( this.rendered !== 'faked' ) {
      this.map.removeLayer(this.normalFeature);
      this.style.display = 'block';
      // this.fakedFeature.addTo(this.map);
      this.rendered = 'faked';
    }
  }

}

customElements.define('app-map-node', AppMapNode);
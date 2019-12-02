import { LitElement } from 'lit-element';
import render from "./app-leaflet-map.tpl.js"

import "leaflet"
import "leaflet.markercluster"

export default class AppLeafletMap extends LitElement {

  static get properties() {
    return {
      active : {type: Boolean},
      infoOpen : {
        type: Boolean,
        attribute: 'info-open'
      }
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.linkLayers = {};
    this.nodeLayers = {};
    this.links = {};
    this.nodes = {};
    this.updateLinksTimer = -1;
    this.firstRender = true;

    window.addEventListener('resize', () => {
      if( !this.active ) return;
      this.redraw();
    });
    this.redrawTimer = -1;
  }

  firstUpdated() {
    this.initMap();
  }

  /**
   * @method initMap
   * @description called when the element is first rendered.  Sets up the map
   * and the cluster layers.  Checks if there is a pending view state and sets the
   * map to that location, otherwise renders at 0,0
   */
  initMap() {
    // create the leaflet map object
    this.map = L.map(this.shadowRoot.querySelector('#map')).setView([0,0], 3, {animate: false});

    // pending view state? use that lat/lng instead
    if( this.pendingView ) {
      this.setView(this.pendingView.latlng, this.pendingView.zoom);
      this.pendingView = null;
    } else if( this.infoOpen ) {
      this.setView([0,0], 3);
    }

    L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // create the clulster layer
    this.clusters = L.markerClusterGroup({
      animate: false,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: false,
      removeOutsideVisibleBounds: false,
      maxClusterRadius : 25,
      spiderfyOnMaxZoom : false
    });
    this.map.addLayer(this.clusters);
    this.map.zoomControl.setPosition('bottomright');

    // wire up layer and map events
    this.clusters.on('clusterclick', e => this.onClusterClicked(e));
    this.map.on('zoomend', () => {
      this.repositionSelectedNode();
      this.repositionSelectedLink();
      this.updateLinks()
    });

    // grab the css color defined by our custom variable
    this.lineColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--app-color-interface-blue')
      .trim();
  }

  /**
   * @method renderSelectedState
   * @description called by the parent when app state updates.  render the map
   * to the current state
   *
   * @param {Object} e app-state-update event object
   */
  renderSelectedState(e) {
    if( !e ) {
      if( this.firstRender ) {
        if( Object.keys(this.nodes).length === 0 ) this.zoomToClusters = true;
        else this.map.fitBounds(this.clusters.getBounds());
      }
      this.firstRender = false;
      return;
    }

    // reset state, remove current markers
    if( this.selectedNodeIcon ) {
      for( let type in this.selectedNodeIcon ) {
        this.map.removeLayer(this.selectedNodeIcon[type]);
      }
      this.selectedNodeIcon = null;
      this.selectedNodeLayer = null;
    }
    if( this.selectedLineIcon ) {
      this.map.removeLayer(this.selectedLineIcon);
      this.selectedLineIcon = null;
    }

    // now render based on selected type
    if( e.selected.type === 'cluster' ) {
      this.selectCluster(e.selected.latlng, e.selected.zoom);
    } else if( e.selected.type && e.selected.type !== 'connection' ) {
      this.selectNode(e.selected.id, undefined, this.firstRender);
    } else if( e.selected.type === 'connection' ) {
      this.selectLink(e.selected.id);
    }

    // make sure our links are rendered correctly
    this.updateLinks();
  }

  /**
   * @method selectLink
   * @description render a link based on id.  This will show two labels and
   * the center connection line label
   *
   * @param {String} id connection id
   */
  selectLink(id) {
    // get the link object
    let link = this.links[id];

    // if no link object, assume we are loading.  Set the pending attribute
    // and quit.  When a new graph is loaded, this will be check and selectLink()
    // will be called again
    if( !link ) {
      this.pendingLinkSelect = id;
      return;
    }

    // set our source and destination node labels
    this.selectNode(link.src, 'src');
    this.selectNode(link.dst, 'dst');

    // find the screen midpoint of the line
    let ll = this._getMidPoint(
      this.selectedNodeIcon.src.getLatLng(),
      this.selectedNodeIcon.dst.getLatLng()
    );

    // creat the line label
    let icon = L.divIcon({
      className: `leaflet-intertwine-connection-label`,
      iconSize: [0, 0],
      html : '<div>connection</div>'
    });
    this.selectedLineIcon = L.marker(ll, {icon});
    this.map.addLayer(this.selectedLineIcon);
    this.selectedLineIcon.setZIndexOffset(5000);
  }

  /**
   * @method selectNode
   * @description set a node label.  The type should be either src or dst.  For single
   * node selection the type will be src.
   *
   * @param {String} id node id
   * @param {String} type either src|dst
   */
  selectNode(id, type='src', firstRender=false) {
    // find the marker layer based on id in the cluster
    let layer = this.clusters
      .getLayers()
      .find(layer => layer.intertWineId === id);

    // if not found, assume either graph hasn't loaded or the layer hasn't rendered
    // set the pendingNodeSelect attribute which will be cheched when the graph
    // loads calling this function again
    if( !layer ) {
      if( !this.pendingNodeSelect ) {
        this.pendingNodeSelect = {};
      }
      this.pendingNodeSelect[type] = id;
      return;
    }

    // setup our look attributes for selected layer and icon
    if( !this.selectedNodeLayer ) {
      this.selectedNodeLayer = {};
    }
    if( !this.selectedNodeIcon ) {
      this.selectedNodeIcon = {};
    }
    this.selectedNodeLayer[type] = layer;

    // graph the visible marker, either the cluster marker or the layer itself
    layer = this.clusters.getVisibleParent(layer) || layer;

    // render the icon
    let icon = L.divIcon({
      className: `leaflet-intertwine-node-label`,
      iconSize: [0, 0],
      html : '<div>'+this.nodes[id].title+'</div><div class="intertwine-arrow"></div>'
    });

    this.selectedNodeIcon[type] = L.marker(layer.getLatLng(), {icon});
    this.map.addLayer(this.selectedNodeIcon[type]);
    this.selectedNodeIcon[type].setZIndexOffset(5000);

    // we need to let the marker render so we can adjust the left offset based
    // on the marker width.  We will do a little bit of additional css work as well
    requestAnimationFrame(() => {
      // should the label be set to bottom of marker?
      // check the two selected nodes and see which has a higher lat
      let bottom = false;
      for( let key in this.selectedNodeIcon ) {
        if( key === type ) continue;
        if( this.selectedNodeLayer[key].getLatLng().lat > this.selectedNodeLayer[type].getLatLng().lat ) {
          bottom = true;
        }
      }

      // grab the two div's and setup location classes
      let markerEle = this.selectedNodeIcon[type].getElement().firstChild;
      let arrow = this.selectedNodeIcon[type].getElement().children[1];
      if( bottom ) {
        markerEle.classList.add('bottom');
        arrow.classList.add('bottom');
      } else {
        markerEle.classList.add('top');
        arrow.classList.add('top');
      }

      // the point markers have intertWineIds
      // these have different label top/bottom offsets based on cluster vs point
      if( layer.intertWineId ) {
        markerEle.classList.add('point');
        arrow.classList.add('point');
      }

      // set the left to the midpoint of label width
      let w = markerEle.offsetWidth;
      if( w > 150 ) {
        markerEle.classList.add('fixed-width');
      } else {
        markerEle.style.left = (-1*(w/2))+'px';
      }

      // if there is only one selected node and it is not in view, set to center
      if( Object.keys(this.selectedNodeIcon).length === 1 ) {
        if( firstRender || !this.map.getBounds().contains(this.selectedNodeIcon.src.getLatLng()) ) {
          this.setView(this.selectedNodeIcon.src.getLatLng(), this.map.getZoom());
        }
      }
    });
  }

  /**
   * @method _getMidPoint
   * @description get the midpoint for a line by finding the screen (x, y) midpoint
   * then converting to lat/lng.  This is how lines are rendered and we need the
   * label based on that otherwise it may look off when labels are far apart.
   *
   * @param {*} srcll
   * @param {*} dstll
   */
  _getMidPoint(srcll, dstll) {
    let srcxy = this.map.latLngToContainerPoint(srcll);
    let dstxy = this.map.latLngToContainerPoint(dstll);

    let x = (dstxy.x + srcxy.x) / 2;
    let y = (dstxy.y + srcxy.y) / 2;

    return this.map.containerPointToLatLng({x,y});
  }

  repositionSelectedLink() {
    if( !this.selectedNodeLayer || !this.selectedLineIcon ) return;
    let ll = this._getMidPoint(
      this.selectedNodeIcon.src.getLatLng(),
      this.selectedNodeIcon.dst.getLatLng()
    );
    this.selectedLineIcon.setLatLng(ll);
  }

  repositionSelectedNode() {
    if( !this.selectedNodeLayer || !this.selectedNodeIcon ) return;
    for( let type in this.selectedNodeLayer ) {
      let layer = this.clusters.getVisibleParent(this.selectedNodeLayer[type]) || this.selectedNodeLayer[type];
      this.selectedNodeIcon[type].setLatLng(layer.getLatLng());

      if( layer.intertWineId ) {
        this.selectedNodeIcon[type].getElement().firstChild.classList.add('point');
        this.selectedNodeIcon[type].getElement().children[1].classList.add('point');
      } else {
        this.selectedNodeIcon[type].getElement().firstChild.classList.remove('point');
        this.selectedNodeIcon[type].getElement().children[1].classList.remove('point');
      }
    }
  }

  selectCluster(latlng, zoom) {
    if( this.firstRender ) {
      this.setView(latlng, zoom);

      if( this.map ) {
        if( this.clusters.getLayers().length === 0 ) {
          this.pendingClusterSelect = {latlng, zoom};
          return; // this will get fired on again on firstUpdate
        }
      } else {
        this.pendingClusterSelect = {latlng, zoom};
        return; // this will get fired on again on firstUpdate
      }
    }

    let clusterMarkers = this.clusters._featureGroup.getLayers();
    let closest = Number.MAX_SAFE_INTEGER;
    let selectedCluster = null;

    for( let layer of clusterMarkers ) {
      // HACK.  Is there better type checking for this?
      if( layer.intertWineId ) continue;
      if( !layer._group ) continue;

      let ll = layer.getBounds().getCenter();
      let dist = Math.abs(ll.lat - latlng[0]) + Math.abs(ll.lng - latlng[1]);
      if( closest > dist ) {
        selectedCluster = layer;
        closest = dist;
      }
    }

    if( !selectedCluster ) return console.warn('no clusters found to selected');

    let event = new CustomEvent('selected-cluster-ids', {
      detail: selectedCluster.getAllChildMarkers().map(l => l.intertWineId)
    })
    this.dispatchEvent(event);
  }

  /**
   * @method onClusterClicked
   * @description bound to cluster click event
   */
  onClusterClicked(e) {
    let center = e.layer.getBounds().getCenter();
    let event = new CustomEvent('cluster-click', {detail : {
      latLng : [parseFloat(center.lat.toFixed(4)), parseFloat(center.lng.toFixed(4))],
      zoom : this.map.getZoom()
    }});
    this.dispatchEvent(event);
  }

  /**
   * @method onNodeClicked
   * @description bound to map marker click events
   */
  onNodeClicked(e) {
    let event = new CustomEvent('node-click', {detail : {
      id : e.target.intertWineId
    }});
    this.dispatchEvent(event);
  }

  onLinkClicked(e) {
    let event = new CustomEvent('link-click', {detail : {
      id : e.layer.intertWineId
    }});
    this.dispatchEvent(event);
  }

  /**
   * @method setData
   * @description set node/link data, render map
   */
  setData(data) {
    this.nodes = data.nodes;
    this.nodeLayers = {};
    this.links = data.links;

    this.clusters.clearLayers();

    for( let id in data.nodes ) {
      let icon = L.divIcon({
        className: `leaflet-intertwine-icon leaflet-${data.nodes[id].type}-icon`,
        iconSize: [15, 15]
      });

      if (data.nodes[id].coordinates) {
        let layer = L.marker(data.nodes[id].coordinates[0], {icon});
        layer.on('click', e => this.onNodeClicked(e));
        layer.intertWineId = id;
        this.nodeLayers[id] = layer;
        this.clusters.addLayer(layer);
      }
    }

    if( this.pendingClusterSelect ) {
      this.selectCluster(this.pendingClusterSelect.latlng, this.pendingClusterSelect.zoom);
      this.pendingClusterSelect = null;
    } else if( this.pendingNodeSelect ) {
      for( let type in this.pendingNodeSelect ) {
        this.selectNode(this.pendingNodeSelect[type], type, true);
      }
      this.pendingNodeSelect = null;
    } else if( this.pendingLinkSelect ) {
      this.selectLink(this.pendingLinkSelect);
      this.pendingLinkSelect = null;
    } else if( this.zoomToClusters ) {
      this.map.fitBounds(this.clusters.getBounds());
      this.zoomToClusters = false;
    }

    this.updateLinks();
  }

  /**
   * @method updateLinks
   * @description redraw links from current cluster locations.  Should be
   * called whenever data changes or map zoom level changes
   */
  updateLinks() {
    if( this.updateLinksTimer !== -1 ) clearTimeout(this.updateLinksTimer);
    this.updateLinksTimer = setTimeout(() => {
      this.updateLinksTimer = -1;
      this._updateLinks();
    }, 100);
  }

  _updateLinks() {
    for( let id in this.linkLayers ) {
      this.map.removeLayer(this.linkLayers[id]);
    }
    this.linkLayers = {};

    for( let id in this.links ) {
      let item = this.links[id];
      let selected = false;
      if( this.selectedNodeLayer && this.selectedNodeLayer.src && this.selectedNodeLayer.dst ) {
        if( item.src === this.selectedNodeLayer.src.intertWineId && item.dst === this.selectedNodeLayer.dst.intertWineId ) {
          selected = true;
        }
      }

      let _src = this.links.find(link => link['@id'] === item['@id']);
      if ( _src.hasOwnProperty('coordinates') === true ) {
        let src = this.getMarkerLatLng(item.src);
        let dst = this.getMarkerLatLng(item.dst);

        let lid = src.lat+'-'+src.lng+'-'+dst.lat+'-'+dst.lng;
        if( this.linkLayers[lid] ) {
          if( selected && !this.linkLayers[lid].selected ) {
            this.linkLayers[lid].selected = true;
            this.linkLayers[lid].setStyle({opacity: 1, weight: 2});
          }
          continue;
        }

        this.linkLayers[lid] = L.polyline([src, dst], {
          color: this.lineColor,
          weight: selected ? 2: 1,
          opacity : selected ? 1 : 0.3
        }).addTo(this.map);

        this.linkLayers[lid].selected = selected;
      }
    }
  }

  setView(latlng, zoom) {
    if( this.map ) {

      // adjust center by 500 px
      // if( this.infoOpen ) {
      //   latlng = this.map.latLngToContainerPoint(latlng);
      //   latlng.x -= 400;
      //   latlng = this.map.containerPointToLatLng(latlng);
      // }

      this.map.setView(latlng, zoom, {animate: false});
    } else {
      this.pendingView = {latlng, zoom};
    }
  }

  /**
   * @method getMarkerLatLng
   * @description given a node id, find the lat/lng for the node representation.
   * This could be the node itself or it's containing cluster
   */
  getMarkerLatLng(id) {
    let clusterLayer = this.clusters.getVisibleParent(this.nodeLayers[id]);
    if( clusterLayer ) return clusterLayer.getLatLng();

    return L.latLng(this.nodes[id].coordinates);
  }


  updated(props) {
    if( props.has('active') && this.active ) {
      this.redraw();
    }
  }

  /**
   * @method redraw
   * @description buffered call to map.invalidateSize();
   */
  redraw() {
    if( this.redrawTimer ) clearTimeout(this.redrawTimer);
    this.redrawTimer = setTimeout(() => {
      this.redrawTimer = -1;
      this.redrawNow();
    });
  }

  /**
   * @method redrawNow
   * @description call to map.invalidateSize();
   */
  redrawNow(xOffset) {
    if( !this.map ) return console.warn('attempting to redraw map, but map not initialized');
    this.map.invalidateSize({pan: false});
  }

}

customElements.define('app-leaflet-map', AppLeafletMap);

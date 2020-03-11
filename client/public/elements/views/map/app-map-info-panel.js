import { LitElement } from 'lit-element';
import render from "./app-map-info-panel.tpl.js"
import {markdown} from "markdown"

import "@polymer/iron-icons"

// TODO: This is temporary and can be replaced once we have a live source for the data
let jsonData = require('../../../../../mock/story_json.json');

export default class AppMapInfoPanel extends Mixin(LitElement)
  .with(LitCorkUtils) {

  static get properties() {
    return {
      open : {
        type: Boolean,
        reflect: true
      },
      moment : {type: String},
      momentInfo : {type: Object},
      momentEntryPointUrl : {type: String},
      endpoint: { type: String },
      type : {type : String},
      srctype : { type: String },
      srcthumb: { type: String },
      dsttype : { type: String },
      dstthumb: { type: String },
      view : {type : String},
      title : {type : String},
      date : {type : String},
      events: { type: Array },
      connections : {type: Array},
      isNode : {type: Boolean},
      isLink : {type: Boolean},
      isMoment : {type: Boolean},
      relatedLinks: { type: Array },
      imageCreditLink: { type: String },
      imageCreditTitle: { type: String },
      selectedIndex: { type: Number },
      hasConnections: { type: Boolean },
      connectionSubjects : {type: Array},
      clusterSubjects : {type: Object},
      clusterSubjectTypes : {type: Array}
    }
  }

  constructor() {
    super();

    this.open = true;
    this.title = '';
    this.date = '';
    this.view = '';
    this.type = '';
    this.description = '';
    this.thumbnail = '';
    this.srctype = '';
    this.srcthumb = '';
    this.dsttype = '';
    this.dstthumb = '';
    this.connections = [];
    this.isLink = false;
    this.isNode = false;
    this.isMoment = false;
    this.moment = '';
    this.momentInfo = {};
    this.momentEntryPointUrl = '';
    this.relatedLinks = [];
    this.imageCreditLink  = '';
    this.imageCreditTitle = '';
    this.events  = [];

    this.endpoint = APP_CONFIG.endpoint;

    this.hasConnections = false;
    this.connectionSubjects = [];
    this.clusterSubjectTypes = ['person', 'place', 'object', 'event'];
    this.resetClusterSubjects();
    this.render = render.bind(this);

    this._injectModel('AppStateModel', 'MomentModel');
  }

  /**
   * @method _onMomentGraphUpdate
   * @description bound to graph-update events from the MomentModel
   *
   * @param {*} e
   */
  _onMomentGraphUpdate(e) {
    if( e.state !== 'loaded' ) return;
    this.renderState(e.payload);
  }

  _onAppStateUpdate(e) {
    this.moment   = e.moment;
    this.selected = e.selectedNode;

    this.renderState();
  }

  firstUpdated() {
    this.descriptionEle = this.shadowRoot.querySelector('#description');
    this.momentDescEle  = this.shadowRoot.querySelector('#momentDescription');
    this.singleImage    = this.shadowRoot.querySelector('#singleImage');
    this.connectionSrcImg  = this.shadowRoot.querySelector('#connection-src-image');
    this.connectionDstImg = this.shadowRoot.querySelector('#connection-dst-image');
  }

  updated() {
    if ( this.isLink ) this.title = '';

    if ( this.connections.length > 0 ) this.hasConnections = true;
    else this.hasConnections = false;
  }

  renderState(moment) {
    if( moment ) {
      this.momentInfo = moment;

      // This is a TEMPORARY FIX to display the entryPoint data on the info-panel
      moment.description = jsonData.moments[this.moment].entryPoint.text;

      this.momentDescEle.innerHTML = markdown.toHTML(moment.description || '');
      this.momentEntryPointUrl = '';

      // TODO: Need to add entryPoint to data in Trello
      /*
      if( moment.entryPoint ) {
        for( let id in moment.graph.nodes ) {
          let node = moment.graph.nodes[id];
          if( node['@id'] !== moment.entryPoint ) continue;
          this.momentEntryPointUrl = `/map/${this.moment}/${node.type}/${node['@id']}`;
          break;
        }
      }
      */

      // Temp entry point
      this.events = [];
      for ( let id in moment.graph.nodes ) {
        if (moment.graph.nodes[id].type === 'event') {
          this.events.push(moment.graph.nodes[id]);
        }
      }

      if ( this.events.length > 0 ) {
        this.momentInfo.title    = this.events[0]['name'];
        if ( this.events[0]['temporal'] ) {
          this.momentInfo.date   = this.events[0]['temporal'].replace('/', ' - ');
        }
        this.momentEntryPoint    = this.events[0]['name'];
        this.momentEntryPointUrl = `/map/${this.moment}/${this.events[0].type}/${this.events[0]['@id']}`;
      }

      this.graph = moment.graph;
    }

    this.isLink = false;
    this.isNode = false;
    this.isMoment = false;

    /*
     Reset the thumbnails and background images so if
     the user has navigated to a new item the old image
     isn't displayed.
    */
    this.thumbnail = '';
    this.singleImage.style.backgroundImage = 'initial';
    this.connectionSrcImg.style.backgroundImage = 'initial';
    this.connectionDstImg.style.backgroundImage = 'initial';
    this.imageCreditLink  = '';
    this.imageCreditTitle = '';

    if( !this.selected ) {
      this.renderEmpty();
      return;
    }

    if( !this.graph ) return;

    this.type = this.selected.type;

    if( this.type === 'cluster' ) {
      if( this.selected.ids ) {
        this.renderCluster(this.selected.ids.map(id => this.graph.nodes[id]));
      }
    } else if( this.type === 'connection' ) {
      this.isLink = true;
      let selectedNode = this.graph.links[this.selected.id];
      this.renderItem(selectedNode);
    } else {
      this.isNode = true;
      let selectedNode = this.graph.nodes[this.selected.id];
      this.renderItem(selectedNode);
    }
  }

  renderEmpty() {
    if( !this.moment ) {
      this.view = 'empty'
      this.type = 'empty';
      return;
    }

    this.type = 'moment';
    this.view = 'moment';
    this.isMoment = true;
  }

  renderCluster(nodes) {
    this.view = 'cluster';
    this.resetClusterSubjects();

    nodes.forEach(node => {
      if( !this.clusterSubjects[node.type] ) return;

      this.clusterSubjects[node.type].enabled = true;
      this.clusterSubjects[node.type].nodes.push(node);
    });

    // Alphabetize the clusterSubjects
    for (let attr in this.clusterSubjects) {
      this.clusterSubjects[attr].nodes.sort((a, b) => (a.name > b.name) ? 1 : -1);
    }
  }

  renderItem(node) {
    this.view = 'item';

    this.title = node.name || '';

    if ( node['schema:spatial'] ) {
      this.location = node['schema:spatial'];
    } else {
      this.location = node.location || '';
    }

    let temporal = '';
    if ( node.temporal !== undefined ) {
      temporal = node.temporal.replace('/', ' - ');
    }
    this.date = temporal || '';

    // TODO: Some of the descriptions are like this: description: @id: http://link.com
    //       So weeding those out by testing to see if they're strings first
    //       Otherwise markdown breaks
    if ( node.description !== false && typeof node.description === 'string' ) {
      this.descriptionEle.innerHTML = markdown.toHTML(node.description || '');
    }

    if ( node.thumbnail ) {
      this.thumbnail = this.endpoint + '/' + this.moment + '/' + node.thumbnail.replace('z:', '');
      this.singleImage.style.backgroundImage = 'url(' + this.thumbnail + ')';
    }

    if ( node.creator ) {
      if ( Array.isArray(node.creator) ) {
        this.imageCreditLink  = node.creator.find(c => c['@id'] !== undefined);
        this.imageCreditTitle = node.creator.find(c => c['@id'] === undefined);
      } else {
        // It's a string and there is no title present
        this.imageCreditLink = node.creator;
      }
    }

    this.relatedLinks = [];
    if ( node.relatedLink && Array.isArray(node.relatedLink) ) {
      let fullLinks = node.relatedLink.filter(link => link['@id'] !== undefined);
      let titles    = node.relatedLink.filter(link => typeof link === 'string');
      if ( fullLinks.length > 0 ) {
        for ( let i=0; i < fullLinks.length; i++ ) {
          let re = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)/;
          let obj = {
            fullLink: fullLinks[i]['@id'],
            shortLink: fullLinks[i]['@id'].replace(re, '').split('/')[0],
            title: (titles[i] ? titles[i].replace('\"', '\'') : '')
          }

          this.relatedLinks.push(obj);
        }
      }
    }

    if( node.type === 'connection' ) {
      this.connectionSubjects = [
        this.graph.nodes[node.src],
        this.graph.nodes[node.dst]
      ];
      this.srctype = this.connectionSubjects[0].type;
      this.dsttype = this.connectionSubjects[1].type;

      if ( this.connectionSubjects[0].thumbnail ) {
        this.srcthumb = this.endpoint + '/' + this.moment + '/' + this.connectionSubjects[0].thumbnail.replace('z:', '');
        this.connectionSrcImg.style.backgroundImage = 'url(' + this.srcthumb + ')';
      }

      if ( this.connectionSubjects[1].thumbnail ) {
        this.dstthumb =  this.endpoint + '/' + this.moment + '/' + this.connectionSubjects[1].thumbnail.replace('z:', '');
        this.connectionDstImg.style.backgroundImage = 'url(' + this.dstthumb + ')';
      }

    } else {
      // find connections
      let connections = [];
      let link;
      for( let id in this.graph.links ) {
        link = this.graph.links[id];

        if ( link.src === node['@id'] ) {
          connections.push({
            link,
            node: this.graph.nodes[link.src]
          });
        } else if ( link.dst === node['@id'] ) {
          connections.push({
            link,
            node: this.graph.nodes[link.dst]
          });
        }
      }

      connections.map(connection => {
        if ( Array.isArray(connection.link.name) ) {
          let string    = connection.link.name[0];
          let substring = connection.link.name[1];

          connection.link.formattedConnection = formatString(string, substring);
        }
      });

      /**
       * @method formatString
       * @description this function identifies the connection type and bolds it.
       *
       * @param {String} string the complete connection string
       * @param {String} substring the word/phrase you're looking to bold
      */
      function formatString(string, substring) {
        let regex = new RegExp(substring, 'g');
        if ( regex.test(string) ) {
          return string.replace(regex, '<b>' + substring + '</b>');
        } else {
          return '<b>' + substring + '</b>&nbsp;' + string;
        }
      }

      // Alphabetize the connections
      connections.sort((a, b) => (a.node.name > b.node.name) ? 1 : -1);

      this.connections = connections;
    }
  }

  renderLink(node) {
    this.type = 'item'
    this.title = node.name;
    this.descriptionEle.innerHTML = markdown.toHTML(node.description || '');
  }

  resetClusterSubjects() {
    this.clusterSubjects = {
      person : {
        enabled : false,
        label : 'People',
        nodes : []
      },
      place : {
        enabled : false,
        label : 'Places',
        nodes : []
      },
      object : {
        enabled : false,
        label : 'Objects',
        nodes : []
      },
      event : {
        enabled : false,
        label : 'Events',
        nodes : []
      }
    }
  }

  /**
   * @method _onToggleKeyUp
   * @description bound to toggle button key-up event
   */
  _onToggleKeyUp(e) {
    if( e.which !== 13 ) return;
    this._fireToggleEvent();
  }

  /**
   * @method _fireToggleEvent
   * @description fire the toggle event.  This is called from
   * _onToggleKeyUp and bound to click event on toggle button
   */
  _fireToggleEvent() {
    this.dispatchEvent(new CustomEvent('toggle'));
  }
}

customElements.define('app-map-info-panel', AppMapInfoPanel);

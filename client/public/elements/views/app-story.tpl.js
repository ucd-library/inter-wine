import { html } from 'lit-element';
import sharedStyles from './../styles/shared-styles'

import '@polymer/iron-icon';
import '@polymer/iron-icons';

import "./app-story-float-btn";

export default function render() {
  return html`
    ${sharedStyles}
    <style>
      :host {
        display: block;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }

      #container {
        height: 100%;
        overflow-y: auto;
      }

      h1, h2, h3, h4, h5, h6 {
        margin: 0px;
        padding: 0px;
        font-style: normal;
      }

      h1 {
        font-size: 20px;
      }

      h2 {
        font-size: 30px;
        line-height: 1.0em;
      }

      h3 {
        font-size: 22px;
      }

      h4 {
        font-size: 15px;
        text-transform: uppercase;
      }

      h6 {
        font-size: 13px;
        text-transform: uppercase;
      }

      .secondary-blue-bg {
        background-color: var(--app-color-secondary-blue);
      }

      .bg-white {
        background-color: var(--app-color-white);
      }

      .bg-tan {
        background-color: var(--app-color-smoke);
      }

      .container {
        position: relative;
      }

      header {
        margin: 0 auto;
        width: 100%;
        background-color: var(--app-color-interface-blue);
      }

      header > .header-image {
        padding-top: 56.25%;
        width: 100%;
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center center;
        /* sets reference point to scale from */
      }

      header > .story-header {
        padding: 50px 0;
        color: var(--app-color-white);
        overflow-x: hidden;
      }

      header > .story-header > ul {
        display: flex;
        justify-content: center;
        list-style: none;
        flex-wrap: wrap;
      }

      header > .story-header > ul > li {
        margin: 0 20px;
      }

      header > .story-header > ul > li:first-of-type {
        text-align: right;
      }

      header > .story-header > ul > li > h2 {
        margin-top: 10px;
        margin-bottom: 15px;
        white-space: nowrap;
      }

      header > .story-header > ul > li > h4 {
        font-weight: bold;
        white-space: nowrap;
      }

      header > .story-header > ul > li > .quote {
        min-width: 250px;
        max-width: 300px;
        font-size: 17px;
      }

      header > .story-header > ul > li > .quote > ul.credit {
        margin: 0;
        padding: 0;
        font-size: 1.0rem;
        list-style-type: '-';
        list-style-position: outside;
      }

      header > .story-header > ul > li > .quote > ul.credit > li {
        width: 100%;
        padding: 20px 0 0 10px;
      }

      section.text-blocks {
        margin: 0 auto;
        padding: 75px;
        max-width: 750px;
        color: var(--app-color-charcoal);
        font-size: 15px;
        font-weight: regular;
      }

      .triptych {
        display: flex;
        width: 100%;
        justify-content: center;
        align-items: flex-end;
        flex-direction: row;
      }

      .triptych div {
        display: flex;
        align-items: flex-end;
        padding-top: 33%;
        width: 33%;
        max-height: 200px;

        color: var(--app-color-white);
        text-align: bottom;

        background-color: var(--app-color-charcoal);
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center center;
      }

      .triptych div:nth-of-type(2),
      .triptych div:nth-of-type(3) {
        margin: 0 0 0 10px;
      }

      .triptych div span {
        padding: 10px 20px;
        color: var(--app-color-white);
        background: rgba(0, 0, 0, 0.5);
      }

      .text-image-pairing {
        display: flex;
        flex-direction: row;
        align-items: stretch;
      }

      .text-image-pairing > div {
        padding: 75px;
        width: 50%;
        position: relative;

        background-size: cover;
        background-repeat: no-repeat;
        background-position: center center;
        /* sets reference point to scale from */
      }

      .text-image-pairing > .text-blocks {
        padding: 75px;
      }

      .text-image-pairing > .image {
        padding: 75px;
        min-height: 700px;
        position: relative;
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center center;
      }

      .text-image-pairing > .image > span {
        padding: 10px 20px;
        position: absolute;
        bottom: 0;
        left: 0;
        color: var(--app-color-white);
        background: rgba(0, 0, 0, 0.5);
      }

      footer > .map-wrapper {
        display: flex;
        flex-direction: row;
      }

      footer > .map-wrapper > .map,
      footer > .map-wrapper > .explore-map {
        padding: 75px;
        width: 50%;
      }

      footer > .map-wrapper > .explore-map {
        background-color: var(--app-color-interface-blue);
      }

      footer > .map-wrapper > .map {
        min-height: 200px;
        background-image: url("../../images/worldmap.jpg");
        background-position-y: center;
        background-position-x: center;
      }

      footer > .map-wrapper > .explore-map > div,
      footer > .map-wrapper > .explore-map > div > p {
        color: var(--app-color-white);
      }

      footer > .map-wrapper > .explore-map > div > iron-icon.explore-map-icon {
        margin-right: 10px;
        display: inline-block;
        vertical-align: top;
        width: 40px;
        height: 40px;
      }

      footer > .bottom-content {
        padding: 30px 30px 50px 30px;
        background-color: var(--app-color-black);
        color: var(--app-color-stone);
      }

      footer > .bottom-content h6 {
        margin-bottom: 15px;
        font-size: 15px;
        font-weight: bold;
      }

      footer > .bottom-content a {
        color: var(--app-color-stone);
        font-size: 13px;
      }

      footer > .bottom-content > ol {
        margin: 0;
        padding-left: 40px;
        counter-reset: my-awesome-counter;
        list-style: none;
      }

      footer > .bottom-content > ol > li {
        position: relative;
        padding-bottom: 15px;
        counter-increment: my-awesome-counter;
        color: var(--app-color-stone);
        font-size: 13px;
      }

      footer > .bottom-content > ol > li::before {
        position: absolute;
        top: -1px;
        left: -2.0rem;
        content: counter(my-awesome-counter);
        color: var(--app-color-stone);
        font-weight: bold;
        font-size: 13px;
      }

      @media screen and (min-width: 700px) and (max-width: 999px) {
        section.text-blocks,
        .text-image-pairing > div,
        .text-image-pairing > .text-blocks,
        .text-image-pairing > .image,
        footer > .map-wrapper > .map,
        footer > .map-wrapper > .explore-map {
          padding: 50px;
        }
      }

      @media screen and (max-width: 699px) {
        header > .story-header > ul > li:first-of-type {
          text-align: initial;
        }

        header > .story-header {
          padding: 20px 0;
          color: var(--app-color-white);
          overflow-x: hidden;
        }

        header > .story-header > ul {
          justify-content: flex-start;
        }

        header > .story-header > ul > li {
          margin: initial;
        }

        header > .story-header > ul > li > .quote {
          max-width: 100%;
        }

        section.text-blocks,
        .text-image-pairing > div,
        .text-image-pairing > .text-blocks,
        .text-image-pairing > .image,
        footer > .map-wrapper > .map,
        footer > .map-wrapper > .explore-map {
          padding: 20px;
        }

        .text-image-pairing {
          flex-direction: column;
        }
        .text-image-pairing > div {
          width: 100%;
        }

        .triptych {
          height: initial;
          flex-direction: column;
          align-items: stretch;
        }
        .triptych div {
          width: 100%;
        }
        .triptych div:first-of-type,
        .triptych div:nth-of-type(2) {
          margin: 0 0 10px 0;
        }
        .triptych div:nth-of-type(3) {
          margin: 0;
        }

        footer > .map-wrapper {
          flex-direction: column;
        }

        footer > .map-wrapper > .map,
        footer > .map-wrapper > .explore-map {
          width: 100%;
        }
      }
    </style>

    <div id="container" class="container" role="main">
      <header>
        <div class="header-image" style="background-image: url('../../images/${this.story.headerImage}');"></div>
        <div class="story-header">
          <ul>
            <li>
              <h4>moments in wine history</h4>
              <h2 class="inverse">${this.story.title}</h2>
            </li>

            <li>
              <div class="quote">
                ${this.story.quote.text}
                <ul class="credit">
                  <li>
                    ${this.story.quote.credit}<br />
                    ${this.story.quote.src}
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </div>
      </header>

      <div style="position: -webkit-sticky; position: sticky; top: 100%; z-index: 1; bottom: 0;">
        <app-story-float-btn id="floatBtn" @click="${this._launchMap}"></app-story-float-btn>
      </div>

      <section class="text-blocks bg-white">
        <h1 ?hidden="${!this.story.text1.title}">${this.story.text1.title}</h1>
        ${this.story.text1.paragraphs.map(paragraph => html`<p>${paragraph}</p>`)}
      </section>

      <section class="text-image-pairing bg-tan">
        <div class="image" style="background-image: url('../../images/${this.story.text2.image.src}');">
          <span>${this.story.text2.image.title}</span>
        </div>
        <div class="text-blocks">
          <h1 ?hidden="${!this.story.text2.title}">${this.story.text2.title}</h1>
          ${this.story.text2.paragraphs.map(paragraph => html`<p>${paragraph}</p>`)}
        </div>
      </section>

      <section class="text-blocks bg-white">
        <h1 ?hidden="${!this.story.text3.title}">${this.story.text3.title}</h1>
        ${this.story.text3.paragraphs.map(paragraph => html`<p>${paragraph}</p>`)}
      </section>

      <div class="triptych">
        ${this.story.triptych.map(image => html`
          <div style="background-image: url('../../images/${image.src}');"><span>${image.title}</span></div>
        `)}
      </div>

      ${this.story.text4?
        html`
        <section class="text-blocks bg-white">
          <h1>${this.story.text4.title}</h1>
          ${this.story.text4.paragraphs.map(paragraph => html`<p>${paragraph}</p>`)}
        </section>
        `:html`<div class="spacer"></div>`
      }

      ${this.story.text5?
        html`
        <section class="text-image-pairing bg-tan">
          <div class="text-blocks">
            <h1>${this.story.text5.title}</h1>
            ${this.story.text5.paragraphs.map(paragraph => html`<p>${paragraph}</p>`)}
          </div>
          <div class="image" style="background-image: url('../../images/${this.story.text5.image.src}'); background-position: bottom center;">
            <span>${this.story.text5.image.title}</span>
          </div>
        </section>
        `:html`<div class="spacer"></div>`}

      <footer>
        <div class="map-wrapper">
          <div class="map"></div>
          <div class="explore-map">
            <div class="map-textbox-wrapper">
              <iron-icon class="explore-map-icon" icon="intert-wine-icons:explore"></iron-icon>
              <span style="display: inline-block;">
                <h4>Explore the Map</h4>
                <h3 class="inverse">${this.story.title}</h3>
              </span>
              <p>
                Learn more about how the people, locations, and wines are connected to
                the ${this.story.title} via the network map of this story in wine history.
              </p>
              <a @click="${this._launchMap}" class="btn inverse">Launch Map</a>
            </div>
          </div>
        </div>

        <div class="bottom-content">
          <h6>Sources</h6>
          <ol>
          ${this.story.sources.map(source => html`
            <li>
              <em>
                ${source.text}
                <a ?hidden="${!source.link}" href="${source.href}">"${source.link}"</a>
              </em>
            </li>
          `)}
          </ol>
      </div>
      </footer>
    </div>
`;}

const express = require('express');
const path    = require('path');
const fetch   = require('node-fetch');
const spaMiddleware = require('@ucd-lib/spa-router-middleware');
const config  = require('../config');

const bundle = `
  <script>
    var CORK_LOADER_VERSIONS = {
      loader : '${config.client.versions.loader}',
      bundle : '${config.client.versions.bundle}'
    }
  </script>
  <script src="/loader/loader.js?_=${config.client.versions.loader}"></script>`;

 // Fetch an array of moment names from the server
 const fetchMoments = async url => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {'Accept': 'application/ld+json; profile="http://www.w3.org/ns/json-ld#flattened"'}
    });

    if ( response.status !== 200 ) {          
      console.error('Error status code: ', response.status);
    } else {
      const json = await response.json();  
      let payload = json['@graph'][0]['keywords'];

      let data = payload.map(x => x.toLowerCase());

      return data.map(d => {
        let array = d.split('/');
        let moment = array[array.length - 1].split('.')[0];
        return moment;
      });
    }
  } catch (e) {
    console.log('Error: ', e);
  }
}

module.exports = (app) => {
  let assetsDir = path.join(__dirname, '..', 'client', config.server.assets);
  console.log('Using assests dir: ' + assetsDir);

  /**
   * Setup SPA app routes
  */
  spaMiddleware({
    app: app, // pass the express app
    htmlFile : path.join(assetsDir, 'index.html'), // pass the file you want to use
    isRoot : true, // are we serving from host root (/)?
    appRoutes : config.server.appRoutes, // array of root paths. ie appRoutes = ['foo', 'bar'] to server /foo/* /bar/*
    getConfig : async (req, res, next) => {
      if ( !config.server.moments ) {
        config.server.moments = await fetchMoments(config.server.endpoint);
      } else {
        fetchMoments(config.server.endpoint)
          .then(moments => {
            if( moments ) config.server.moments = moments
          })
          .catch(e => console.error('Failed to update moments', e));
      }

      next({
        appRoutes : config.server.appRoutes,
        endpoint : config.server.endpoint,
        gaCode : config.client.gaCode,
        moments : config.server.moments
      });
    },
    template : async (req, res, next) => {      
      next({bundle});
    }
  });

  /**
   * Setup static asset dir
  */
  app.use(express.static(assetsDir));
}

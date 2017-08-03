/**
 * @flow
 */
'use strict';

import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const renderMergedProps = (component, source, ...rest) => {
  const finalProps = Object.assign({ source: source }, ...rest);
  return (
    React.createElement(component, finalProps)
  );
}

const SourceRoute = ({ component, source, location, ...rest }) => {

  const params = new URLSearchParams(location.search);
  let urlSource = params.get("source");
  let urlSearch = params.get("search");

  return (
    <Route {...rest} render={routeProps => {
      if (source !== undefined) {

        return (renderMergedProps(component, source, routeProps, rest))

      } else if (urlSource !== null) {

        return (
          <Redirect to={{
            pathname: '/load',
            search: `?source=${urlSource}`,
            state: { from: routeProps.location },
          }}/>
        )

      } else {

        return (
          <Redirect to={{
            pathname: '/load',
            state: { from: routeProps.location },
          }}/>
        )

      }
    }}/>
  );
};

export default SourceRoute;

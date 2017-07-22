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

const SourceRoute = ({ component, source, ...rest }) => {
  return (
    <Route {...rest} render={routeProps => {
      return source ? (
        renderMergedProps(component, source, routeProps, rest)
      ) : (
        <Redirect to={{
          pathname: '/load',
          state: { from: routeProps.location }
        }}/>
      );
    }}/>
  );
};

export default SourceRoute;

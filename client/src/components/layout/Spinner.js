import React, { Fragment } from 'react';

export default function Spinner() {
  return (
    <Fragment>
      <i
        class='fa fa-spinner fa-spin fa-4x'
        style={{ width: '200px', margin: 'auto', display: 'block' }}></i>
    </Fragment>
  );
}

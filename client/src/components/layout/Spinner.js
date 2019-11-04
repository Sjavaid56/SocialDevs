import React, { Fragment } from 'react';
import { css } from '@emotion/core';
// First way to import
import { GridLoader, ClimbingBoxLoader, SyncLoader } from 'react-spinners';
export default function Spinner() {
  const override = css`
    display: block;
    margin: 0 auto;
    border-color: #17a2b8;
    margin-top: 150px;
    margin-left: 410px;
  `;

  return (
    <Fragment>
      <i className='sweet-loading'>
        <SyncLoader
          css={override}
          sizeUnit={'2px'}
          size={5}
          color={'#17a2b8'}
        />{' '}
      </i>{' '}
    </Fragment>
  );
}

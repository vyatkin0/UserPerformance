import * as React from 'react';

import Activities from './components/Activities';
import Performance from './components/Performance';
import { Route } from 'react-router';

export default () =>
    <>
        <Route exact path='/activities' component={Activities} />
        <Route exact path='/' component={Performance} />
    </>

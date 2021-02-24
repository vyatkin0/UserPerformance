import * as React from 'react';
import * as ReactDOM from 'react-dom';

import App from './App';
import { ConnectedRouter } from 'connected-react-router';
import { Provider } from 'react-redux';
import configureStore from './store/configureStore';
import { createHashHistory } from 'history';

// Create browser history to use in the Redux store
//const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href') as string;

// We use createHashHistory instead of createBrowserHistory for compatibility with electron js static pages serving
//const history = createBrowserHistory({ basename: baseUrl });
const history = createHashHistory();

// Get the application-wide store instance, prepopulating with state from the server where available.
const store = configureStore(history);

ReactDOM.render(
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <App />
        </ConnectedRouter>
    </Provider>,
    document.getElementById('root'));
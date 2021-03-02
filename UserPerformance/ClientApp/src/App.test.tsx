import * as ActivitiesStore from './store/Activities';
import * as PerformanceStore from './store/Performance';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Activities from './components/Activities';
import App from './App';
import { MemoryRouter } from 'react-router-dom';
import Performance from './components/Performance';
import PeriodSelect from './components/PeriodSelect';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';

describe('Renders component without crashing', () => {
    it('App renders without crashing', () => {
        const storeFake = (state: any) => ({
            default: () => {},
            subscribe: () => {},
            dispatch: () => {},
            getState: () => ({ ...state })
        });

        const state = {
            activities: ActivitiesStore.emptyState(),
            performance: PerformanceStore.emptyState(),
        };

        const store = storeFake(state) as any;
        
        const elem = document.createElement('div');
        elem.id = 'footerToolbar';

        document.body.appendChild(elem);

        ReactDOM.render(
            <Provider store={store}>
                <MemoryRouter>
                    <Activities/>
                    <Performance/>
                    <App/>
                </MemoryRouter>
            </Provider>, document.createElement('div'));
    });


    it('PeriodSelect renders without crashing', () => {
    const div = document.createElement('div');
    const from = new Date(1);
    const to = new Date(4000);

    ReactDOM.render(<PeriodSelect
        from = {from}
        to = {to}
        minYear = {from.getFullYear()}
        maxYear = {to.getFullYear()}
        onChange = {(from: Date, to: Date)=> ({from,to})}
        />, div);
    });
})

describe('Component snapshots', () => {
    beforeAll(() => {
        ReactDOM.createPortal = jest.fn((element, node) => {
        return element;
      })
    })
  
    afterEach(() => {
        ReactDOM.createPortal.mockClear();
    })
    it('App should render correctly with Node or Function', () => {
       const storeFake = (state: any) => ({
            default: () => {},
            subscribe: () => {},
            dispatch: () => {},
            getState: () => ({ ...state })
        });

        const state = {
            activities: ActivitiesStore.emptyState(),
        };

        const store = storeFake(state) as any;

        const component = renderer.create(<Provider store={store}>
            <MemoryRouter>
                <Activities/>
            </MemoryRouter>
        </Provider>);

        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    })
  });
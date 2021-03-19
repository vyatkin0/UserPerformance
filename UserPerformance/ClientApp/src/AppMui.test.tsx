/**
 * Test for components with material-ui 
 */

/**
 * @jest-environment jsdom
 */

/**
  * https://gist.github.com/gaearon/e7d97cdf38a2907924ea12e4ebdf3c85
  * Or, to select the node environment globally, use this in your package.json:

  {
    "name": "my-project",
    "jest": {
      "testEnvironment": "node"
    }
  }
  The warning about useLayoutEffect should now disappear because window is no longer defined during test execution.
*/

import * as PerformanceStore from './store/Performance';
import * as React from "react";

import Adapter from "enzyme-adapter-react-16";
import AppAlert from "./components/AppAlert";
import ConfirmAlert from "./components/ConfirmAlert";
import { MemoryRouter } from 'react-router-dom';
import Performance from './components/Performance';
import { Provider } from 'react-redux';
import { configure } from "enzyme";
import { createMount } from "@material-ui/core/test-utils";

configure({ adapter: new Adapter() });
describe("Material UI tests", () => {
    const timeNow = new Date('2020-01-01');
    const realDate = Date;

   beforeAll(() => {
    (global as any).Date = class {
            public static now() {
                return timeNow.valueOf();
            }

            constructor(a,b,c) {
                if(a!==undefined && b!==undefined && c!==undefined) {
                    this._date = new realDate(a,b,c);
                } else if(a!==undefined) {
                    this._date = new realDate(a);
                }

                if(!this._date) {
                    this._date = new realDate(timeNow);
                }

                return this._date;
            }

            private _date;

            public valueOf() {
                return this._date.valueOf();
            }
            public setHours(a,b,c,d) {
                return this._date.setHours(a,b,c,d);
            }
            public setDate(d) {
                return this._date.setDate(d);
            }
            public getDay() {
                return this._date.getDay();
            }
            public getDate() {
                return this._date.getDate();
            }
            public getMonth() {
                return this._date.getMonth();
            }
            public getTime() {
                return this._date.getTime();
            }
            public getFullYear() {
                return this._date.getFullYear();
            }
        };
    });

    afterAll(() => {
        global.Date = realDate;
    });

    it("provides constant timestamps", () => {
        const ts1 = Date.now();
        const ts2 = +new Date();
        expect(ts1).toEqual(ts2);
        expect(ts2).toEqual(timeNow.valueOf());
    });
    
    it("App should render ConfirmAlert correctly", () => {
        const wrapper = createMount()(
            <ConfirmAlert
                open={true}
                title="Title"
                message={<span>Test message</span>}
                handleYes={() => {}}
                handleNo={() => {}}
            />
        );

        expect(wrapper.html()).toMatchSnapshot();
    });

    it("App should render AppAlert correctly", () => {
        const elem = document.createElement('div');
        elem.id = 'bottomAlert';

        document.body.appendChild(elem);
        
        const wrapper = createMount()(
            <AppAlert
                messages = {[{   id: 1, severity: 'error', text: 'Test3 message',}]}
            />
        );

        expect(wrapper.html()).toMatchSnapshot();
    });

    it("App should render Performance correctly", () => {
        const storeFake = (state: any) => ({
            default: () => {},
            subscribe: () => {},
            dispatch: () => {},
            getState: () => ({ ...state })
        });

        const state = {
            performance: PerformanceStore.emptyState(),
        };

        const store = storeFake(state) as any;
        
        const elem = document.createElement('div');
        elem.id = 'footerToolbar';

        document.body.appendChild(elem);

        const wrapper = createMount()(<Provider store={store}>
            <MemoryRouter>
                    <Performance/>
            </MemoryRouter>
        </Provider>);

        expect(wrapper.html()).toMatchSnapshot();
    });
});

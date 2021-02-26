/**
 * Performance page state container and actions
 */

import { Action, Reducer } from 'redux';
import {CallHistoryMethodAction, push} from 'connected-react-router';

import Activity from './Activity';
import { AppThunkAction } from './';
import {InfoMessage} from '../components/AppAlert'
import configApi from '../configApi'

/**
 * Rest API request identifier
 */
let messageId: number = 0;

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

/**
 * Performance page state container
 */
export interface PerformanceState {
    isLoading: boolean; // Performance is loading
    isUploading: boolean; //  Performance or new activity is uploading
    messages: InfoMessage[]; // Information messages of the page
    from: Date; // Start date of displayed period of time
    to: Date; // End date of displayed period of time
    performance:UserPerformance; // Current performance
    changes: any; // Container object of current changes made by user
}
interface UserPerformance {
    days: ActivityDay[];
    currentDay: number;
    monthWorkDays: number;
    monthPerformance: number;
    userActivities: UserActivity[];
    userName:string;
    editedDays:number; //Number of days before when counts and hours can be edited by user
    groupedActivities: {};
    minYear:number;
    maxYear:number;
 }

interface ActivityDay
{
    day: Date;
    dayType: number;
    hours: string;
}
interface UserActivity
{
    activity: Activity;
    countPerMonth: number;
    counts: number[];
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.

interface UpdateActivityCountAction {
    type: 'UPDATE_ACTIVITY';
    activityId: number;
    dayIndex: number;
    count: string;
}

interface RequestPerformanceAction {
    type: 'REQUEST_PERFORMANCE';
    from: Date;
    to: Date;
    requestId: number;
}

interface ReceivePerformanceAction {
    type: 'RECEIVE_PERFORMANCE';
    from: Date;
    to: Date;
    performance: UserPerformance; 
    requestId: number;
}

interface SendingPerformanceAction {
    type: 'UPDATE_PERFORMANCE_SENDING';
    requestId: number;
}

interface SentPerformanceAction {
    type: 'UPDATE_PERFORMANCE_SENT';
    requestId: number;
}

interface FetchErrorUploadAction {
    type: 'FETCH_ERROR_UPLOAD';
    error: any;
    requestId: number;
}

interface FetchErrorLoadAction {
    type: 'FETCH_ERROR_LOAD';
    error: any;
    requestId: number;
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = RequestPerformanceAction
| ReceivePerformanceAction
| UpdateActivityCountAction
| SendingPerformanceAction
| SentPerformanceAction
| FetchErrorUploadAction
| FetchErrorLoadAction
| CallHistoryMethodAction<[string, any?]>;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

const _dateToUrl = (date: Date): string => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/**
 *  Performance page state container
 */
export const actionCreators = {
    /**
     * Load performance data
     * 
     * @param from Start date of period
     * @param to End date of period
     */
    requestPerformance: (from: Date, to: Date, mounted:boolean): AppThunkAction<KnownAction> => (dispatch, getState) => {
        // Only load data if it's something we don't already have (and are not already loading)
        const appState = getState();
        if (mounted || (appState && appState.performance && (+from !== +appState.performance.from || +to !== +appState.performance.to))) {

            const requestId = messageId++;

            fetch(`${configApi.url}useractivities?from=${_dateToUrl(from)}&to=${_dateToUrl(to)}`, configApi.fetch)
                .then(response => {
                    if(response.ok) {
                        response.json().then( data => {
                            dispatch({ type: 'RECEIVE_PERFORMANCE', from, to, performance: data, requestId });
                        });
                    } else {
                        response.text().then( text => {
                            dispatch({ type: 'FETCH_ERROR_LOAD', requestId, error : {message:text} });
                        });
                    }
                })
                .catch((error) => {
                    dispatch({ type: 'FETCH_ERROR_LOAD', error, requestId });
                });

            dispatch({ type: 'REQUEST_PERFORMANCE', from, to, requestId });
        }
    },

    /**
     * Upload upload performance from application state
     * 
     */
    sendPerformance: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        // Only load data if it's something we don't already have (and are not already loading)
        const appState = getState();

        const data = [];

        const {changes} = appState.performance;

        Object.keys(changes).forEach( day => {
            Object.keys(changes[day]).forEach( id => {
                const date = _dateToUrl(new Date(Number(day)));

                const value = +id===0 ? {
                    day: date,
                    activityId: Number(id),
                    hours: changes[day][id].count,
                } : {
                    day: date,
                    activityId: Number(id),
                    count: changes[day][id].count,
                };

                data.push(value);
            });
        });

        const requestId = messageId++;

        fetch(configApi.url + 'saveuseractivities',
        {
            ...configApi.fetch,
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify(data) // body data type must match "Content-Type" header
        })
        .then(response => {
            const type = response.ok ? 'UPDATE_PERFORMANCE_SENT' : 'FETCH_ERROR_UPLOAD';
            response.text().then( text => {
                dispatch({ type, requestId, error : {message:text} });
            });
        })
        .catch((error) => {
            dispatch({ type: 'FETCH_ERROR_UPLOAD', error, requestId });
        });

        dispatch({ type: 'UPDATE_PERFORMANCE_SENDING', requestId });
    },

    /**
     * Update performance counts or hours
     */
    updateActivityCount: (activityId: number, dayIndex: number, count:string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'UPDATE_ACTIVITY', activityId, dayIndex, count });
    },
 
    gotoActivities: (event): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch(push('/activities'))
    },
};

export function emptyState() : PerformanceState {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    //const _nextDay = () => { from.setDate(from.getDate()+1); return new Date(from)};

    return {
        from: from,
        to: from, // empty period on startup
        isLoading: false,
        isUploading: false,
        messages:[],
        changes: {},
        performance: {
            days: [{
                    day: from,
                    dayType: 1,
                    hours: '0'
                }],
            currentDay: -1,
            monthWorkDays: 0,
            monthPerformance: 0,
            userActivities: [],
            groupedActivities: {},
            userName: '',
            editedDays: 5,
            minYear:from.getFullYear(),
            maxYear:from.getFullYear(),
        },
    };
}

export function addChange(state : PerformanceState, day, activity, count) {
    const dateKey = day.date.valueOf();
    const {changes} = state;

    if(!changes[dateKey]) {
        changes[dateKey] = {};
    }
    
    const id = null==activity ? 0 : activity.id;
    
    changes[dateKey][id]={ 
        activity,
        count,
    };
}

/**
 * Action to update performance counts or hours
 * @param state Current performance state
 * @param incomingAction New performance state
 */
function _updateActivityCount(state: PerformanceState | undefined, incomingAction: UpdateActivityCountAction)
{
    if ( typeof incomingAction.activityId === "undefined"
       || incomingAction.activityId === null) return state;

    if( 0 === incomingAction.activityId ) {
        if(state.performance.days && state.performance.days.length > incomingAction.dayIndex) {
            const n = Number(incomingAction.count.replace(',','.'));

            if(isFinite(n)) {
                const str = n.toString();
                if(state.performance.days[incomingAction.dayIndex].hours !== str) {
                    
                    addChange(state, state.performance.days[incomingAction.dayIndex], null, str);

                    state.performance.days[incomingAction.dayIndex].hours = str;
                }
            }
            else {
                const allowedChars = ['V', 'v','H','h'];
                const trimmed = incomingAction.count.trim();
                if(allowedChars.includes(trimmed) 
                    && state.performance.days[incomingAction.dayIndex].hours !== trimmed) {

                    addChange(state, state.performance.days[incomingAction.dayIndex], null, trimmed);

                    state.performance.days[incomingAction.dayIndex].hours = trimmed;
                }
            }
        }
    } else {
       
        const activity = state.performance.userActivities.find(ea => ea.activity.id === incomingAction.activityId);

        if(activity && activity.counts) {
            const n = Number(incomingAction.count.replace(',','.'));
            if(isFinite(n) && activity.counts[incomingAction.dayIndex] !== n ) {

                addChange(state, state.performance.days[incomingAction.dayIndex], activity.activity, n);
                
                activity.counts[incomingAction.dayIndex] = n;
            }
        }
    }
}

/**
 * Applies user changes to received from backend data
 * @param changes - Array of user changes
 * @param p - Received performance data
 */
export function applyPerformanceChanges(changes: Object, p : UserPerformance) {
    if(Object.keys(changes).length<1) return;
    
    p.days.forEach((d, index) => {
        const dateKey = d.day.valueOf();
        if(!changes[dateKey]) {
            return;
        }
        Object.keys(changes[dateKey]).forEach( key => {
            const id = Number(key);
            if(id===0) {
                p.days[index].hours = changes[dateKey][key].count;
                return;
            }

            let ea = p.userActivities.find( a => a.activity.id === id);
            if(!ea) {
                ea = {...changes[dateKey][key], counts: []};
                p.userActivities.push(ea);
            }

            ea.counts[index] = changes[dateKey][key].count;        
        });
    });
}

/**
 * Groups activities by parents
 * 
 * @param items Array of activities
 */
function groupBy(items) {
    return items.reduce(
    (result, item) => ({
        ...result,
        [item.activity.parentId]: [
        ...(result[item.activity.parentId] || []),
        item,
        ],
    }), 
    {},
    );
}

export const reducer: Reducer<PerformanceState> = (state: PerformanceState | undefined, incomingAction: Action): PerformanceState => {
    if (state === undefined) {
        return emptyState();
    }

    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'UPDATE_ACTIVITY':
            _updateActivityCount(state, incomingAction as UpdateActivityCountAction);
            break;

        case 'UPDATE_PERFORMANCE_SENDING':
            state.messages.push({ severity: 'info',
                text: 'Uploading...',
                id: action.requestId,
            });
            return {
                ...state,
                isUploading: true,
            };

        case 'UPDATE_PERFORMANCE_SENT':
            state.messages = [...state.messages.filter(m=>m.id !== action.requestId),
                { severity: 'success',
                text: 'Uploaded successfully',
                id: action.requestId,
            }];
            
            return {
                ...state,
                changes: {},
                isUploading: false,
            };

        case 'REQUEST_PERFORMANCE':
            state.messages.push({ severity: 'info',
                text: 'Loading...',
                id: action.requestId,
            });
            return {
                ...state,
                from: action.from,
                to: action.to,
                isLoading: true,
            };
            
        case 'RECEIVE_PERFORMANCE':
            // Only accept the incoming data if it matches the most recent request. This ensures we correctly
            // handle out-of-order responses.
            if (action.from === state.from && action.to === state.to) {

                action.performance.days = action.performance.days.map(d => ({...d, date:new Date(d.day)}));
                applyPerformanceChanges(state, action.performance);

                const newState = {
                    ...state,
                    performance: action.performance,
                    isLoading: false,
                    messages: [],
                };

                if(newState.performance) {
                    newState.performance.groupedActivities = groupBy(newState.performance.userActivities);
                }

                return newState;
            }
            break;
            
        case 'FETCH_ERROR_LOAD':
            state.messages = [...state.messages.filter(m=>m.id !== action.requestId),
                { severity: 'error',
                text: `Unable to load (${action.error.message})`,
                id: action.requestId,
            }];

            return {
                ...state,
                isLoading: false,
            };

        case 'FETCH_ERROR_UPLOAD':
            state.messages = [...state.messages.filter(m=>m.id !== action.requestId),
                { severity: 'error',
                text: `Unable to upload (${action.error.message})`,
                id: action.requestId,
            }];

            return {
                ...state,
                isUploading: false,
            };
    }

    return state;
};

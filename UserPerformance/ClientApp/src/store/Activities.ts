/**
 * State container and actions for performance page
 */

import { Action, Reducer } from 'redux';
import {CallHistoryMethodAction, push} from 'connected-react-router';

import Activity from './Activity';
import { AppThunkAction } from './';
import {InfoMessage} from '../components/AppAlert'
import configApi from '../configApi'

/**
 * Activities page state container and actions
 */
export interface ActivitiesState {
    isLoading: boolean; // Performance is loading
    isUploading: boolean; //  Performance or new activity is uploading
    isDlgOpen: boolean; // Display new activity dialog (true - dialog is opened)
    openedActivity: Activity; // Activity displayed in dialog
    isActivityAdded: boolean; // There are new added activities, list has to be updated
    messages: InfoMessage[]; // Information messages of the page
    activities: EmployeeActivities; // Current list of activities
    groupedActivities: {};
}

/**
 * Rest API request identifier
 */
let messageId: number = 0;

interface EmployeeActivities
{
    activities :  Activity[];
    selected : number[];
    opened: number[];
}

interface ActivityDialogAction {
    type: 'ACTIVITY_DIALOG';
    activity: Activity|undefined;
    open: boolean;
}

interface RequestActivitiesAction {
    type: 'REQUEST_ACTIVITIES';
    requestId: number;
}

interface ReceiveActivitiesAction {
    type: 'RECEIVE_ACTIVITIES';
    activities: EmployeeActivities;
    requestId: number;
}

interface SendingActivitiesAction {
    type: 'ACTIVITIES_SENDING';
    requestId: number;
}

interface SentActivitiesAction {
    type: 'ACTIVITIES_SENT';
    requestId: number;
    onClick: Function;
    activityAdded: boolean;
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

type KnownAction = ActivityDialogAction
| RequestActivitiesAction
| ReceiveActivitiesAction
| SendingActivitiesAction
| SentActivitiesAction
| FetchErrorUploadAction
| FetchErrorLoadAction
| CallHistoryMethodAction<[string, any?]>;

/**
 * Actions with an Activity
 * @param actionUrl Request URL
 * @param actionData Action Data
 * @param dispatch
 * @param getState 
 */
function activityAction(actionUrl: string, actionData: any, dispatch, getState) {
    const appState = getState();

    const data = {employeeId: appState.activities.activities.employeeId, ...actionData};
    const requestId = messageId++;

    fetch( configApi.url + actionUrl,
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
        if(response.ok) {
            response.text().then( data => {
                dispatch({ type: 'ACTIVITIES_SENT', requestId, activityAdded: true, onClick:()=>{} });
                dispatch({ type: 'ACTIVITY_DIALOG', open:false, activity:undefined });
            });
        } else {
            response.text().then( text => {
                dispatch({ type: 'FETCH_ERROR_UPLOAD', requestId, error : {message:text} });
            });
        }
    })
    .catch((error) => {
        dispatch({ type: 'FETCH_ERROR_UPLOAD', error, requestId });
    });

    dispatch({ type: 'ACTIVITIES_SENDING', requestId });
}

/**
 *  Page actions
 */
export const actionCreators = {
    /**
     * Load list of activities
     */
    requestActivities: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        // Only load data if it's something we don't already have (and are not already loading)
        const appState = getState();
        if (appState && appState.activities) {
            const requestId = messageId++;

            fetch(configApi.url + 'activities', configApi.fetch)
            .then(response => {
                if(response.ok) {
                    response.json().then( data => {
                        const opened:number[] = data.selected.reduce((result, id) => {
                            const activity = data.activities.find( a => a.id===id );
                            return activity ? [...result, activity.parentId] : result;
                        }, []);
    
                        data.opened =  [...new Set(opened)]; //only unique values here
                        dispatch({ type: 'RECEIVE_ACTIVITIES', activities: data, requestId });
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
    
            dispatch({ type: 'REQUEST_ACTIVITIES', requestId});
        }
    },

    /**
     * Upload new activity
     * 
     * @param activity new activity to upload
     */
    sendActivity: (activity: Activity): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const data = {options:2, ...activity};
        activityAction('addactivity', data, dispatch, getState);
    },

    /**
     * Delete activity
     * 
     * @param id identifier of activity to delete
     */
    deleteActivity: (id: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const data = {id};
        activityAction('deleteactivity', data, dispatch, getState);
    },

    /**
     * Upload list of selected activities
     */
    sendSelection: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        // Only load data if it's something we don't already have (and are not already loading)
        const appState = getState();

        const data = {
            selected: appState.activities.activities.selected.filter(x => true),
        };
        const requestId = messageId++;

        fetch(configApi.url + 'saveactivities',
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
                const ok = response.ok;
                response.text().then( text => {
                    if(ok) {
                        dispatch({ type: 'ACTIVITIES_SENT', requestId, activityAdded: false, onClick:()=>dispatch(push('/')) });
                    } else {
                        dispatch({ type:'FETCH_ERROR_UPLOAD', requestId, error : {message:text} });
                    }
                });
            })
            .catch((error) => {
                dispatch({ type: 'FETCH_ERROR_UPLOAD', error, requestId });
            });

        dispatch({ type: 'ACTIVITIES_SENDING', requestId });
    },

    /**
     * Show or hide New activity dialog
     * @param open true - show dialog, hide otherwise
     */
    displayActivityDialog: (open: boolean, activity?:Activity): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'ACTIVITY_DIALOG', open, activity});
    },

    gotoHome: (event): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch(push('/'))
    },
};

const unloadedState: ActivitiesState = 
{
    activities: {
        activities:[],
        selected:[],
        opened:[],
    },
    groupedActivities: {},
    messages:[],
    isLoading: false,
    isUploading: false,
    isDlgOpen: false,
    openedActivity: undefined,
    isActivityAdded: false,
}

export function emptyState() {
    return {
        ...unloadedState,
        activities: {
            ...unloadedState.activities,
            activities: [],
            selected: [],
            opened: [],
        },
        groupedActivities: [],
        messages: [],
    };
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
        [item.parentId]: [
        ...(result[item.parentId] || []),
        item,
        ],
    }), 
    {},
    );
}

export const reducer: Reducer<ActivitiesState> = (state: ActivitiesState | undefined, incomingAction: Action): ActivitiesState => {
    if (state === undefined) {
        return emptyState();
    }

    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'ACTIVITY_DIALOG':
            return {
                ...state,
                isDlgOpen: action.open,
                openedActivity: action.activity,
            };

        case 'ACTIVITIES_SENDING':
            state.messages.push({ severity: 'info',
                text: 'Uploading...',
                id: action.requestId,
            });
            return {
                ...state,
                isUploading: true,
            };

        case 'ACTIVITIES_SENT':
            state.messages = [...state.messages.filter(m=>m.id !== action.requestId),
                { severity: 'success',
                text: 'Uploaded successfully',
                id: action.requestId,
                onClick: action.onClick,
            }];

            return {
                ...state,
                isActivityAdded: action.activityAdded,
                isUploading: false,
            };

        case 'REQUEST_ACTIVITIES':
            state.messages.push({ severity: 'info',
                text: 'Loading...',
                id: action.requestId,
            });
            return {
                ...state,
                isLoading: true,
            };
            
        case 'RECEIVE_ACTIVITIES':
            state.messages = state.messages.filter(m=>m.id !== action.requestId);

            return {
                ...state,
                activities: action.activities,
                groupedActivities: groupBy(action.activities.activities),
                isLoading: false,
                isActivityAdded: false,
            };

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

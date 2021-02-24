/**
 * Application store
 */

import * as Activities from './Activities';
import * as Performance from './Performance';

// The top-level state object
export interface ApplicationState {
    performance: Performance.PerformanceState | undefined;
    activities: Activities.ActivitiesState | undefined;
}

// Whenever an action is dispatched, Redux will update each top-level application state property using
// the reducer with the matching name. It's important that the names match exactly, and that the reducer
// acts on the corresponding ApplicationState property type.
export const reducers = {
    performance: Performance.reducer,
    activities: Activities.reducer
};

// This type can be used as a hint on action creators so that its 'dispatch' and 'getState' params are
// correctly typed to match your store.
export interface AppThunkAction<TAction> {
    (dispatch: (action: TAction) => void, getState: () => ApplicationState): void;
}

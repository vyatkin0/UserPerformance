/**
 * @jest-environment node
 */

import * as Performance from '../store/Performance';

describe('Performance store functions', () => {
    test('addChange works correctly', () => {
        const state = { changes: {} };

        const day1 = { date: new Date(1) };
        const activity = { id: 1 };
        const count = 'V';
        Performance.addChange(state, day1, activity, count);

        expect(state.changes).toBeInstanceOf(Object);

        const result = {
            changes: {
                ['1']: {
                    ['1']: {
                        activity,
                        count: 'V',
                    }
                }
            }
        };

        expect(state).toEqual(result);

        const day2 = { date: new Date(2) };
        const count4 = 4;
        Performance.addChange(state, day2, activity, count4);

        const result2 = {
            changes: {
                ['1']: {
                    ['1']: {
                        activity,
                        count: 'V',
                    }
                },
                ['2']: {
                    ['1']: {
                        activity,
                        count: 4,
                    }
                }
            }
        };

        expect(state).toEqual(result2);
    });
    
    test('applyPerformanceChanges works correctly', () => {

        const userActivities = [
            { activity: { id: 1, name: 'a1', description: '' }, counts:[1,1,1] },
            { activity: { id: 2, name: 'a2', description: '' }, counts:[1,1,1] },
            { activity: { id: 3, name: 'a3', description: '' }, counts:[1,1,1] },
        ];


        const up = {
            days:[{date:new Date(1), hours: 8}, {date:new Date(2), hours: 8}, {date:new Date(3), hours: 8}],
            userActivities:userActivities,
        }

        let changes = {};

        Performance.applyPerformanceChanges(changes, up);

        const clone = JSON.parse(JSON.stringify(up.userActivities));

        expect(up.userActivities).toEqual(clone);

        let activity = { id: 1 };
        let count = 'V';
        changes = {
            ['1']: {
                ['1']: {
                    activity,
                    count
                }
            }
        }

        clone[0].counts[0]=count;

        Performance.applyPerformanceChanges(changes, up);
        expect(up.userActivities).toEqual(clone);

        activity = { id: 1 };
        count = 5 ;
        changes = {
            ['2']: {
                ['3']: {
                    activity,
                    count
                }
            }
        }

        clone[2].counts[1]=count;

        Performance.applyPerformanceChanges(changes, up);
        expect(up.userActivities).toEqual(clone);

        activity = { id: 1 };
        count = 5;
        changes = {
            ['2']: {
                ['3']: {
                    activity,
                    count
                }
            },
            ['3']: {
                ['3']: {
                    activity,
                    count
                }
            }
        }

        clone[2].counts[1]=count;
        clone[2].counts[2]=count;

        Performance.applyPerformanceChanges(changes, up);
        expect(up.userActivities).toEqual(clone);
    });
});
/**
 * Activity object interface
 */
export default interface Activity {
    id?: number; // Identifier in Database
    parentId?: number; // Parent identifier
    name: string; // Name of activity
    description: string; // Description of activity
    workCost?: number; // Spent time for activity
}
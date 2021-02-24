/**
 * Content and markup of Activities page
 */

import * as ActivitiesStore from '../store/Activities';
import * as React from 'react';
import * as ReactDOM from 'react-dom'

import {
    Button,
    Checkbox,
    Collapse,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import { WithStyles, withStyles } from '@material-ui/core/styles';

import Activity from '../store/Activity';
import ActivityDialog from './ActivityDialog';
import AppAlert from './AppAlert'
import { ApplicationState } from '../store';
import { connect } from 'react-redux';
import styles from '../styles';

type ActivitiesProps =  ActivitiesStore.ActivitiesState
 & WithStyles<typeof styles>
 & typeof ActivitiesStore.actionCreators;

class Activities extends React.PureComponent<ActivitiesProps> {

    public componentDidMount() {
        this.props.requestActivities();
    }

    public componentDidUpdate() {
        if(this.props.isActivityAdded && !this.props.isLoading && !this.props.isUploading) {
            this.props.requestActivities();
        }
    }

    private handleToggle = (ids:number[], checked:boolean) => {

        const selected = this.props.activities.selected.filter(id => !ids.includes(id));

        if(checked) {
            selected.push(...ids);
        }

        this.props.activities.selected = selected;  
        this.forceUpdate();
    };
    
    private handleParentToggle = (id:number, checked:boolean, children: any[]) => {
        const ids = children.map(a=>a.id);
        ids.push(id);

        if(checked) {
            this.props.activities.opened.push(id); 
        }

        this.handleToggle(ids, checked);

        this.forceUpdate();
    }

    private handleParentToggleOpen = (id:number) => {
        const opened = this.props.activities.opened.filter(i => i!==id);

        if(opened.length === this.props.activities.opened.length) {
            opened.push(id);
        }

        this.props.activities.opened = opened;
        this.forceUpdate();
    }

    private saveActivity = (id: number, name:string, description:string, workCost:number) => {
        const activity:Activity = {
            id,
            name,
            description,
            workCost,
        }

        this.props.sendActivity(activity);
    };

    public render() {
        const { classes } = this.props;
        const activities = this.props.activities;

        const groupedActivities = this.props.groupedActivities;

        const handleToggle = this.handleToggle.bind(this);
        const handleParentToggle = this.handleParentToggle.bind(this); 
        const handleParentToggleOpen =  this.handleParentToggleOpen.bind(this);

        return (
            <>
                <h1>Activities</h1> 
                {
                    Object.keys(groupedActivities).map( key => {
                        if('null' === key){
                            return null;
                        }

                        const parent = activities.activities.find(a => a.id === Number(key));
                        const parentLabelId = `checkbox-list-label-${parent.id}`;
                        const parentChecked = groupedActivities[key].every( a =>activities.selected.includes(a.id));

                        let opened = true;
                        if( parent.id && activities.opened ) {
                            opened = activities.opened.includes(parent.id);
                        }

                        return <React.Fragment key={key}>
                            <div className='flex_container'>
                                <Checkbox
                                    edge="start"
                                    checked={parentChecked}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{ 'aria-labelledby': parentLabelId }}
                                    onChange={()=>handleParentToggle(parent.id, !parentChecked, groupedActivities[key])}
                                />
                                <div className={'flex_container ' + classes.divParent} onClick={()=>handleParentToggleOpen(parent.id)}>
                                    <h2>{parent.name}</h2>
                                    {opened ? <ExpandLess /> : <ExpandMore />}
                                </div>
                            </div>
                            <List>
                            {groupedActivities[key].map( a =>{

                            const labelId = `checkbox-list-label-${a.id}`;
                            const checked = activities.selected.includes(a.id);
                            return <Collapse key={a.id} in={opened} timeout="auto" unmountOnExit>
                            <ListItem dense>
                            <ListItemIcon onClick={()=>handleToggle([a.id], !checked)}>
                            <Checkbox
                                className={classes.divChild}
                                edge="start"
                                checked={checked}
                                tabIndex={-1}
                                disableRipple
                                inputProps={{ 'aria-labelledby': labelId }}
                            />
                            </ListItemIcon>
                            <ListItemText
                                id={labelId}
                                className={classes.divParent}
                                primary={`${a.name} (${a.description})`}
                                onClick={(e)=>{e.preventDefault(); this.props.displayActivityDialog(true, a)}}/>
                            </ListItem>
                            </Collapse>
                            })}
                            </List>
                        </React.Fragment>
                    })
                }

                <AppAlert messages={this.props.messages}/>

                {
                    ReactDOM.createPortal(<div className={classes.divButtons}>
                        <Button variant='contained' color='primary' onClick={this.props.gotoHome}>
                        Cancel
                        </Button>
                        <Button variant='contained' color='primary' onClick={this.props.sendSelection}>
                        Save
                        </Button>
                        <Button variant='contained' color='primary' onClick={()=>this.props.displayActivityDialog(true)}>
                        Add
                        </Button>
                        </div>, document.getElementById("footerToolbar"))
                }
                
                <ActivityDialog
                    activity={this.props.openedActivity}
                    handleDelete={this.props.deleteActivity}
                    handleSave={this.saveActivity}
                    handleClose={()=>this.props.displayActivityDialog(false)}
                    open = {this.props.isDlgOpen}
                />
            </>
        );
    }
}

export default connect(
    (state: ApplicationState) => state.activities,
    ActivitiesStore.actionCreators
  )(withStyles(styles)(Activities) as any);
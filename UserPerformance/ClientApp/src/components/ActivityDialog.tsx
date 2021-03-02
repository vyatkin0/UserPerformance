/**
 * Content and markup of Add new activity dialog
 */

import * as React from 'react';

import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from '@material-ui/core';

import Activity from '../store/Activity';
import ConfirmAlert from './ConfirmAlert';

interface ActivityDialogProps {
    handleDelete(id: number);
    handleSave(id: number, name:string, description:string, workCost:number):void;
    handleClose():void;
    open: boolean;
    activity: Activity;
}

interface ActivityDialogState {
    confirmDeleteOpen: boolean;
}

class ActivityDialog extends React.PureComponent<ActivityDialogProps, ActivityDialogState> {

    constructor(props) {
        super(props);
        this.nameInputRef = React.createRef(); 
        this.descrInputRef = React.createRef();
        this.workCostInputRef = React.createRef();

        this.state = {confirmDeleteOpen: false};
    }

    private nameInputRef; 
    private descrInputRef;
    private workCostInputRef;

    private handleDelete = () => {
        if(this.props.activity) {
            this.setState({confirmDeleteOpen: false});
            this.props.handleDelete(this.props.activity.id);
        }
    }

    private handleSave = () => {
        const id = this.props.activity ? this.props.activity.id : null;

        const workCost = Number(this.workCostInputRef.current.value);
        this.props.handleSave(id, this.nameInputRef.current.value, this.descrInputRef.current.value, workCost);
    }

    private deleteOnClick = (event) => {
        this.setState({confirmDeleteOpen: true});
    }
    public render = () => <>
        <Dialog
            open={this.props.open}
            aria-labelledby='form-dialog-title'
        >
            <DialogTitle id='form-dialog-title'>Activity</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin='dense'
                    id='name'
                    label='Name'
                    fullWidth
                    inputRef={this.nameInputRef}
                    defaultValue={this.props.activity && this.props.activity.name}
                />
                <TextField
                    margin='dense'
                    id='description'
                    label='Description'
                    fullWidth
                    inputRef={this.descrInputRef}
                    defaultValue={this.props.activity && this.props.activity.description}
                />
                <TextField
                    margin='dense'
                    id='workcost'
                    label='Spent time, minutes'
                    type='number'
                    fullWidth
                    inputRef={this.workCostInputRef}
                    defaultValue={this.props.activity && this.props.activity.workCost}
                />
            </DialogContent>
            <DialogActions>
                {this.props.activity && <Button onClick={this.deleteOnClick} color='primary'>
                    Delete
                </Button>}
                <Button onClick={this.handleSave} color='primary'>
                    {this.props.activity ? 'Save' : 'Add'}
                </Button>
                <Button onClick={this.props.handleClose}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
         {this.props.activity && <ConfirmAlert
            key={'delete:'+this.props.activity.id}
            open={this.state.confirmDeleteOpen}
            message={<span>{`Delete activity "${this.props.activity.name}"?`}<br/>You can not undo this action!</span>}
            title='Confirm deleting activity'
            handleNo={()=>this.setState({confirmDeleteOpen: false})}
            handleYes={this.handleDelete}/>}
    </>
}

export default ActivityDialog;
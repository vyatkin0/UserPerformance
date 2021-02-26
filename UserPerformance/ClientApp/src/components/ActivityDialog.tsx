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
    confirmReplaceOpen: boolean;
    nameHelper: string;
    descriptionHelper: string;
    workCostHelper: string;
}

class ActivityDialog extends React.PureComponent<ActivityDialogProps, ActivityDialogState> {

    private defaultState = {
        confirmDeleteOpen: false,
        confirmReplaceOpen:false,
        nameHelper:'',
        descriptionHelper:'',
        workCostHelper:'',
    };

    constructor(props) {
        super(props);
        this.nameInputRef = React.createRef(); 
        this.descrInputRef = React.createRef();
        this.workCostInputRef = React.createRef();

        this.state = {...this.defaultState};
    }

    private nameInputRef; 
    private descrInputRef;
    private workCostInputRef;

    public handleDelete = () => {
        if(this.props.activity) {
            this.setState({confirmDeleteOpen: false});
            this.props.handleDelete(this.props.activity.id);
        }

        this.setState({ ...this.defaultState });
    }
    
    public handleSave = () => {
        const id = this.props.activity ? this.props.activity.id : null;

        const workCost = Number(this.workCostInputRef.current.value);

        if(this.validateFields(this.nameInputRef.current.value, this.descrInputRef.current.value, workCost)) {
            this.props.handleSave(id, this.nameInputRef.current.value, this.descrInputRef.current.value, workCost);

            this.setState({ ...this.defaultState });
        }
    }

    private validateFields = (name:string, description:string, workCost:number) => {
        let result = true;

        if(!name) {
            result = false;
            this.setState({nameHelper: 'Name is not specified'});
        } else {
            this.setState({nameHelper: ''});
        }

        if(!isFinite(workCost) || workCost>24*60 || workCost<=0) {
            result = false;
            this.setState({workCostHelper: 'Wrong value'});
        } else {
            this.setState({workCostHelper: ''});
        }

        return result;
    }

    private handleClose = () => {
        this.props.handleClose();
        this.setState({...this.defaultState});
    }

    public deleteOnClick = (event) => {
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
                    required
                    error={Boolean(this.state.nameHelper)}
                    margin='dense'
                    id='name'
                    label='Name'
                    fullWidth
                    inputRef={this.nameInputRef}
                    defaultValue={this.props.activity && this.props.activity.name}
                    helperText = {this.state.nameHelper}
                />
                <TextField
                    error={Boolean(this.state.descriptionHelper)}
                    margin='dense'
                    id='description'
                    label='Description'
                    fullWidth
                    inputRef={this.descrInputRef}
                    defaultValue={this.props.activity && this.props.activity.description}
                    helperText = {this.state.descriptionHelper}
                />
                <TextField
                    required
                    error={Boolean(this.state.workCostHelper)}
                    margin='dense'
                    id='workcost'
                    label='Spent time, minutes'
                    type='number'
                    fullWidth
                    inputRef={this.workCostInputRef}
                    defaultValue={this.props.activity && this.props.activity.workCost}
                    helperText = {this.state.workCostHelper}
                />
            </DialogContent>
            <DialogActions>
                {this.props.activity && <Button onClick={this.deleteOnClick} color='primary'>
                    Delete
                </Button>}
                <Button onClick={this.handleSave} color='primary'>
                    {this.props.activity ? 'Save' : 'Add'}
                </Button>
                <Button onClick={this.handleClose}>
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
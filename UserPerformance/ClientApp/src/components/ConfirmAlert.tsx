/**
 * Confirmation alert for delete activity action
 */

import React from "react";

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@material-ui/core";

interface ConfirmAlertProps {
    open: boolean;
    title: string;
    message: string | JSX.Element;
    handleYes: () => void;
    handleNo: () => void;
}

export default class ConfirmAlert extends React.PureComponent<ConfirmAlertProps> {
    public render() {

        if (!this.props.open) {
            return null;
        }

        return <Dialog
            open={this.props.open}
            onClose={this.props.handleNo}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {this.props.title}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {this.props.message}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={this.props.handleNo}
                    color="primary"
                    autoFocus
                >
                    No
                </Button>
                <Button
                    onClick={this.props.handleYes}
                    color="primary"
                >
                    Yes
                </Button>
            </DialogActions>
        </Dialog>
    }
}

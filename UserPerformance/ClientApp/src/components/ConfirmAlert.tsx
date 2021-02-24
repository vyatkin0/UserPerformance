/**
 * Confirmation alert for delete activity action
 */

import * as React from "react";

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
    private handleClose = (yes: boolean) => {
        if (yes) {
            return this.props.handleYes();
        }

        this.props.handleNo();
    };

    public render() {
        if (!this.props.open) {
            return null;
        }

        return <Dialog
                open={this.props.open}
                onClose={this.handleClose}
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
                        onClick={() => this.handleClose(false)}
                        color="primary"
                        autoFocus
                    >
                        No
                    </Button>
                    <Button
                        onClick={() => this.handleClose(true)}
                        color="primary"
                    >
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
    }
}

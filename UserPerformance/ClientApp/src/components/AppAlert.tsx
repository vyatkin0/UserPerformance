/**
 * Content and markup of small Alert window with information about results of latest actions
 */

import * as Alert from '@material-ui/lab/Alert';
import * as React from 'react';
import * as ReactDOM from 'react-dom'

import { WithStyles, withStyles } from '@material-ui/core/styles';

import styles from '../styles';

export let currentMessageId: number = 0;

export interface InfoMessage {
   id: number;
   severity: Alert.Color;
   text: string;
   timeoutID?: any;
   onClick?: Function;
}

interface AppAlertProps extends WithStyles<typeof styles> {
    messages: InfoMessage[];
}

class AppAlert extends React.PureComponent<AppAlertProps> {
    private handleClickAlert = (id: number) => {
        if(this.props.messages.length < 1) {
            return null;
        }

        const index = this.props.messages.findIndex(m => m.id===id);

        if (index > -1) {

            if(this.props.messages[index].timeoutID){
                clearTimeout(this.props.messages[index].timeoutID);
            }

            if(this.props.messages[index].onClick){
                this.props.messages[index].onClick();
            }

            this.props.messages.splice(index, 1);
            this.forceUpdate();
        }
    }

    public componentWillUnmount() {   
        this.props.messages.forEach( m =>{
            if(m.timeoutID) {
                clearTimeout(m.timeoutID);
                m.timeoutID = null;
            }
        });
    }

    public render() {
        if(this.props.messages.length < 1) {
            return null;
        }

        const { classes } = this.props;
        const message = this.props.messages[0];

        if(message.severity === 'success'){
            message.timeoutID = setTimeout(()=>this.handleClickAlert(message.id), 3000);
        }
        
        return ReactDOM.createPortal(<Alert.default className={classes.alert} variant='filled' severity={message.severity} onClick={() => this.handleClickAlert(message.id)}>
                {message.text}
            </Alert.default>,
             document.getElementById("bottomAlert")) 
    }
}

export default withStyles(styles)(AppAlert);
/**
 * Content and markup of Performance page
 */

import * as PerformanceStore from '../store/Performance';
import * as React from 'react';
import * as ReactDOM from 'react-dom'

import {
    Button,
    Link,
    MenuItem,
    Popover,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField
} from '@material-ui/core';
import {ChevronLeftRounded, ChevronRightRounded} from '@material-ui/icons';
import { WithStyles, withStyles } from '@material-ui/core/styles';

import AppAlert from './AppAlert'
import { ApplicationState } from '../store';
import Paper from '@material-ui/core/Paper';
import PeriodSelect from './PeriodSelect';
import { connect } from 'react-redux';
import styles from '../styles';

type PerformanceProps =  PerformanceStore.PerformanceState
 & WithStyles<typeof styles>
 & typeof PerformanceStore.actionCreators; // ... plus action creators we've requested

class Performance extends React.PureComponent<PerformanceProps> {

    constructor(props) {
        super(props);
        this.countsInputRef = React.createRef(); // Input in popover window 
    }

    public componentDidMount() {
        
        // Support for electron environment
        const w = window as any;
        if (typeof w.ipcRenderer === 'undefined') {
            window.addEventListener('beforeunload', this.confirmExit.bind(this));
        } else {
            w.ipcRenderer.on('app-close', (event, arg) => {
                const fakeEvent = {returnValue: true, preventDefault:()=>{}};
                this.confirmExit(fakeEvent);

                event.returnValue = typeof fakeEvent.returnValue !== 'undefined';
                w.ipcRenderer.send('closed', event.returnValue);
            });
        }
 
        const now = new Date();
        const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const to = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        this.props.requestPerformance(from, to, true);
        //this.ensureDataFetched();
    }
    
    public componentDidUpdate() {
        this.ensureDataFetched();
    }

    private ensureDataFetched() {
        this.props.requestPerformance(this.props.from, this.props.to, false);
    }

    private countsInputRef;

    private currentPopper = {id: undefined, open:false, anchorEl: null, activityId:undefined, dayIndex:undefined};

    private confirmExit = (e) => {
        if(Object.keys(this.props.changes).length>0){
            // Cancel the event
            e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown

            // Chrome requires returnValue to be set
            e.returnValue = 'Changes are not saved!';

            return e.returnValue;
        }
        else {
            // the absence of a returnValue property on the event will guarantee the browser unload happens
            delete e['returnValue'];
        }
    }
    private handleClick = (event: React.MouseEvent<HTMLSpanElement>, activityId:number, dayIndex:number) => {
        if( this.props.performance.currentDay < 0) {
            return;
        }
        
        const offset = this.props.performance.currentDay-dayIndex;
        if( offset<0 || offset>=this.props.performance.editedDays ) {
            return;
        }

        this.currentPopper = {
            id: 'simple-popper',
            open: true,
            anchorEl: event.currentTarget,
            activityId,
            dayIndex,
        };

        this.forceUpdate();
    };

    private handleClose = (update: boolean) => {
        const {activityId, dayIndex} = this.currentPopper;
        
        if ( typeof activityId === 'undefined'
            || activityId === null) return;

        this.currentPopper = {
            id: undefined,
            open: false,
            anchorEl: null,
            activityId:undefined,
            dayIndex:undefined
        };

        if(update) {
            this.props.updateActivityCount(activityId, dayIndex, this.countsInputRef.current.value);
        }

        this.forceUpdate();
    };

    private handleChangePeriod = (event: React.ChangeEvent<{ value: unknown }>) => {
        const startYear = '2021';
        const startDate = new Date(`${startYear}-${event.target.value}-01`);
        startDate.setDate(startDate.getDate()-(startDate.getDay()===0 ? 6 : startDate.getDay()-1));
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate()+7);
        //endDate.setMonth(startDate.getMonth()+1);
        this.props.requestPerformance(startDate, endDate, false);
    };

    private setCurrentWeek = ():boolean => {
        if(this.props.from.getDay()!==1 || this.props.to.getDay()!==1)
        {
            const from = new Date(this.props.from.getFullYear(), this.props.from.getMonth(), this.props.from.getDate() - (this.props.from.getDay()===0 ? 6 : this.props.from.getDay()-1));
            const to = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 7);
            this.props.requestPerformance(from, to, false);
            return false;
        }

        return true;
    }

    private handlePopperKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        switch(event.key)
        {
        case 'Enter':
            event.preventDefault();
            this.handleClose(true);
            break;
        }
    }

    private renderStub = () => 
        <div className='flex_container'>
            <div>
                <h1>Activities management</h1>
            </div>
        </div> 


    /**
     * Content and markup small windows for edit counts of task and day hours
     */
    private renderEditPopover = () => {

        const { classes } = this.props;
        const currentPopper = this.currentPopper;

        return <Popover
            id={currentPopper.id}
            open={currentPopper.open}
            anchorEl={currentPopper.anchorEl}
            onClose={(e, reason) => this.handleClose(reason==='backdropClick')}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
        >
            <div className={classes.popover}>
                {currentPopper.anchorEl && <TextField variant='outlined'
                autoFocus
                inputRef={this.countsInputRef}
                label='Value'
                defaultValue={currentPopper.anchorEl.innerText}
                margin='dense'
                InputProps={{
                    classes: {
                        input: classes.textField,
                    }}}
                onKeyPress =  {this.handlePopperKeyPress}
                />}
            </div>
            </Popover>
    }

    /**
     * Content and markup of summary for month performance
     */
    private renderMonthInfo = () => {

        const { classes } = this.props;

        const performance = this.props.performance;

        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const nowNextDay = new Date(now);
        nowNextDay.setDate(nowNextDay.getDate() + 1);
        
        const lastDay = new Date(this.props.to);
        lastDay.setDate(lastDay.getDate() - 1);
        
        return <>
        <div className='flex_container'>
            <div>
                <h1>Activities management</h1>
                <h3>{performance.userName}</h3>
            </div>
            <PeriodSelect
            from = {this.props.from}
            to = {this.props.to}
            minYear = {this.props.performance.minYear}
            maxYear = {this.props.performance.maxYear}
            onChange = {(from: Date, to: Date)=> this.props.requestPerformance(from, to, false)}
            />
        </div>
        <div className='performance_container'>
            Month performance
            <span className={(performance.monthPerformance < 100 ? 'warning ' : '') + 'performance_data'} >{performance.monthPerformance+'%'}</span>
            Working days
            <span className='performance_data'>{performance.monthWorkDays}</span>
        </div>
        </>
    }

    /**
     * Content and markup of table with performance for each day of specified period
     */
    private renderDaysInfo = () => {

        const { classes } = this.props;

        const performance = this.props.performance;
        const handleClick = this.handleClick.bind(this);
        
        return <TableContainer component={Paper}>
            <Table className={classes.table} size='small' aria-label='simple table'>
                <TableHead>
                <TableRow>
                    <TableCell align='left'>Name</TableCell>
                    <TableCell className={classes.monthHeadCell} align='center'></TableCell>
                    {performance.days.map((day,index) =>
                        <TableCell key={'month:'+ index} className={classes.numCell} align='center'>{`${day.date.getDate()}.${day.date.getMonth()+1}`}</TableCell>)}
                </TableRow>
                </TableHead>
                <TableBody>
                <TableRow>
                    <TableCell component='th' scope='row'>Day performance</TableCell>
                    <TableCell align='center'></TableCell>
                    {performance.days.map((d, index)=>{

                        let monthPerformance = '';
                        const dayHours = Number(d.hours);

                        let className = null;

                        if(dayHours>0)
                        { 
                            const mp = performance.userActivities.reduce((result, a)=> {
                                if(a.counts[index]>0 && a.activity.workCost>0) {
                                    return result + a.counts[index]*a.activity.workCost/60/dayHours;
                                }
                                
                                return result;
                            } , 0);

                            monthPerformance = parseFloat((mp * 100).toFixed(2)) + '%'

                            if(mp<1) {
                                className = classes.warnCell;
                            }
                        }

                        return <TableCell key={'month:'+ index} align='center' className={className}>{monthPerformance}</TableCell>})}
                </TableRow>
                <TableRow>
                    <TableCell component='th' scope='row'>Spent hours</TableCell>
                    <TableCell align='center'></TableCell>
                    {performance.days.map((d, index)=> {
                        let className = index<=performance.currentDay && index+performance.editedDays>performance.currentDay ? classes.cellSpan + ' ' + classes.cellSpanCurrent : classes.cellSpan;

                        if(this.isValueChanged(d.date.valueOf(), 0)) {
                            className += ' ' + classes.changedValue;
                        }

                        return <TableCell key={'month:'+ index} align='center'>
                        {<span className={className} onClick={(e)=>handleClick(e, 0, index)}>{d.hours}</span>}
                    </TableCell>})}
                </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    }

    /**
     * Footer content and markup
     */
    private renderFooterPortal = () => {
        const { classes } = this.props;
        
        const saveBtnDisabled = !(Object.keys(this.props.changes).length>0);

        return ReactDOM.createPortal(<div className={classes.divButtons}>
            <Button variant='contained' color='secondary' disabled={saveBtnDisabled} onClick={this.props.sendPerformance}>
            Save
            </Button>
            <Button variant='contained' color='primary' href='#/activities'/*this.props.gotoActivities*/>
            Select activities
            </Button>
            </div>, document.getElementById('footerToolbar'))
    }

    /**
     * User Performance content and markup
     */
    private renderUserActivities = () => {

        const performance = this.props.performance;

        const { classes } = this.props;

        const groupedActivities = performance ? performance.groupedActivities : {};

        const handleClick = this.handleClick.bind(this);

        return Object.keys(groupedActivities).map(key => {
            if ('null' === key) {
                return null;
            }

            const parent = performance.userActivities.find(ua => ua.activity.id === Number(key)).activity;

            return <React.Fragment key={key}>
                <h2>{parent.name}</h2>
                <TableContainer component={Paper}>
                    <Table className={classes.table} size='small' aria-label='simple table'>
                        <TableHead>
                            <TableRow>
                                <TableCell align='left'>Activity</TableCell>
                                <TableCell className={classes.monthHeadCell} align='center'>Spent time</TableCell>
                                <TableCell className={classes.monthHeadCell} align='center'>Count per month</TableCell>
                                {performance.days.map((day, index) =>
                                    <TableCell key={key + ':' + index} className={classes.numCell} align='center'>{`${day.date.getDate()}.${day.date.getMonth() + 1}`}</TableCell>)}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {groupedActivities[key].map(ua => <TableRow key={ua.activity.id}>
                                <TableCell component='th' scope='row'>{ua.activity.name}</TableCell>
                                <TableCell align='center'>{ua.activity.workCost}</TableCell>
                                <TableCell align='center'>{ua.countPerMonth}</TableCell>
                                {performance.days.map((d, index) => {
                                    let className = index <= performance.currentDay && index + performance.editedDays > performance.currentDay ? classes.cellSpan + ' ' + classes.cellSpanCurrent : classes.cellSpan;

                                    if (this.isValueChanged(d.date.valueOf(), ua.activity.id)) {
                                        className += ' ' + classes.changedValue;
                                    }

                                    return <TableCell key={ua.activity.id + ':' + index} align='center'>
                                        {<span className={className} onClick={(e) => handleClick(e, ua.activity.id, index)}>{ua.counts[index]}</span>}
                                    </TableCell>
                                })}
                            </TableRow>)}
                        </TableBody>
                    </Table>
                </TableContainer>
            </React.Fragment>
        })
    }

    isValueChanged(day, activityId) :boolean {
        if (Object.keys(this.props.changes).length<1) {
            return false;
        }

        return this.props.changes[day]
            && this.props.changes[day][activityId];
    }
    
    public render() {
        const performance = this.props.performance;
        
        if(!performance || !performance.days || performance.days.length<1) {
            return this.renderStub();
        }

        return (
            <>
                {this.renderMonthInfo()}
                {this.renderEditPopover()}
                {this.renderDaysInfo()}
                {this.renderUserActivities()}
 
                <AppAlert messages={this.props.messages}/>

                { this.renderFooterPortal() }
            </>
        );
    }
}

export default connect(
    (state: ApplicationState) => state.performance,
    PerformanceStore.actionCreators
  )(withStyles(styles)(Performance) as any);
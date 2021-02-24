/**
 * Content and markup of weeks selection component
 */

import * as React from 'react';

import {ChevronLeftRounded, ChevronRightRounded} from '@material-ui/icons';
import {Divider, Link, Menu, MenuItem} from '@material-ui/core';

interface PeriodSelectProps {
    from: Date;
    to: Date;
    minYear: number;
    maxYear: number;
    onChange: Function;
}

interface PeriodSelectState {
    anchorMonthEl:HTMLElement
    anchorYearEl:HTMLElement
}

export default class PeriodSelect extends React.PureComponent<PeriodSelectProps, PeriodSelectState> {

    constructor(props){
        super(props);
        this.state={anchorMonthEl: null, anchorYearEl: null};
    }
    private setCurrentWeek = ():boolean => {
        if(this.props.from.getDay()!==1 || this.props.to.getDay()!==1)
        {
            const from = new Date(this.props.from.getFullYear(), this.props.from.getMonth(), this.props.from.getDate() - (this.props.from.getDay()===0 ? 6 : this.props.from.getDay()-1));
            const to = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 7);

            this.props.onChange(from, to);
            return false;
        }

        return true;
    }

    private handleChangeMonth = (value) => {
        const startYear = this.props.to.getFullYear();
        const startDate = new Date(`${startYear}-${value}-01`);
        this.handleChangeDate(startDate);
        this.handleSelectClose();
    }

    private handleChangeYear = (value) => {
        const startMonth = this.props.to.getMonth();
        const startDate = new Date(`${value}-${startMonth+1}-01`);
        this.handleChangeDate(startDate);
        this.handleSelectClose();
    }

    private handleChangeDate = (startDate: Date) => {
        startDate.setDate(startDate.getDate()-(startDate.getDay()===0 ? 6 : startDate.getDay()-1));
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate()+7);

        if(!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            this.props.onChange(startDate, endDate);
        }
    }

    private handleNextWeek = (event: React.MouseEvent) => {
        event.preventDefault();
        if(this.setCurrentWeek()) {
            const nextDay = new Date(this.props.to);
            nextDay.setDate(nextDay.getDate() + 7);
            this.props.onChange(this.props.to, nextDay);
        }
    }

    private handlePrevWeek = (event: React.MouseEvent) => {
        event.preventDefault();
        if(this.setCurrentWeek()) {
            const prevDay = new Date(this.props.from);
            prevDay.setDate(prevDay.getDate() - 7);
            this.props.onChange(prevDay, this.props.from);
        }
    }

    private renderYears() {
        const minYear = this.props.minYear || this.props.from.getFullYear();
        const maxYear = this.props.maxYear || this.props.to.getFullYear();

        const lastDay = new Date(this.props.to);
        lastDay.setDate(lastDay.getDate() - 1);

        const selectedValue = lastDay.getFullYear();

        const result = [];
        for(let i=minYear; i<=maxYear; ++i) {
            const value = i;

            result.push(<MenuItem
                    key={i}
                    value={value}
                    selected={value===selectedValue}
                    onClick={(event) => this.handleChangeYear(value)}>
                    {value}
                </MenuItem>);
        }

        return <>
        <div
            className='period_control__select'
            onClick={this.handleYearSelectClick}
        >{lastDay.getFullYear()}</div>
        <Menu
            anchorEl={this.state.anchorYearEl}
            keepMounted
            open={Boolean(this.state.anchorYearEl)}
            onClose={this.handleSelectClose}
        >
        {result}
        </Menu>
        </>
    }

    private handleYearSelectClick = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        this.setState({anchorYearEl: event.currentTarget});
        event.currentTarget.blur();
    };

    private handleMonthSelectClick = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        this.setState({anchorMonthEl: event.currentTarget});
        event.currentTarget.blur();
    };
 
    private handleSelectClose = () => {
        this.setState({anchorMonthEl: null, anchorYearEl: null});
    };

    private renderMonths() {

        const months = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ];

        const lastDay = new Date(this.props.to);
        lastDay.setDate(lastDay.getDate() - 1);

        const selectedValue = lastDay.getMonth()+1;

        const result=[];
        for(let i=0; i<months.length; ++i) {
            const value = i+1;

            result.push(<MenuItem
                    key={i+1}
                    value={value}
                    selected={value===selectedValue}
                    onClick={(event) => this.handleChangeMonth(value)}>
                    {months[i]}
                </MenuItem>);
        }

        return <>
            <div
                className='period_control__select'
                onClick={this.handleMonthSelectClick}
            >{months[lastDay.getMonth()]}</div>
            <Menu
                anchorEl={this.state.anchorMonthEl}
                keepMounted
                open={Boolean(this.state.anchorMonthEl)}
                onClose={this.handleSelectClose}
            >
            {result}
            </Menu>
        </>
    }

    public render() {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const nowNextDay = new Date(now);
        nowNextDay.setDate(nowNextDay.getDate() + 1);

        const lastDay = new Date(this.props.to);
        lastDay.setDate(lastDay.getDate() - 1);

        return <div className='period_control'>
            <Link href='#' onClick={this.handlePrevWeek}>
            <ChevronLeftRounded/></Link>
                <span>{this.props.from.getDate() + ' - ' + lastDay.getDate()}</span>
            <Link href='#' onClick={this.handleNextWeek}>
            <ChevronRightRounded/></Link>
            <Divider orientation='vertical' flexItem />
            {this.renderMonths()}
            <Divider orientation='vertical' flexItem />
            {this.renderYears()}
            <Divider orientation='vertical' flexItem />
            <div
                className='period_control__select'
                onClick={(e) => { e.preventDefault(); this.props.onChange(now, nowNextDay); e.currentTarget.blur(); }}
            >Today {now.toLocaleDateString()/*`${now.getMonth()+1}/${now.getDate()}`*/}</div>
            </div>
    }
}
import {Theme} from '@material-ui/core';

export default (theme:Theme) => ({
    table: {
        minWidth: 650,
    },
    textField:{
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 60,
    },
    cellSpan:{
        display: 'block',
        width: 45,
        height: 40,
        border: '1px solid #EBECF2',
        borderRadius: 3,
        verticalAlign: 'middle',
        lineHeight: '40px',
        textOverflow:'ellipsis',
        margin:'auto',
    },
    cellSpanCurrent:{
        borderColor: '#2E75F2',
    },
    monthHeadCell:{
        width: 84,
    },
    warnCell:{
        color: '#F19E21',
    },
    numCell:{
        width: 45,
    },
    popover:{
        padding: theme.spacing(1),
    },
    selectPeriod:{
        color: '#2E75F2',
        marginLeft: 12,
        marginRight: 24,
    },
    divButtons:{
        '& > *': {
            margin: theme.spacing(1),
        }
    },
    alert:{
        margin: theme.spacing(1),
    },
    changedValue:{
        color: '#EB4F47',
    },
    divParent:{
        cursor: 'pointer'
    },
    divChild:{
        padding: 0
    },
  });
/**
 * Api calls configuration
 */
const isDevMode = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
const defaultBackend = '/api/';
const backend = (isDevMode ? process.env.REACT_APP_BACKEND : process.env.REACT_APP_LOCAL_BACKEND) || defaultBackend;
export default class {
    static url:string = backend;
    
    static fetch: RequestInit = {
        mode: backend===defaultBackend ? 'same-origin' : 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: backend===defaultBackend ? 'same-origin' : 'include', // include, *same-origin, omit
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    };
}
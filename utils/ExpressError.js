class ExpressError extends Error {
    constructor(status, message) {
        super(message);       // pass only the message to the Error constructor
        this.status = status; // custom property for HTTP status code
    }
}

module.exports = ExpressError;

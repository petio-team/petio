import { StatusCodes } from "http-status-codes";
import HttpError from "./http";

export default class InternalError extends HttpError {
    constructor() {
        super();
        this.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        this.code = 'INTERNAL_ERROR';
        this.message = 'The server encountered an internal error.';
    }
}
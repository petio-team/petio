import { StatusCodes } from "http-status-codes";
import HttpError from "./http";

export default class NotFound extends HttpError {
    constructor() {
        super();
        this.statusCode = StatusCodes.NOT_FOUND;
        this.code = 'UNKNOWN_ENDPOINT';
        this.message = 'The requested endpoint does not exist.';
    }
}
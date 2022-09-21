import { StatusCodes } from "http-status-codes";
import HttpError from "./http";

export default class BadRequest extends HttpError {
    constructor(error: string) {
        super();
        this.statusCode = StatusCodes.BAD_REQUEST;
        this.code = 'BAD_REQUEST';
        this.message = error;
    }
}
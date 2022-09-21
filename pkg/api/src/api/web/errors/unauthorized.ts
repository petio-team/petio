import { StatusCodes } from "http-status-codes";
import HttpError from "./http";

export default class Unauthorized extends HttpError {
    constructor() {
        super();
        this.statusCode = StatusCodes.UNAUTHORIZED;
        this.code = 'UNAUTHORIZED';
        this.message = 'The request was not authorized for this action.';
    }
}
import { StatusCodes } from "http-status-codes";
import BadRequest from "./badRequest";
import InternalError from "./internalError";
import NotFound from "./notFound";

describe('Errors', () => {
    it('should internal error', (done) => {
        const error = new InternalError();
        expect(error.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(error.code).toEqual('INTERNAL_ERROR');
        expect(error.message).toEqual('The server encountered an internal error.');
        done();
    });
    it('should not found error', (done) => {
        const error = new NotFound();
        expect(error.statusCode).toEqual(StatusCodes.NOT_FOUND);
        expect(error.code).toEqual('UNKNOWN_ENDPOINT');
        expect(error.message).toEqual('The requested endpoint does not exist.');
        done();
    });
    it('should bad request error', (done) => {
        const stringError = 'The request was invalid or cannot be otherwise served.';
        const error = new BadRequest(stringError);
        expect(error.statusCode).toEqual(StatusCodes.BAD_REQUEST);
        expect(error.code).toEqual('BAD_REQUEST');
        expect(error.message).toEqual(stringError);
        done();
    });
});

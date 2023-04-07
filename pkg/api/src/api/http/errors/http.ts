export default class HttpError extends Error {
    // The HTTP status code
    statusCode: number;

    // The code unique to the application
    code: string;

    // The error message
    message: string;
}
export class RepositoryError extends Error {}

export const NotFoundError = new RepositoryError('no media server was found');
export const NotCreatedError = new RepositoryError(
  'failed to create a new media server instance',
);
export const NotCreatedOrUpdatedError = new RepositoryError(
  'failed to create or update media server instance',
);
export const NotUpdatedError = new RepositoryError(
  'failed to update a media server instance',
);
export const NotDeletedError = new RepositoryError(
  'failed to soft delete the server instance',
);
export const NotRemovedError = new RepositoryError(
  'failed to remove the server instance',
);
export const NotRestoredError = new RepositoryError(
  'failed to restore the server instance',
);

/**
 * Represents a jobber that registers jobs.
 */
export interface Jobber {
  /**
   * Registers the job.
   */
  register(): Promise<void>;
}

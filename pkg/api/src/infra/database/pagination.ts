/**
 * Represents the direction of pagination order.
 */
export enum PaginationOrderDirection {
  ASC = 'asc',
  DESC = 'desc'
}

/**
 * Represents the pagination order for a database query.
 * The keys of this object represent the fields to order by,
 * and the values represent the direction of the ordering.
 */
export type PaginationOrder = Record<string, PaginationOrderDirection>;

/**
 * Represents the paging options for a database query.
 */
export type PaginationPaging = {
  limit: number;
  offset: number;
}

/**
 * Represents the pagination options for a database query.
 */
export type PaginationOptions = {
  paging?: PaginationPaging;
  order?: PaginationOrder;
}

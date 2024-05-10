import { Identifier } from 'diod';

/**
 * Represents a class constructor.
 * @template T - The type of the class instance.
 */
export type ClassConstructor<T> = { new (...args: any[]): T };

/**
 * The userContainer object is responsible for retrieving instances of classes.
 * It provides a `get` method that takes a class constructor or function as a parameter
 * and returns an instance of that class.
 */
let userContainer: {
  get<T>(someClass: ClassConstructor<T> | Function): T;
  findTaggedServiceIdentifiers<T = unknown>(tag: string): Array<Identifier<T>>;
};

/**
 * Allows resolving objects using the IoC container
 */
export interface IocAdapter {
  /**
   * Return
   */
  get<T>(someClass: ClassConstructor<T>): T;

  /**
   * Return
   */
  findTaggedServiceIdentifiers<T = unknown>(tag: string): Array<Identifier<T>>;
}

/**
 * Sets container to be used.
 */
export function useContainer(iocAdapter: IocAdapter) {
  userContainer = iocAdapter;
}

/**
 * Gets the IOC container used.
 * @param someClass A class constructor to resolve
 */
export function getFromContainer<T>(
  someClass: ClassConstructor<T> | Function,
): T {
  return userContainer.get(someClass);
}

/**
 * Finds tagged services.
 * @param tag The tag name
 */
export function findTaggedServiceIdentifiers<T = unknown>(
  tag: string,
): Array<Identifier<T>> {
  return userContainer.findTaggedServiceIdentifiers(tag);
}

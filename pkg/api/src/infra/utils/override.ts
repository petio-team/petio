/**
 * Represents a type that overrides selected properties of another type.
 *
 * @template Type - The original type.
 * @template NewType - The type containing the properties to override in `Type`.
 */
export type Override<
  Type,
  NewType extends { [key in keyof Type]?: NewType[key] },
> = Omit<Type, keyof NewType> & NewType;

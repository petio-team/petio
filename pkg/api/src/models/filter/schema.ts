import { prop } from "@typegoose/typegoose";
import { BaseSchema } from "../base";
import { FilterActions, FilterFilters } from "./dto";

export class FilterSchema extends BaseSchema {
  @prop()
  filters: FilterFilters[];

  @prop()
  actions: FilterActions;
}

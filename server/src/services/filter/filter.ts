import { Service } from 'diod';

import { FilterEntity } from '@/resources/filter/entity';
import { FilterMapper } from '@/resources/filter/mapper';
import { FilterRepository } from '@/resources/filter/repository';
import { FilterType } from '@/resources/filter/types';
import { UpdateFilterProps } from '@/services/filter/types';

/**
 * Service for managing filters.
 */
@Service()
export class FilterService {
  constructor(
    private filterRepo: FilterRepository,
    private filterMapper: FilterMapper,
  ) {}

  /**
   * Retrieves all filters.
   * @returns An array of filter responses.
   */
  async getFilters() {
    const filters = await this.filterRepo.findAll();
    return filters.map((f) => this.filterMapper.toResponse(f));
  }

  /**
   * Updates the movie filter.
   * @param props - The properties to update the movie filter with.
   * @returns A boolean indicating whether the update was successful.
   */
  async updateMovieFilter(props: UpdateFilterProps) {
    const movieFilters = await this.filterRepo.findOne({ id: 'movie_filters' });
    if (movieFilters.isSome()) {
      const updated = await this.filterRepo.updateMany(
        { id: 'movie_filters' },
        {
          data: props,
        },
      );
      return updated;
    }
    if (movieFilters.isNone()) {
      await this.filterRepo.create(
        FilterEntity.create({
          type: FilterType.MOVIE,
          filters: props.filters,
          actions: props.actions,
          collapse: props.collapse,
        }),
      );
      return true;
    }
    return false;
  }

  /**
   * Updates the show filter.
   * @param props - The properties to update the show filter with.
   * @returns A boolean indicating whether the update was successful.
   */
  async updateShowFilter(props: UpdateFilterProps) {
    const showFilters = await this.filterRepo.findOne({ id: 'tv_filters' });
    if (showFilters.isSome()) {
      const updated = await this.filterRepo.updateMany(
        { id: 'tv_filters' },
        {
          data: props,
        },
      );
      return updated;
    }
    if (showFilters.isNone()) {
      await this.filterRepo.create(
        FilterEntity.create({
          type: FilterType.SHOW,
          filters: props.filters,
          actions: props.actions,
          collapse: props.collapse,
        }),
      );
      return true;
    }
    return false;
  }
}

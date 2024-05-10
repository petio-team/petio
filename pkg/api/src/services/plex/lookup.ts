import { getFromContainer } from '@/infra/container/container';
import { MovieRepository } from '@/resources/movie/repository';
import { ShowRepository } from '@/resources/show/repository';

export default async (id, type) => {
  if (type === 'movie') {
    const movieRepo = getFromContainer(MovieRepository);
    const result = await movieRepo.findOne({
      ratingKey: id,
    });
    if (result.isNone()) {
      return null;
    }
    return result.unwrap();
  }
  const showRepo = getFromContainer(ShowRepository);
  const result = await showRepo.findOne({
    ratingKey: id,
  });
  if (result.isNone()) {
    return null;
  }
  return result.unwrap();
};

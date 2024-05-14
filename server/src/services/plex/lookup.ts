import { getFromContainer } from '@/infrastructure/container/container';
import { MovieRepository } from '@/resources/movie/repository';
import { ShowRepository } from '@/resources/show/repository';

export default async (id: string, type: 'movie' | 'show') => {
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

export async function movieDbLookup(id: string) {
  const movieResult = await getFromContainer(MovieRepository).findOne({
    ratingKey: id,
  });
  if (movieResult.isNone()) {
    return null;
  }
  return movieResult.unwrap();
}

export async function showDbLookup(id: string) {
  const showResult = await getFromContainer(ShowRepository).findOne({
    ratingKey: id,
  });
  if (showResult.isNone()) {
    return null;
  }
  return showResult.unwrap();
}

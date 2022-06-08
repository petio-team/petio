import Movie from '../../models/movie';
import Show from '../../models/show';

export default async (id, type) => {
  let plexMatch = false;
  if (type === 'movie') {
    plexMatch = await Movie.findOne({
      ratingKey: id,
    }).exec();
  } else {
    plexMatch = await Show.findOne({
      ratingKey: id,
    }).exec();
  }
  if (!plexMatch) {
    return { error: 'not found, invalid key' };
  } else {
    return plexMatch;
  }
};

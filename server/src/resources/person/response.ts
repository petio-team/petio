/**
 * Represents the properties of a person response.
 */
export type PersonResponseProps = {
  id: number;
  name: string;
  imdb_id: string;
  adult: boolean;
  also_known_as: null;
  biography: string;
  birthday: null;
  deathday: null;
  place_of_birth: null;
  popularity: number;
  profile_path: string;
  gender: number;
  homepage: null;
  known_for_department: string;
  images: {
    profiles: [
      {
        aspect_ratio: number;
        height: number;
        iso_639_1: null;
        file_path: string;
        vote_average: number;
        vote_count: number;
        width: number;
      },
    ];
  };
};

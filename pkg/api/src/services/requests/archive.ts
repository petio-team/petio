import { getFromContainer } from '@/infra/container/container';
import { ArchiveRepository } from '@/resources/archive/repository';

export const getArchive = async (userId) => {
  const requests = await getFromContainer(ArchiveRepository).findOne({
    users: userId,
  });
  return { requests };
};

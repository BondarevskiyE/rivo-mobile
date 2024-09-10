import {IndexUpdate} from '@/shared/api/types';

export type IndexUpdateWithActiveStatus = {
  isActive: boolean;
} & IndexUpdate;

export const getIndexUpdatesWithStatuses = (
  fetchedUpdates: IndexUpdate[],
  storedUpdatesLength: number,
): IndexUpdateWithActiveStatus[] => {
  return fetchedUpdates.map((update, index) => {
    return {
      ...update,
      isActive: index + 1 > storedUpdatesLength,
    };
  });
};

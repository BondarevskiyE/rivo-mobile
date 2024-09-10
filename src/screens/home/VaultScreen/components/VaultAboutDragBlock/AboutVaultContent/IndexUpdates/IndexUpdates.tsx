import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';

import {UpdatesIndicator} from '@/components';
import {Colors, Fonts} from '@/shared/ui';
import {ArrowLineIcon} from '@/shared/ui/icons';
import Modal from '@/modal-manager';
import {IndexUpdatesModal} from './IndexUpdatesModal';
import {useVaultsStore} from '@/store/useVaultsStore';
import {Vault} from '@/shared/types';
import {getAllIndexUpdates} from '@/shared/api';
import {IndexUpdate} from '@/shared/api/types';
import {
  IndexUpdateWithActiveStatus,
  getIndexUpdatesWithStatuses,
} from './helpers';

function openIndexUpdatesModal(
  updates: IndexUpdateWithActiveStatus[],
  onClose: () => void,
) {
  Modal.show({
    children: <IndexUpdatesModal updates={updates} />,
    dismissable: true,
    position: 'bottom',
    onHide: onClose,
  });
}

interface Props {
  vault: Vault;
}

export const IndexUpdates: React.FC<Props> = ({vault}) => {
  const [isLoading, setIsLoading] = useState(false);

  const [fetchedUpdates, setFetchedUpdates] = useState<IndexUpdate[]>([]);

  const storedUpdatesLength = useVaultsStore(
    state => state.vaultUpdatesLengthMap[vault.address],
  );

  const setVaultUpdatesLength = useVaultsStore(
    state => state.setVaultUpdatesLength,
  );

  const fetchUpdates = async () => {
    setIsLoading(true);
    const updates = await getAllIndexUpdates(vault.chain, vault.name);

    setFetchedUpdates(updates || []);
    setIsLoading(false);
  };

  const onCloseModal = () => {
    setVaultUpdatesLength(vault.address, fetchedUpdates.length);
  };

  useEffect(() => {
    fetchUpdates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updatesWithStatus = getIndexUpdatesWithStatuses(
    fetchedUpdates,
    storedUpdatesLength,
  );

  const isActive = fetchedUpdates.length !== storedUpdatesLength;

  const textColor = isActive ? Colors.ui_green_55 : Colors.ui_grey_735;

  return (
    <Pressable
      style={styles.container}
      onPress={() =>
        !isLoading && openIndexUpdatesModal(updatesWithStatus, onCloseModal)
      }>
      <UpdatesIndicator isActive={isActive} />
      <Text style={[styles.text, {color: textColor}]}>Index Updates</Text>
      <ArrowLineIcon width={10} height={8} color={textColor} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    marginHorizontal: 4,
  },
});

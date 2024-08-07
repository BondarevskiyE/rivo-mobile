import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';

import {UpdatesIndicator} from '@/components';
import {Colors, Fonts} from '@/shared/ui';
import {ArrowLineIcon} from '@/shared/ui/icons';
import Modal from '@/modal-manager';
import {IndexUpdatesModal} from './IndexUpdatesModal';

function openIndexUpdatesModal(updates: string[]) {
  Modal.show({
    children: <IndexUpdatesModal updates={updates} />,
    dismissable: true,
    position: 'bottom',
  });
}

export const IndexUpdates = () => {
  const isActive = true;
  const textColor = isActive ? Colors.ui_green_55 : Colors.ui_grey_735;
  return (
    <Pressable
      style={styles.container}
      onPress={() => openIndexUpdatesModal([])}>
      <UpdatesIndicator isActive />
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

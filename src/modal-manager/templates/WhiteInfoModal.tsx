import {Pressable, StyleSheet, View} from 'react-native';
import {BaseBottomModalContainer} from '../components';
import {Colors} from '@/shared/ui';
import {Modal} from '../Modal';
import {CloseIcon} from '@/shared/ui/icons';
import {withChildren} from '@/shared/types';

type Props = {height?: number} & withChildren;

export const WhiteInfoModal = ({height = 380, children}: Props) => {
  return (
    <BaseBottomModalContainer>
      <View style={[styles.container, {height}]}>
        <Pressable style={styles.closeIconContainer} onPress={Modal.hide}>
          <CloseIcon color={Colors.ui_grey_73} />
        </Pressable>
        {children}
      </View>
    </BaseBottomModalContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',

    backgroundColor: Colors.ui_white,
    borderRadius: 32,
    paddingTop: 64,
  },
  closeIconContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    backgroundColor: Colors.ui_grey_02,
    borderRadius: 18,
    zIndex: 2,
  },
});

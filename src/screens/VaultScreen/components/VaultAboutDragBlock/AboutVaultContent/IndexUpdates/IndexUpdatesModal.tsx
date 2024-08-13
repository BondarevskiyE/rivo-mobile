import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import RNFadedScrollView from 'rn-faded-scrollview';

import {Colors, Fonts} from '@/shared/ui';
import {ArrowLineIcon} from '@/shared/ui/icons';
import {WhiteInfoModal} from '@/modal-manager';

interface Props {
  updates: string[];
}

export const IndexUpdatesModal: React.FC<Props> = ({updates}) => {
  const [isShowArrow, setIsShowArrow] = useState(false);

  const isEmpty = !updates.length;

  return (
    <WhiteInfoModal>
      <View style={styles.container}>
        {isEmpty ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Here you will see Index Updates History
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.title}>Index Updates</Text>
            <RNFadedScrollView
              bounces={false}
              style={styles.scrollContainer}
              allowStartFade={false}
              allowEndFade
              horizontal={false}
              fadeSize={80}
              isCloseToEnd={value => setIsShowArrow(!value)}
              fadeColors={['rgba(248, 242, 239, 0)', 'rgba(248, 242, 239, 1)']}>
              {/* <Text style={[styles.text, styles.textMargin]}>
            The index is being supported by the Rivo team, consistently managing
            the set of strategies and tokens inside the index.
          </Text> */}
            </RNFadedScrollView>
            {isShowArrow && (
              <View style={styles.arrowIconContainer}>
                <ArrowLineIcon
                  color={Colors.ui_grey_735}
                  style={styles.arrowIcon}
                />
              </View>
            )}
          </>
        )}
      </View>
    </WhiteInfoModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 3,
    position: 'relative',
  },
  title: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: Colors.ui_black_80,
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  text: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.ui_grey_735,
    paddingHorizontal: 10,
  },
  textMargin: {
    marginBottom: 30,
  },
  scrollContainer: {
    flex: 1,
    marginBottom: 20,
  },
  arrowIconContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  arrowIcon: {
    transform: [
      {
        rotate: '90deg',
      },
    ],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.ui_grey_70,
  },
});

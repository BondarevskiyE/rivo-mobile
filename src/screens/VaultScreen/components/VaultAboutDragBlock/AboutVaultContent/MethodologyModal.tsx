import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Unorderedlist from 'react-native-unordered-list';
import RNFadedScrollView from 'rn-faded-scrollview';

import {Colors, Fonts} from '@/shared/ui';
import {ArrowLineIcon} from '@/shared/ui/icons';
import {WhiteBottomInfoModal} from '@/modal-manager/modals/WhiteBottomInfoModal';

export const MethodologyModal = () => {
  const [isShowArrow, setIsShowArrow] = useState(true);

  return (
    <WhiteBottomInfoModal>
      <View style={styles.container}>
        <Text style={styles.title}>Methodology</Text>
        <RNFadedScrollView
          bounces={false}
          style={styles.scrollContainer}
          allowStartFade={false}
          allowEndFade
          horizontal={false}
          fadeSize={80}
          isCloseToEnd={value => setIsShowArrow(!value)}
          fadeColors={['rgba(248, 242, 239, 0)', 'rgba(248, 242, 239, 1)']}>
          <Text style={[styles.text, styles.textMargin]}>
            The index is being supported by the Rivo team, consistently managing
            the set of strategies and tokens inside the index.
          </Text>
          <Text style={styles.text}>
            Existing strategies can be unwound and replaced under following
            circumstances:
          </Text>
          <Unorderedlist color={Colors.ui_grey_735} style={styles.text}>
            <Text style={styles.text}>
              Strategy APY falls below the benchmark
            </Text>
          </Unorderedlist>

          <Unorderedlist color={Colors.ui_grey_735} style={styles.text}>
            <Text style={styles.text}>
              Strategy, underlying assets or protocols are subject to an exploit
              or are operating under extreme conditions
            </Text>
          </Unorderedlist>
          <Unorderedlist color={Colors.ui_grey_735} style={styles.text}>
            <Text style={styles.text}>
              Strategy APY falls below the benchmark
            </Text>
          </Unorderedlist>

          <Unorderedlist color={Colors.ui_grey_735} style={styles.text}>
            <Text style={styles.text}>
              Strategy, underlying assets or protocols are subject to an exploit
              or are operating under extreme conditions
            </Text>
          </Unorderedlist>
          <Unorderedlist color={Colors.ui_grey_735} style={styles.text}>
            <Text style={styles.text}>
              Strategy APY falls below the benchmark
            </Text>
          </Unorderedlist>

          <Unorderedlist color={Colors.ui_grey_735} style={[styles.text]}>
            <Text style={styles.text}>
              Strategy, underlying assets or protocols are subject to an exploit
              or are operating under extreme conditions
            </Text>
          </Unorderedlist>
        </RNFadedScrollView>
        {isShowArrow && (
          <View style={styles.arrowIconContainer}>
            <ArrowLineIcon
              color={Colors.ui_grey_735}
              style={styles.arrowIcon}
            />
          </View>
        )}
      </View>
    </WhiteBottomInfoModal>
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
});

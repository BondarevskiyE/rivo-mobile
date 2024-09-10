import React, {useRef} from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ReAnimated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {InstagramStoriesPublicMethods} from '@birdwingo/react-native-instagram-stories';

import { Button } from '@/components';
import {CollapsableText} from '@/components/CollapsableText';
import {VideoStories} from '@/components/VideoStories';
import {BUTTON_TYPE} from '@/components/general/Button/Button';
import {scannerUrls} from '@/shared/constants';
import {openInAppBrowser} from '@/shared/helpers/url';
import {Vault} from '@/shared/types';
import {Colors, Fonts, Images} from '@/shared/ui';
import {GlobeIcon} from '@/shared/ui/icons';
import {useBalanceStore} from '@/store/useBalanceStore';


const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface Props {
  //   backgroundImage: string; // FIX change to NodeRequire when we get url from backend
  vault: Vault;
  descriptionText: string;
  imageShiftValue: SharedValue<number>;
  advantages: {image: string; text: string}[];
  openInvestForm: () => void;
  openWithdrawForm: () => void;
}

export const InfoBlock: React.FC<Props> = ({
  //   backgroundImage,
  vault,
  descriptionText,
  imageShiftValue,
  advantages,
  openInvestForm,
  openWithdrawForm,
}) => {
  const storiesRef = useRef<InstagramStoriesPublicMethods>(null);

  const indexBalance = useBalanceStore(
    state => state.indexesBalanceMap?.[vault.address.toLowerCase()],
  );

  const onHandleOpenInvestForm = () => {
    openInvestForm();

    storiesRef.current?.hide();
  };

  const onHandleOpenWithdrawForm = () => {
    openWithdrawForm();

    storiesRef.current?.hide();
  };

  const onGoToVaultOnchain = () => {
    openInAppBrowser(`${scannerUrls[vault.chain]}/address/${vault.address}`);
  };

  const containerStyles = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          imageShiftValue.value,
          [0, -400],
          [-120, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const isIndexWithBalance = !!indexBalance?.usd;

  return (
    <View style={styles.container}>
      <ReAnimated.View style={containerStyles}>
        <View style={[styles.imageContainer]}>
          <Image source={Images.vaultInfoMock} style={styles.image} />
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.collapsableTextContainer}>
            <CollapsableText
              text={descriptionText}
              fontSize={16}
              linePadding={9}
              minLines={3}
              SecondaryButton={
                <Pressable onPress={onGoToVaultOnchain}>
                  <View style={styles.viewOnchainButton}>
                    <Text style={styles.viewOnchainText}>View onchain</Text>
                    <GlobeIcon />
                  </View>
                </Pressable>
              }
            />
          </View>
          <View style={styles.dividerLine} />
          <View style={styles.storiesContainer}>
            <VideoStories
              ref={storiesRef}
              footerComponent={
                <View style={{backgroundColor: Colors.ui_black}}>
                  <View style={styles.sendTxButtonsContainer}>
                    <Button
                      text="Invest"
                      style={[
                        styles.sendTxButton,
                        isIndexWithBalance
                          ? styles.halfWidthButton
                          : styles.fullWidthButton,
                      ]}
                      textStyle={styles.sendTxButtonText}
                      type={BUTTON_TYPE.ACTION_SECONDARY}
                      onPress={onHandleOpenInvestForm}
                    />
                    {isIndexWithBalance && (
                      <Button
                        text="Withdraw"
                        style={[styles.sendTxButton, styles.halfWidthButton]}
                        textStyle={styles.sendTxButtonText}
                        type={BUTTON_TYPE.ACTION}
                        onPress={onHandleOpenWithdrawForm}
                      />
                    )}
                  </View>
                </View>
              }
            />
          </View>
          <View style={styles.dividerLine} />
          <View style={styles.advantagesBlock}>
            {advantages.map(advantage => (
              <View key={advantage.text} style={styles.advantagesBlockItem}>
                <Image
                  source={{uri: advantage.image}}
                  style={styles.advantageImage}
                />
                <Text style={styles.advantageText}>{advantage.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ReAnimated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 28,
    overflow: 'hidden',
  },
  imageContainer: {
    top: 0,
    height: 120,
    width: '100%',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: Colors.ui_white,
  },
  collapsableTextContainer: {
    paddingHorizontal: 12,
  },
  viewOnchainButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 5.4,
  },
  viewOnchainText: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.ui_orange_80,
  },
  dividerLine: {
    width: '100%',
    height: 0.5,
    backgroundColor: Colors.ui_grey_07,
    marginVertical: 24,
  },
  storiesContainer: {
    paddingHorizontal: 12,
  },
  advantagesBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  advantagesBlockItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: 104,
  },
  advantageImage: {
    width: 64,
    height: 64,
  },
  advantageText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 16.8,
    color: Colors.ui_grey_70,
    textAlign: 'center',
  },
  fullWidthButton: {
    width: SCREEN_WIDTH - 24,
  },
  halfWidthButton: {
    width: SCREEN_WIDTH / 2 - 12,
  },
  sendTxButton: {
    height: 56,
    borderRadius: 28,
    bottom: 15,

    left: 12,
  },
  sendTxButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 17,
  },
  sendTxButtonsContainer: {
    height: 63,
    justifyContent: 'space-between',
    flexDirection: 'row',
    gap: 4,
    width: SCREEN_WIDTH - 12 - 12,
  },
});

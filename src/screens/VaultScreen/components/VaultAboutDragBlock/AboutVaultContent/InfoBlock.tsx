import {Button, ExternalLink} from '@/components';
import {CollapsableText} from '@/components/CollapsableText';
import {VideoStories} from '@/components/VideoStories';
import {BUTTON_TYPE} from '@/components/general/Button/Button';
import {Colors, Fonts, Images} from '@/shared/ui';
import {GlobeIcon} from '@/shared/ui/icons';
import React from 'react';
import {Alert, Dimensions, Image, StyleSheet, Text, View} from 'react-native';
import ReAnimated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

const {width} = Dimensions.get('window');

interface Props {
  //   backgroundImage: string; // FIX change to NodeRequire when we get url from backend
  descriptionText: string;
  imageShiftValue: SharedValue<number>;
  advantages: {image: string; text: string}[];
}

export const InfoBlock: React.FC<Props> = ({
  //   backgroundImage,
  descriptionText,
  imageShiftValue,
  advantages,
}) => {
  const containerStyles = useAnimatedStyle(() => ({
    marginTop: interpolate(
      imageShiftValue.value,
      [0, -400],
      [-120, 0],
      Extrapolation.CLAMP,
    ),
  }));
  return (
    <View style={styles.container}>
      <ReAnimated.View style={[styles.imageContainer, containerStyles]}>
        <Image source={Images.vaultInfoMock} style={styles.image} />
      </ReAnimated.View>
      <View style={styles.contentContainer}>
        <View style={styles.collapsableTextContainer}>
          <CollapsableText
            text={descriptionText}
            fontSize={16}
            linePadding={9}
            minLines={3}
            SecondaryButton={
              <ExternalLink url="https://rivo.xyz">
                <View style={styles.viewOnchainButton}>
                  <Text style={styles.viewOnchainText}>View onchain</Text>
                  <GlobeIcon />
                </View>
              </ExternalLink>
            }
          />
        </View>
        <View style={styles.dividerLine} />
        <View style={styles.storiesContainer}>
          <VideoStories
            footerComponent={
              <View style={{height: 63, backgroundColor: Colors.ui_black}}>
                <Button
                  text="Invest"
                  style={styles.investButton}
                  textStyle={styles.investButtonText}
                  type={BUTTON_TYPE.ACTION_SECONDARY}
                  onPress={() => Alert.alert('invest!')}
                />
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
      <View />
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
  investButton: {
    height: 56,
    borderRadius: 28,
    bottom: 15,
    width: width - 24,
    left: 12,
  },
  investButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 17,
  },
});

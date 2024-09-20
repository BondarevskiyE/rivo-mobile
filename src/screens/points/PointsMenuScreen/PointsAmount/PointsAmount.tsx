import {View, Image, Text, Dimensions, StyleSheet} from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';

import {Colors, Fonts, Images} from '@/shared/ui';
import {formatNumber} from '@/shared/lib/format';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface Props {
  value: number;
}

export const PointsAmount: React.FC<Props> = ({value}) => {
  return (
    <View style={styles.pointsTextContainer}>
      <MaskedView
        style={styles.maskedView}
        maskElement={
          <View style={styles.maskWrapper}>
            <View
              style={{
                position: 'relative',
              }}>
              <Image
                source={Images.pointsStar}
                style={styles.pointsStarIcon}
                resizeMode="contain"
              />
              <Text style={styles.pointsAmountText}>{formatNumber(value)}</Text>
            </View>
          </View>
        }>
        <Image source={Images.pointsMaskBackground} style={styles.maskImage} />
      </MaskedView>
    </View>
  );
};

const styles = StyleSheet.create({
  pointsTextContainer: {
    height: 64,
  },
  pointsStarIcon: {
    position: 'absolute',
    height: 32,
    width: 32,
    top: 7,
    left: -32,
  },
  pointsAmountText: {
    fontSize: 64,
    fontFamily: Fonts.semiBold,
    color: Colors.ui_orange_80,
  },
  maskedView: {
    flexDirection: 'row',
    height: 75,
  },
  maskImage: {
    width: SCREEN_WIDTH,
  },
  maskWrapper: {
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
});

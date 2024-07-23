import {Button} from '@/components';
import {BUTTON_TYPE} from '@/components/general/Button/Button';
import {Strategy} from '@/shared/types';
import {Colors, Fonts, Images} from '@/shared/ui';
import React, {useState} from 'react';
import {
  // NativeModules,
  // LayoutAnimation,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ReAnimated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  vault: Strategy;
}

const {height} = Dimensions.get('window');

const descriptionFontSize = 16;
const descriptionLinePadding = 9;
const lineHeight = descriptionFontSize + descriptionLinePadding;
const minLines = 3;
const isIos = Platform.OS === 'ios';
// const {UIManager} = NativeModules;

// UIManager.setLayoutAnimationEnabledExperimental &&
//   UIManager.setLayoutAnimationEnabledExperimental(true);

export const AboutVaultContent: React.FC<Props> = ({vault}) => {
  const [isDescriptionOpen, setIsDescriptionOpen] = useState<boolean>(false);
  const [maxLines, setMaxLines] = useState(minLines);
  // when false animated view will be set to screen dimensions so that all text is shown
  const [linesCalculated, setLinesCalculated] = useState(isIos ? false : true);

  const currentLines = useSharedValue(minLines);

  const handleToggle = () => {
    const newVal = !isDescriptionOpen;
    currentLines.value = withTiming(newVal ? maxLines : minLines);
    setIsDescriptionOpen(newVal);
  };

  const descriptionStyle = useAnimatedStyle(() => {
    return {
      overflow: 'hidden',
      // if lines arent calculated give view maximum height
      height: !linesCalculated ? height : currentLines.value * lineHeight,
    };
  });

  return (
    <LinearGradient
      style={{flex: 1, borderRadius: 10}}
      colors={['rgba(255, 255, 255, 1)', 'rgba(238, 231, 231, 1)']}>
      <View style={styles.container}>
        <Text style={styles.title}>About strategy</Text>
        <ReAnimated.View style={descriptionStyle}>
          <Text
            style={styles.description}
            onTextLayout={e => {
              // use onTextLayout to get number of lines
              if (Platform.OS === 'android') {
                setMaxLines(e.nativeEvent.lines.length);
              }
              // with the view taking up all screen space all lines should render
              if (isIos && !linesCalculated) {
                setMaxLines(e.nativeEvent.lines.length);
                setLinesCalculated(true);
              }
            }}>
            {vault.description}
          </Text>
        </ReAnimated.View>
        <TouchableOpacity onPress={handleToggle}>
          <Text style={styles.showMore}>Show more +</Text>
        </TouchableOpacity>
        <Image source={Images.storiesMock} />

        <View style={styles.buttonContainer}>
          <Button
            text="Invest"
            style={styles.investButton}
            textStyle={styles.investButtonText}
            type={BUTTON_TYPE.ACTION_SECONDARY}
            onPress={() => Alert.alert('invest!')}
          />
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '90%',
    paddingTop: 10,
    paddingHorizontal: 12,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    lineHeight: 25.2,
    color: Colors.ui_black_80,

    marginBottom: 12,
  },
  description: {
    fontFamily: Fonts.regular,
    fontSize: descriptionFontSize,
    lineHeight: 24,
    color: Colors.ui_black_63,
  },
  showMore: {
    fontFamily: Fonts.medium,
    fontSize: 15,
    lineHeight: 15,
    color: Colors.ui_orange_80,
  },
  buttonContainer: {
    marginTop: 'auto',
  },
  investButton: {
    height: 56,
    borderRadius: 28,
  },
  investButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 17,
  },
});

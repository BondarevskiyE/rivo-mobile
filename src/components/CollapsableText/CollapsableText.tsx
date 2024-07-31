import React, {useState} from 'react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ReAnimated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';

import {Fonts, Colors} from '@/shared/ui';

const {height} = Dimensions.get('window');

const descriptionFontSize = 16;
const isIos = Platform.OS === 'ios';

interface Props {
  text: string;
  fontSize: number;
  linePadding: number;
  minLines: number;
}

export const CollapsableText: React.FC<Props> = ({
  text,
  fontSize,
  linePadding,
  minLines,
}) => {
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

  const lineHeight = fontSize + linePadding;

  const descriptionStyle = useAnimatedStyle(() => {
    return {
      overflow: 'hidden',
      // if lines arent calculated give view maximum height
      height: !linesCalculated ? height : currentLines.value * lineHeight,
    };
  });
  return (
    <View>
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
          {text}
        </Text>
      </ReAnimated.View>
      <TouchableOpacity onPress={handleToggle}>
        <Text style={styles.showMore}>Show more +</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
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
});

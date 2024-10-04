import React from 'react';
import {StyleSheet} from 'react-native';
import Video from 'react-native-video';

interface Props {
  source: NodeRequire;
}

export const VideoBackground: React.FC<Props> = ({source}) => {
  return (
    <Video
      resizeMode="contain"
      muted
      repeat
      disableFocus
      focusable={false}
      // @ts-ignore NodeRequire is a right type here
      source={source}
      style={styles.backgroundVideo}
    />
  );
};

const styles = StyleSheet.create({
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    flex: 1,
    opacity: 0.05,
  },
});

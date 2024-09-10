import React, {forwardRef} from 'react';
import {View} from 'react-native';
import InstagramStories, {
  InstagramStoriesPublicMethods,
} from '@birdwingo/react-native-instagram-stories';
import {InstagramStoryProps} from '@birdwingo/react-native-instagram-stories/src/core/dto/instagramStoriesDTO';

import {Colors} from '@/shared/ui';

// const {height, width} = Dimensions.get('window');
interface Props {
  stories?: InstagramStoryProps[];
  footerComponent?: React.ReactNode;
}

const stories: InstagramStoryProps[] = [
  {
    id: 'user1',
    name: 'test',
    imgUrl:
      'https://cdn-dev.rivo.xyz/static/posters/overview/manifesto/cover.png',
    stories: [
      {
        id: 'story1',
        source: {
          uri: 'https://cdn-dev.rivo.xyz/static/stories/videos/mooHopUSDC/6.mp4',
        },
        mediaType: 'video',
      },
      {
        id: 'story2',
        source: {
          uri: 'https://cdn-dev.rivo.xyz/static/stories/videos/yvDAI/2.mp4',
        },
        mediaType: 'video',
      },
    ],
  },
  {
    id: 'user2',
    name: 'test2',
    imgUrl: 'https://cdn-dev.rivo.xyz/static/posters/yvCurve-3Crypto-f/1.png',
    stories: [
      {
        id: 'story1',
        source: {
          uri: 'https://cdn-dev.rivo.xyz/static/stories/videos/yvCurve-3Crypto-f/1.mp4',
        },
        mediaType: 'video',
      },
      {
        id: 'story2',
        source: {
          uri: 'https://cdn-dev.rivo.xyz/static/stories/videos/yvCurve-3Crypto-f/3.mp4',
        },
        mediaType: 'video',
      },
    ],
  },
];

export const VideoStories = forwardRef<InstagramStoriesPublicMethods, Props>(
  ({footerComponent}, ref) => {
    // const ref = useRef<InstagramStoriesPublicMethods>(null);

    return (
      <View>
        <InstagramStories
          ref={ref}
          avatarBorderColors={['#F95E00', '#F9750E', '#F9B233']}
          stories={stories}
          avatarSize={100}
          modalAnimationDuration={300}
          storyAnimationDuration={400}
          avatarListContainerStyle={{gap: 12}}
          avatarSeenBorderColors={[Colors.ui_grey_70]}
          saveProgress
          mediaContainerStyle={{borderRadius: 32}}
          imageProps={{borderRadius: 32}}
          imageStyles={{borderRadius: 32}}
          // @ts-ignore
          footerComponent={footerComponent}
        />
      </View>
    );
  },
);

// const styles = StyleSheet.create({
//   container: {
//     height: 200,
//     backgroundColor: Colors.error_red,
//   },
// });

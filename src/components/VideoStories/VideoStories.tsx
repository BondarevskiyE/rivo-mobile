import React, {useRef} from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import InstagramStories, {
  InstagramStoriesPublicMethods,
} from '@birdwingo/react-native-instagram-stories';
import {Colors} from '@/shared/ui';
import {InstagramStoryProps} from '@birdwingo/react-native-instagram-stories/src/core/dto/instagramStoriesDTO';

const {height} = Dimensions.get('window');
interface Props {
  stories: InstagramStoryProps[];
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

export const VideoStories = () => {
  const ref = useRef<InstagramStoriesPublicMethods>(null);

  return (
    <View>
      <InstagramStories
        ref={ref}
        stories={stories}
        avatarSize={100}
        avatarListContainerStyle={{gap: 12}}
        avatarSeenBorderColors={[Colors.ui_grey_70]}
        saveProgress
        // mediaContainerStyle={{height: '100%'}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    backgroundColor: Colors.error_red,
  },
});

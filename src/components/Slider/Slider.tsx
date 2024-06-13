import React from 'react';
import {FlatList, View} from 'react-native';
import {CardItem} from './types';
import {SlideItem} from './SlideItem';
import {Pagination} from './Pagination';

interface Props {
  data: CardItem[];
}

export const Slider: React.FC<Props> = ({data}) => {
  return (
    <View style={{flex: 0.95}}>
      <FlatList
        data={data}
        renderItem={({item}) => <SlideItem item={item} />}
        horizontal
        pagingEnabled
        snapToAlignment="center"
        showsHorizontalScrollIndicator={false}
      />
      {/* <Pagination /> */}
    </View>
  );
};

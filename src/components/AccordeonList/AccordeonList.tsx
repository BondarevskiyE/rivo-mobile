import React, {memo, useState} from 'react';
import {ImageURISource, StyleSheet, View} from 'react-native';
import {AccordeonListItem} from './AccordeonListItem';
import {Colors} from '@/shared/ui';

type AccordeonItem = {
  image: ImageURISource;
  title: string;
  AdditionalTitleComponent?: React.ReactNode;
  content: JSX.Element;
};

interface Props {
  items: AccordeonItem[];
}

export const AccordeonList: React.FC<Props> = memo(({items}) => {
  const [openId, setOpenId] = useState<string | null>(null);

  const openItem = (id: string | null) => {
    setOpenId(id);
  };
  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <AccordeonListItem
          key={item.title}
          image={item.image}
          title={item.title}
          content={item.content}
          AdditionalTitleComponent={item?.AdditionalTitleComponent}
          openId={openId}
          id={item.title}
          openItem={openItem}
          isLastItem={index === items.length - 1}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.ui_white,
    borderRadius: 24,
  },
});

import React, {useState} from 'react';
import {StyleSheet, View, ScrollView} from 'react-native';

import {Card} from './Card';
import {ExpandedCard} from './ExpandedCard';

type SelectedCard = {
  yOffset: number | null;
  xOffset: number | null;
  card: number | null;
};

export const ExpandableCardList = () => {
  const [selectedCard, setSelectedCard] = useState<SelectedCard>({
    yOffset: null,
    xOffset: null,
    card: null,
  });

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}>
        {[1, 2, 3].map(i => (
          <Card
            key={i}
            id={i}
            selectCard={(px, py, id) => {
              setSelectedCard({yOffset: py, xOffset: px, card: id});
            }}
          />
        ))}
      </ScrollView>

      {selectedCard.card && selectedCard.yOffset && selectedCard.xOffset && (
        <ExpandedCard
          yOffset={selectedCard.yOffset}
          xOffset={selectedCard.xOffset}
          unselectCard={() =>
            setSelectedCard({card: null, yOffset: null, xOffset: null})
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    height: 60,
    backgroundColor: '#edf5e1',
    paddingTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#05386b',
  },
  list: {
    alignItems: 'center',
    paddingTop: 20,
    gap: 20,
  },
});

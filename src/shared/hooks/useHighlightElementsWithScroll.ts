import React, {useRef, createRef, useState} from 'react';
import {Dimensions, LayoutChangeEvent, ScrollView, View} from 'react-native';
import {useHighlightableElements} from 'react-native-highlight-overlay';
import {HighlightOptions} from 'react-native-highlight-overlay/lib/typescript/context/context';

interface Params<T> {
  elementsId: T[];
  highlightOffset: number;
  scrollOffset: number;
}

type RefsMap<T extends string> = Record<T, React.RefObject<View>>;

const {height} = Dimensions.get('screen');

export function useHighlightElementsWithScroll<ElementId extends string>({
  elementsId,
  highlightOffset,
  scrollOffset,
}: Params<ElementId>) {
  const [_, {addElement}] = useHighlightableElements();

  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);

  const refs = useRef<RefsMap<ElementId>>(
    elementsId.reduce((prev, id) => {
      return {
        ...prev,
        [id]: createRef<View>(),
      };
    }, {} as RefsMap<ElementId>),
  );

  const onLayoutScrollView = (e: LayoutChangeEvent) => {
    setScrollViewHeight(e.nativeEvent.layout.height);
  };

  const onLayoutElement = (id: ElementId, options: HighlightOptions) => () => {
    const elementRef = refs.current[id];

    elementRef.current?.measureInWindow((x, y, elementWidth, elementHeight) => {
      const offset = highlightOffset + elementHeight;

      const posY = height - offset;

      addElement(
        id,
        null,
        {
          x,
          y: y < posY ? y : posY,
          width: elementWidth,
          height: elementHeight,
        },
        options,
      );
    });
  };

  const scrollToOnboardingElement = (id: ElementId) => {
    const elementRef = refs.current[id];

    if (elementRef) {
      elementRef.current?.measureLayout(
        scrollViewRef.current?.getInnerViewNode(),
        (x, y, elementWidth, elementHeight) => {
          const offset = scrollViewHeight - (scrollOffset || 0) - elementHeight;
          const posY = y - offset;

          scrollViewRef.current?.scrollTo({
            y: posY,
            animated: true,
          });
        },
      );
    }
  };

  return {
    refs: refs.current,
    scrollViewRef,
    onLayoutScrollView,
    onLayoutElement,
    scrollToOnboardingElement,
  };
}

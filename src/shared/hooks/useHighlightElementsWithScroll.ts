import {useRef, createRef, useState} from 'react';
import {Dimensions, LayoutChangeEvent, ScrollView, View} from 'react-native';
import {useHighlightableElements} from 'react-native-highlight-overlay';

interface Params<T> {
  elementsId: T[];
  highlightOffset: number;
  scrollOffset: number;
}

type RefsMap<T extends string> = Record<T, React.RefObject<View>>;

const {height, width} = Dimensions.get('window');

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

  const onLayoutElement = (id: ElementId) => () => {
    const elementRef = refs.current[id];

    elementRef.current?.measureInWindow((x, y, elementWidth, elementHeight) => {
      const offset = highlightOffset + elementHeight;

      addElement(
        id,
        null,
        {
          x,
          y: height - offset,
          width: width - 12 - 12,
          height: elementHeight,
        },
        {
          mode: 'rectangle',
          borderRadius: 24,
          clickthroughHighlight: false,
        },
      );
    });
  };

  const scrollToOnboardingElement = (id: ElementId) => {
    const elementRef = refs.current[id];

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
  };

  return {
    refs: refs.current,
    scrollViewRef,
    onLayoutScrollView,
    onLayoutElement,
    scrollToOnboardingElement,
  };
}

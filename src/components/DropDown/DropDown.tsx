import React, {useState} from 'react';
import {StyleSheet, Pressable, View, Text} from 'react-native';

import {Colors, Fonts} from '@/shared/ui';
import {ArrowLineIcon, CheckIcon} from '@/shared/ui/icons';
import ReAnimated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useClickOutside} from 'react-native-click-outside';

export type DropdownItem = {label: string; value: string};

interface Props {
  data: Array<DropdownItem>;
  onSelect: (item: DropdownItem) => void;
  dropdownPosition: 'top' | 'bottom';
  initialSelected?: DropdownItem;
}

export const Dropdown: React.FC<Props> = ({
  data,
  initialSelected,
  onSelect,
  dropdownPosition,
}) => {
  const [selectedItem, setSelectedItem] = useState<DropdownItem | null>(
    initialSelected || data[data.length - 1],
  );
  const [isOpen, setIsOpen] = useState(false);

  const animationValue = useSharedValue(0);

  const clickOutsideRef = useClickOutside<View>(
    () => isOpen && onOpenDropdown(false),
  );

  const onOpenDropdown = (value?: boolean) => {
    setIsOpen(prev => {
      if (prev) {
        animationValue.value = withTiming(0, {duration: 200});
      } else {
        animationValue.value = withTiming(1, {duration: 200});
      }

      return typeof value !== 'undefined' ? value : !prev;
    });
  };

  const onPressOption = (option: DropdownItem) => {
    onSelect(option);
    setSelectedItem(option);
    onOpenDropdown();
  };

  const isTopPosition = dropdownPosition === 'top';

  const dropdownStyles = useAnimatedStyle(() => {
    return {
      transform: [{scale: animationValue.value}],
    };
  });

  const dropdownPositionStyles = {
    ...(isTopPosition ? {bottom: 52} : {top: 44}),
  };

  return (
    <View style={styles.container} collapsable={false} ref={clickOutsideRef}>
      <Pressable onPress={() => onOpenDropdown()} style={styles.labelContainer}>
        <Text style={styles.label}>{selectedItem?.label}</Text>
        <ArrowLineIcon
          style={styles.arrowIcon}
          height={10}
          width={16}
          color={Colors.ui_grey_70}
        />
      </Pressable>

      <ReAnimated.View
        style={[
          styles.optionsContainer,
          {
            transformOrigin: isTopPosition ? 'bottom' : 'top',
            ...dropdownPositionStyles,
          },
          dropdownStyles,
        ]}>
        {data.map((item: DropdownItem, index: number) => (
          <Pressable
            onPress={() => onPressOption(item)}
            style={[
              styles.optionItem,
              index === data.length - 1 ? {borderBottomWidth: 0} : {},
            ]}
            key={item.value}>
            <Text style={styles.optionItemText}>{item.label}</Text>
            {item.value === selectedItem?.value && (
              <CheckIcon width={15} height={11} />
            )}
          </Pressable>
        ))}
      </ReAnimated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 20,
    height: 36,
    backgroundColor: Colors.ui_black_60,
  },
  label: {
    fontFamily: Fonts.medium,
    color: Colors.ui_white,
    fontSize: 14,
    lineHeight: 20.3,
    marginRight: 9,
  },
  arrowIcon: {
    transform: [
      {
        rotate: '90deg',
      },
    ],
  },
  optionsContainer: {
    position: 'absolute',
    right: 0,
    backgroundColor: Colors.ui_black_60,
    borderRadius: 20,
    width: 161,
    transformOrigin: 'top',
  },
  optionItem: {
    padding: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.ui_grey_82,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  optionItemText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.ui_white,
  },
});

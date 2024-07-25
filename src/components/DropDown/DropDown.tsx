import React, {FC, ReactElement, useRef, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  View,
  ViewStyle,
} from 'react-native';

import {ArrowLineIcon} from '@/shared/ui/icons';
import {Colors, Fonts} from '@/shared/ui';

type DropdownItem = {label: string; value: string};

interface Props {
  label: string;
  data: Array<DropdownItem>;
  onSelect: (item: DropdownItem) => void;

  containerStyle?: ViewStyle;
}

export const DropDown: FC<Props> = ({
  label,
  data,
  onSelect,
  containerStyle,
}) => {
  const dropdownButtonRef = useRef<TouchableOpacity>(null);
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<DropdownItem | undefined>(undefined);
  const [dropdownTop, setDropdownTop] = useState(0);

  const toggleDropdown = (): void => {
    visible ? setVisible(false) : openDropdown();
  };

  const openDropdown = (): void => {
    dropdownButtonRef.current?.measure((_fx, _fy, _w, h, _px, py) => {
      setDropdownTop(py + h);
    });
    setVisible(true);
  };

  const onItemPress = (item: DropdownItem): void => {
    setSelected(item);
    onSelect(item);
    setVisible(false);
  };

  const renderItem = ({item}: {item: DropdownItem}): ReactElement<any, any> => (
    <TouchableOpacity style={styles.item} onPress={() => onItemPress(item)}>
      <Text>{item.label}</Text>
    </TouchableOpacity>
  );

  const renderDropdown = (): ReactElement<any, any> => {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setVisible(false)}>
          <View style={[styles.dropdown, {top: dropdownTop}]}>
            <FlatList
              data={data}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <TouchableOpacity
      ref={dropdownButtonRef}
      style={[styles.button, containerStyle]}
      onPress={toggleDropdown}>
      {renderDropdown()}
      <View style={styles.labelContainer}>
        <Text style={styles.buttonText}>
          {(selected && selected.label) || label}
        </Text>
        <ArrowLineIcon style={styles.arrowIcon} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.ui_black_60,
    borderRadius: 40,
    height: 36,
    width: 'auto',
    zIndex: 1,
  },
  buttonText: {
    textAlign: 'center',
    color: Colors.ui_white,
    fontFamily: Fonts.medium,
    fontSize: 14,
    lineHeight: 20.3,
  },
  icon: {
    marginRight: 10,
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: '#fff',
    width: '100%',
    shadowColor: '#000000',
    shadowRadius: 4,
    shadowOffset: {height: 4, width: 0},
    shadowOpacity: 0.5,
  },
  overlay: {
    position: 'absolute',
    right: 0,
    width: 70,
    height: '100%',
  },
  item: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  labelContainer: {
    paddingLeft: 10,
    paddingRight: 15,

    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arrowIcon: {
    transform: [{rotate: '90deg'}],
  },
});

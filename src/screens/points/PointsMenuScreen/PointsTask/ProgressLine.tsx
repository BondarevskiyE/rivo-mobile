import {Colors} from '@/shared/ui';
import {StyleSheet, View} from 'react-native';

interface Props {
  progressPercent: number;
  width?: number;
}

export const ProgressLine: React.FC<Props> = ({
  width = 65,
  progressPercent,
}) => {
  return (
    <View style={[styles.container, {width}]}>
      <View
        style={[styles.progress, {width: (width / 100) * progressPercent}]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 6,
    backgroundColor: Colors.ui_grey_95,
    borderRadius: 24,
  },
  progress: {
    backgroundColor: Colors.ui_white,
    height: '100%',
    borderRadius: 24,
  },
});

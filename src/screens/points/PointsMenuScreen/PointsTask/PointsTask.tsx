import {Button} from '@/components';
import {Colors, Fonts} from '@/shared/ui';
import {StyleSheet, Text, View} from 'react-native';
import {
  DefaultProps,
  DefaultTypeProps,
  ButtonTypeProps,
  ProgressTypeProps,
  CompletedTypeProps,
  isButtonTask,
  isDefaultTask,
  isProgressTask,
  isCompletedTask,
} from './types';
import {ProgressLine} from './ProgressLine';
import {BUTTON_TYPE} from '@/components/general/Button/Button';
import {CheckIcon} from '@/shared/ui/icons';

type Props = DefaultProps &
  (DefaultTypeProps | ButtonTypeProps | ProgressTypeProps | CompletedTypeProps);

export const PointsTask: React.FC<Props> = ({
  title,
  subTitle,
  ...taskProps
}) => {
  return (
    <View style={styles.container}>
      <View style={{gap: 2}}>
        <Text style={styles.upperText}>{title}</Text>
        <Text style={styles.lowerText}>{subTitle}</Text>
      </View>

      {isDefaultTask(taskProps) && (
        <View style={{gap: 2, alignItems: 'flex-end'}}>
          <Text style={styles.upperText}>{taskProps.earned}</Text>
          <Text style={styles.lowerText}>Earned</Text>
        </View>
      )}

      {isProgressTask(taskProps) && (
        <View style={{gap: 4, alignItems: 'flex-end'}}>
          <Text
            style={[
              styles.lowerText,
              styles.rightAlign,
            ]}>{`$${taskProps.left} left`}</Text>
          <ProgressLine
            width={65}
            progressPercent={taskProps.progressPercent}
          />
        </View>
      )}

      {isButtonTask(taskProps) && (
        <Button
          text="Follow"
          type={BUTTON_TYPE.SECONDARY}
          style={styles.button}
          textStyle={styles.buttonText}
          onPress={() => console.log(taskProps.link)}
        />
      )}

      {isCompletedTask(taskProps) && (
        <View style={styles.completedContainer}>
          <View style={styles.checkIconContainer}>
            <CheckIcon color={Colors.ui_green_51} width={9} height={9} />
          </View>
          <Text style={styles.completedText}>Completed</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 24,
    backgroundColor: Colors.ui_grey_98,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upperText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: Colors.ui_white,
  },
  lowerText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.ui_grey_73,
  },
  rightAlign: {
    textAlign: 'right',
  },
  button: {
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  buttonText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
  },
  completedContainer: {
    flexDirection: 'row',
    gap: 6,
    alignSelf: 'flex-start',
  },
  checkIconContainer: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: Colors.ui_green_51,
  },
  completedText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.ui_green_51,
  },
});

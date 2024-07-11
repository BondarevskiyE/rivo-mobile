import {AppRegistry} from 'react-native';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import './globals';
import {App} from './App';
import {name as appName} from './app.json';
import {createBackgroundEventNotificationsHandler} from '@/services/notifee';

createBackgroundEventNotificationsHandler();

AppRegistry.registerComponent(appName, () => App);

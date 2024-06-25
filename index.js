import {AppRegistry} from 'react-native';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import './globals';
import {App} from './src/app';
import {name as appName} from './app.json';
import {createBackgroundEventHandler} from '@/shared/lib/notifee';

createBackgroundEventHandler();

AppRegistry.registerComponent(appName, () => App);

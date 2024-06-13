import React from 'react';
// import {Platform} from 'react-native';

class AuthLoadingScreen extends React.Component {
  constructor(props: any) {
    super(props);
    // this._authanticate();
  }

  //   _authanticate = async () => {
  //     if (Platform.OS === 'ios') {
  //       if (this.props.isLoggedIn) {
  //         this.props.navigation.navigate('App');
  //       } else {
  //         this.props.navigation.navigate('Auth');
  //       }
  //     } else {
  //       if (this.props.isLoggedIn) {
  //         setTimeout(() => {
  //           this.props.navigation.navigate('App');
  //         }, 100);
  //       } else {
  //         setTimeout(() => {
  //           this.props.navigation.navigate('Auth');
  //         }, 100);
  //       }
  //     }
  //   };

  render() {
    return null;
  }
}

export default AuthLoadingScreen;

import React from 'react';
import { View, Text } from 'react-native';
import { createAppContainer } from 'react-navigation';


import AppNavigator from './src/route/Index'

const AppContainer = createAppContainer(AppNavigator);

export default class App extends React.Component {
  render() {
    return <AppContainer />;
  }
}
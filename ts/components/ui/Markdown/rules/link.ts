import { fromNullable, none, Option } from "fp-ts/lib/Option";
import { Text } from "native-base";
import * as React from "react";
import { Linking } from "react-native";
import { NavigationActions } from "react-navigation";
import { ReactOutput, SingleASTNode, State } from "simple-markdown";

import ROUTES from "../../../../navigation/routes";
import { makeReactNativeRule } from "./utils";

type ScreenNameToRouteMap = {
  [key: string]: string;
};

// Prefix to match uri like `internal://screen/profile`
const INTERNAL_TARGET_PREFIX = "internal://screen/";

// Here we put all the allowed screen name with the mapping to the react-navigation route
const SCREEN_NAME_TO_ROUTE_MAP: ScreenNameToRouteMap = {
  profile: ROUTES.PROFILE_MAIN
};

function getInternalRoute(target: string): Option<string> {
  const parsed = target.split(INTERNAL_TARGET_PREFIX);

  if (parsed.length === 2 && parsed[0] === "") {
    const screenName = parsed[1];

    // Return if available the react-navigation route
    return fromNullable(SCREEN_NAME_TO_ROUTE_MAP[screenName]);
  }

  return none;
}

function rule() {
  return (
    node: SingleASTNode,
    output: ReactOutput,
    state: State
  ): React.ReactNode => {
    const newState = { ...state, withinLink: true };
    const maybeInternalRoute = getInternalRoute(node.target);

    /** Get a specific onPress handler
     *
     * It can be:
     * () => state.dispatch(NavigationActions.navigate({routeName: internalRoute))} for internal links
     * () => Linking.openURL(node.target).catch(_ => undefined) for external links
     * undefined if we can't handle the link
     */
    const onPressHandler = maybeInternalRoute.fold(
      () => Linking.openURL(node.target).catch(_ => undefined),
      internalRoute =>
        state.dispatch
          ? () =>
              state.dispatch(
                NavigationActions.navigate({
                  routeName: internalRoute
                })
              )
          : undefined
    );

    // Create the Text element that must go inside <Button>
    return React.createElement(
      Text,
      {
        key: state.key,
        markdown: true,
        link: true,
        onPress: onPressHandler
      },
      output(node.content, newState)
    );
  };
}

export default makeReactNativeRule(rule());

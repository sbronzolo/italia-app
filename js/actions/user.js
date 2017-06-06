/**
 * Defines actions related to the user profile and preferences.
 *
 * @flow
 */

'use strict'

import type { ThunkAction, Dispatch, GetState } from './types'
import type { ApiUserProfile } from '../utils/api'
import { getUserProfile } from '../utils/api'

/**
 * Begins an API requests for the user profile to the backend.
 */
function requestUserProfile(): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    // first we dispatch the request action
    dispatch({
      type: 'REQUEST_USER_PROFILE',
    })
    // then we make the API call to the backend
    const { apiUrlPrefix, token } = getState().user
    getUserProfile(apiUrlPrefix, token).then((profile) => {
      // once we get back the user profile, we trigger the receive action
      // TODO handle unsuccessful retrieval of profile
      if(profile != null) {
        receiveUserProfile(profile)(dispatch, getState)
      }
    })
  }
}

function receiveUserProfile(profile: ApiUserProfile): ThunkAction {
  return (dispatch: Dispatch) => {
    dispatch({
      type: 'RECEIVE_USER_PROFILE',
      profile: profile,
      receivedAt: Date.now(),
    })
  }
}

module.exports = {
  requestUserProfile,
}
import axios from 'axios';
import contenttitleutils from '@/utils/contenttitleutils';

export default {
  GET_CHOSEN_CLIENT_ID: (state) => state.chosenClientId,

  GET_PLEX_CLIENT: (state) => (clientIdentifier) => state
    .clients[clientIdentifier],

  GET_CHOSEN_CLIENT: (state) => state.clients[state.chosenClientId],
  GET_RECENT_PLEX_CLIENTS: (state) => Object.values(state.clients)
    .sort((a, b) => -a.lastSeenAt.localeCompare(b.lastSeenAt)),
  GET_ACTIVE_MEDIA_METADATA: (state) => state.activeMediaMetadata,

  GET_ACTIVE_SERVER_ID: (state) => state.activeServerId,

  GET_PLEX_CLIENT_TIMELINE: (state) => state.plexClientTimeline,

  GET_PLEX_CLIENT_AXIOS: (state, getters, rootState, rootGetters) => (clientIdentifier) => {
    const client = getters.GET_PLEX_CLIENT(clientIdentifier);

    return axios.create({
      baseURL: client.chosenConnection.uri,
      timeout: 5000,
      headers: rootGetters['plex/GET_PLEX_BASE_PARAMS'](client.accessToken),
    });
  },

  GET_CHOSEN_PLEX_CLIENT_AXIOS: (state, getters) => getters
    .GET_PLEX_CLIENT_AXIOS(getters.GET_CHOSEN_CLIENT_ID),

  GET_ACTIVE_MEDIA_POLL_METADATA: (state, getters) => (getters.GET_ACTIVE_MEDIA_METADATA
    ? {
      title: contenttitleutils.getCombinedTitle(getters.GET_ACTIVE_MEDIA_METADATA),
      rawTitle: getters.GET_ACTIVE_MEDIA_METADATA.title,
      type: getters.GET_ACTIVE_MEDIA_METADATA.type,
      grandparentTitle: getters.GET_ACTIVE_MEDIA_METADATA.grandparentTitle,
      parentTitle: getters.GET_ACTIVE_MEDIA_METADATA.parentTitle,
      ratingKey: getters.GET_ACTIVE_MEDIA_METADATA.ratingKey,
    }
    : {
      title: null,
      rawTitle: null,
      type: null,
      grandparentTitle: null,
      parentTitle: null,
      ratingKey: null,
    }),
};
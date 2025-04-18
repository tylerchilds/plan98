export default function createStore(initialState = {}, notify = () => null) {
  let state = {
    ...initialState
  };

  return {
    set: function(link, knowledge, nuance) {

      const merge = typeof nuance === 'function'
        ? nuance
        : nuance.mergeHandler.apply(null, nuance.parameters)
      const wisdom = merge(state[link] || {}, knowledge);

      state = {
        ...state,
        [link]: wisdom
      };

      notify(link, state);
    },

    get: function(link) {
      return state[link];
    }
  }
}

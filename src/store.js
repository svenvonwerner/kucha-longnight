import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";

export default createStore({
  state: {
    statistics: {},
  },
  mutations: {
    setStatistics(state, payload) {
      console.log("Hello");
      state.statistics = payload;
    },
  },
  getters: {
    getStatistics: (state) => {
      return state.statistics;
    },
  },
  actions: {},
  plugins: [createPersistedState()],
});

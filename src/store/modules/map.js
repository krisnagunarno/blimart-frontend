
import Axios from 'axios';

// const basePath = 'ar';

export default {
  namespaced: true,
  state: {
    marks: [],
  },
  mutations: {

  },
  getters: {
  },
  actions: {
    // eslint-disable-next-line no-unused-vars
    getRoute({ _ }, { origin, destination }) {
      return Axios.get(`https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&key=AIzaSyAyoVGwS7yqbW6JYUOVSWtHlnBcO69C3ZE`);
    },
  },
};

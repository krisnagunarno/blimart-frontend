/* eslint-disable guard-for-in */
import Vue from 'vue';
import Axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import VueMq from 'vue-mq';
import Carousel3d from 'vue-carousel-3d';
import VueAgile from 'vue-agile';
import moment from 'moment';
import Notifications from 'vue-notification';
import App from './App.vue';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import mockItem from './mock';

Vue.use(Carousel3d);

Vue.use(VueAgile);

Vue.use(VueMq, {
  breakpoints: {
    xs: 600,
    sm: 960,
    md: 1264,
    lg: 1900,
    xl: Infinity,
  },
});

// import 'aframe';
// import 'three.ar.js';
// import 'aframe-ar';

Vue.config.productionTip = false;

// Axios.defaults.baseURL = 'https://192.168.100.3:8080/bliblimart/api';
Axios.defaults.baseURL = 'http://ec2-34-232-6-130.compute-1.amazonaws.com:8082/bliblimart/api';
// Axios.defaults.baseURL = 'http://localhost';
// if (process.env.NODE_ENV === 'development') {
//   Axios.defaults.baseURL = 'http://localhost';
// } else {
//   Axios.defaults.baseURL = 'https://t-science-253809.appspot.com/kouvee';
// }


const tk = localStorage.getItem('token');
if (tk != null) {
  Axios.defaults.headers.common.Authorization = `Bearer ${tk}`;
}
// eslint-disable-next-line no-constant-condition
if (false) {
  const mock = new MockAdapter(Axios, { delayResponse: 500 });

  mockItem.forEach((v) => {
    switch (v.method) {
      case 'POST': {
        mock.onPost(v.path).reply(v.status, { paging: {}, data: v.data });
        break;
      }
      case 'GET': {
        mock.onGet(v.path).reply(v.status, { paging: {}, data: v.data });
        break;
      }
      case 'PUT': {
        mock.onPut(v.path).reply(v.status, { paging: {}, data: v.data });
        break;
      }
      case 'DELETE': {
        mock.onDelete(v.path).reply(v.status, { paging: {}, data: v.data });
        break;
      }
      case 'PATCH': {
        mock.onPatch(v.path).reply(v.status, { paging: {}, data: v.data });
        break;
      }
      default: {
        mock.onGet(v.path).reply(v.status, { paging: {}, data: v.data });
        break;
      }
    }
  });
}


moment.locale('id');
Vue.config.ignoredElements = [/^a-*/];
Vue.filter('date', (value) => {
  if (value) {
    return moment(String(value), 'x').format('LL');
  }
  return '-';
});
Vue.filter('serverImg', (value) => {
  if (value) {
    return `${Axios.defaults.baseURL + value}`;
  }
  return '';
});
Vue.filter('initial', (value) => {
  if (value) {
    const names = value.split(' ');
    let initials = names[0].substring(0, 1).toUpperCase();

    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  }
  return '';
});

Vue.filter('time', (value) => {
  if (value) {
    return moment(String(value), 'x').format('LT');
  }
  return '-';
});
Vue.filter('dateTime', (value) => {
  if (value) {
    return moment(String(value), 'x').format('LLL');
  }
  return '-';
});
Vue.filter('price', (value) => {
  if (value || value === 0) {
    return value.toLocaleString('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 2,
    });
  }
  return '';
});

Vue.filter('dynamicSortA', (property) => {
  let sortOrder = 1;
  let buf = property;
  if (property[0] === '-') {
    sortOrder = -1;
    buf = property.substr(1);
  }
  // eslint-disable-next-line func-names
  return function (a, b) {
    /* next line works with strings and numbers,
     * and you may want to customize it to your needs
     */
    // eslint-disable-next-line no-nested-ternary
    const result = (a[buf] < b[buf]) ? -1 : (a[buf] > b[buf]) ? 1 : 0;
    return result * sortOrder;
  };
});
Vue.filter('dynamicSortD', (property) => {
  let sortOrder = 1;
  let buf = property;
  if (property[0] === '-') {
    sortOrder = -1;
    buf = property.substr(1);
  }
  // eslint-disable-next-line func-names
  return function (a, b) {
    /* next line works with strings and numbers,
     * and you may want to customize it to your needs
     */
    // eslint-disable-next-line no-nested-ternary
    const result = (a[buf] > b[buf]) ? -1 : (a[buf] < b[buf]) ? 1 : 0;
    return result * sortOrder;
  };
});


Vue.filter('dynamicSearch', (keyword) => {
  // eslint-disable-next-line func-names
  const f = function (obj) {
    /* next line works with strings and numbers,
     * and you may want to customize it to your needs
     */
    // eslint-disable-next-line no-nested-ternary
    if (keyword === '') return true;
    // eslint-disable-next-line no-restricted-syntax
    for (const key in obj) {
      // eslint-disable-next-line eqeqeq
      // eslint-disable-next-line no-constant-condition
      // if (typeof obj[key] === 'object' && obj[key] != null) {
      //   return Vue.filter('dynamicSearch')(obj[key], keyword);
      // }
      const a = String.prototype.toLowerCase.apply(obj[key] || '');
      if (typeof a === 'string') {
        if (a.includes(keyword.toLowerCase())) {
          return true;
        }
      }
    }
    return false;
  };
  return f;
});

Vue.use(Notifications);

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App),
}).$mount('#app');


Vue.prototype.$vuetify = vuetify;

import axios from 'axios';

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.withCredentials = true;

const tokenEl = document.head.querySelector('meta[name="csrf-token"]');
if (tokenEl) {
  axios.defaults.headers.common['X-CSRF-TOKEN'] = tokenEl.content;
}

export default axios;

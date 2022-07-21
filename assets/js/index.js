/**
 * --------------------------------------------------------------------------
 * Bootstrap (v5.2.0-beta1): index.umd.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import Alert from 'js/bootstrap/src/alert'
import Button from 'js/bootstrap/src/button'
import Carousel from 'js/bootstrap/src/carousel'
import Collapse from 'js/bootstrap/src/collapse'
import Dropdown from 'js/bootstrap/src/dropdown'
import Modal from 'js/bootstrap/src/modal'
import Offcanvas from 'js/bootstrap/src/offcanvas'
import Popover from 'js/bootstrap/src/popover'
import ScrollSpy from 'js/bootstrap/src/scrollspy'
import Tab from 'js/bootstrap/src/tab'
import Toast from 'js/bootstrap/src/toast'
import Tooltip from 'js/bootstrap/src/tooltip'

export default {
  Alert,
  Button,
  Carousel,
  Collapse,
  Dropdown,
  Modal,
  Offcanvas,
  Popover,
  ScrollSpy,
  Tab,
  Toast,
  Tooltip
};

// Import the Bootstrap components we want to use.
// See https://github.com/twbs/bootstrap/blob/main/js/index.umd.js
// import Toast from "js/bootstrap/src/toast";
// import Popover from "js/bootstrap/src/popover";

(function () {
  let toastElList = [].slice.call(document.querySelectorAll(".toast"));
  let toastList = toastElList.map(function (toastEl) {
    return new Toast(toastEl);
  });

  toastList.forEach(function (toast) {
    toast.show();
  });

  let popoverTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="popover"]')
  );
  popoverTriggerList.map(function (popoverTriggerEl) {
    return new Popover(popoverTriggerEl);
  });
})();

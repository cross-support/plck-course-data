<script setup lang="ts">

</script>
<template>
  <div id="load-container">
    <div class="loading"></div>
    <div class="now-loading">now loading...</div>
  </div>
</template>
<style>

/*ローディング画面*/
#load-container{
  width: 240px;
  height: 240px;
  position: fixed;
  top: 50%;
  left: 50%;
  -ms-transform: translate(-50%,-50%);
  transform: translate(-50%,-50%);
  display: none;
}

.now-loading {
  font-size: 25px;
  text-align: center;
  color: #00B7EE;
}

#load-container .loading{
  margin: 100px auto;
  font-size: 25px;
  width: 1em;
  height: 1em;
  border-radius: 50%;
  position: relative;
  -webkit-animation: load_circle 1.1s infinite ease;
  animation: load_circle 1.1s infinite ease;
  -ms-transform: translateZ(0);
  transform: translateZ(0);
  box-shadow: 0em -2.6em 0em 0em rgba(0, 183, 238, 0.5), 1.8em -1.8em 0 0em rgba(0, 183, 238, 0.5), 2.5em 0em 0 0em rgba(0, 183, 238, 0.5), 1.75em 1.75em 0 0em rgba(0, 183, 238, 0.5), 0em 2.5em 0 0em rgba(0, 183, 238, 0.5), -1.8em 1.8em 0 0em rgba(0, 183, 238, 0.5), -2.6em 0em 0 0em rgba(0, 183, 238, 0.5), -1.8em -1.8em 0 0em rgba(0, 183, 238, 0.7);
}

@keyframes load_circle {
  0%,
  100% {
    box-shadow: 0em -2.6em 0em 0em #ffffff, 1.8em -1.8em 0 0em rgba(0, 183, 238, 0.2), 2.5em 0em 0 0em rgba(0, 183, 238, 0.2), 1.75em 1.75em 0 0em rgba(0, 183, 238, 0.2), 0em 2.5em 0 0em rgba(0, 183, 238, 0.2), -1.8em 1.8em 0 0em rgba(0, 183, 238, 0.2), -2.6em 0em 0 0em rgba(0, 183, 238, 0.5), -1.8em -1.8em 0 0em rgba(0, 183, 238, 0.7);
  }
  12.5% {
    box-shadow: 0em -2.6em 0em 0em rgba(0, 183, 238, 0.7), 1.8em -1.8em 0 0em #ffffff, 2.5em 0em 0 0em rgba(0, 183, 238, 0.2), 1.75em 1.75em 0 0em rgba(0, 183, 238, 0.2), 0em 2.5em 0 0em rgba(0, 183, 238, 0.2), -1.8em 1.8em 0 0em rgba(0, 183, 238, 0.2), -2.6em 0em 0 0em rgba(0, 183, 238, 0.2), -1.8em -1.8em 0 0em rgba(0, 183, 238, 0.5);
  }
  25% {
    box-shadow: 0em -2.6em 0em 0em rgba(0, 183, 238, 0.5), 1.8em -1.8em 0 0em rgba(0, 183, 238, 0.7), 2.5em 0em 0 0em #ffffff, 1.75em 1.75em 0 0em rgba(0, 183, 238, 0.2), 0em 2.5em 0 0em rgba(0, 183, 238, 0.2), -1.8em 1.8em 0 0em rgba(0, 183, 238, 0.2), -2.6em 0em 0 0em rgba(0, 183, 238, 0.2), -1.8em -1.8em 0 0em rgba(0, 183, 238, 0.2);
  }
  37.5% {
    box-shadow: 0em -2.6em 0em 0em rgba(0, 183, 238, 0.2), 1.8em -1.8em 0 0em rgba(0, 183, 238, 0.5), 2.5em 0em 0 0em rgba(0, 183, 238, 0.7), 1.75em 1.75em 0 0em rgba(0, 183, 238, 0.2), 0em 2.5em 0 0em rgba(0, 183, 238, 0.2), -1.8em 1.8em 0 0em rgba(0, 183, 238, 0.2), -2.6em 0em 0 0em rgba(0, 183, 238, 0.2), -1.8em -1.8em 0 0em rgba(0, 183, 238, 0.2);
  }
  50% {
    box-shadow: 0em -2.6em 0em 0em rgba(0, 183, 238, 0.2), 1.8em -1.8em 0 0em rgba(0, 183, 238, 0.2), 2.5em 0em 0 0em rgba(0, 183, 238, 0.5), 1.75em 1.75em 0 0em rgba(0, 183, 238, 0.7), 0em 2.5em 0 0em #ffffff, -1.8em 1.8em 0 0em rgba(0, 183, 238, 0.2), -2.6em 0em 0 0em rgba(0, 183, 238, 0.2), -1.8em -1.8em 0 0em rgba(0, 183, 238, 0.2);
  }
  62.5% {
    box-shadow: 0em -2.6em 0em 0em rgba(0, 183, 238, 0.2), 1.8em -1.8em 0 0em rgba(0, 183, 238, 0.2), 2.5em 0em 0 0em rgba(0, 183, 238, 0.2), 1.75em 1.75em 0 0em rgba(0, 183, 238, 0.5), 0em 2.5em 0 0em rgba(0, 183, 238, 0.7), -1.8em 1.8em 0 0em #ffffff, -2.6em 0em 0 0em rgba(0, 183, 238, 0.2), -1.8em -1.8em 0 0em rgba(0, 183, 238, 0.2);
  }
  75% {
    box-shadow: 0em -2.6em 0em 0em rgba(0, 183, 238, 0.2), 1.8em -1.8em 0 0em rgba(0, 183, 238, 0.2), 2.5em 0em 0 0em rgba(0, 183, 238, 0.2), 1.75em 1.75em 0 0em rgba(0, 183, 238, 0.2), 0em 2.5em 0 0em rgba(0, 183, 238, 0.5), -1.8em 1.8em 0 0em rgba(0, 183, 238, 0.7), -2.6em 0em 0 0em #ffffff, -1.8em -1.8em 0 0em rgba(0, 183, 238, 0.2);
  }
  87.5% {
    box-shadow: 0em -2.6em 0em 0em rgba(0, 183, 238, 0.2), 1.8em -1.8em 0 0em rgba(0, 183, 238, 0.2), 2.5em 0em 0 0em rgba(0, 183, 238, 0.2), 1.75em 1.75em 0 0em rgba(0, 183, 238, 0.2), 0em 2.5em 0 0em rgba(0, 183, 238, 0.2), -1.8em 1.8em 0 0em rgba(0, 183, 238, 0.5), -2.6em 0em 0 0em rgba(0, 183, 238, 0.7), -1.8em -1.8em 0 0em #ffffff;
  }
}

</style>
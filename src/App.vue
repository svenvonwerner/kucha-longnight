<template>
  <v-app>
    <Game></Game>
  </v-app>
</template>

<script>
import Game from "./components/Game.vue";

export default {
  name: "App",

  components: {
    Game,
  },

  data: () => ({
    //
  }),
};
</script>

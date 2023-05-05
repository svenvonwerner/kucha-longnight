<template>
  <v-app>
    <v-container fluid class="bg-grey-lighten-1 fill-height pa-4">
      <v-row no-gutters class="fill-height">
        <v-col cols="2" class="bg-grey-lighten-4">
          <v-btn>Button</v-btn>
          <v-combobox
            label="Combobox"
            :items="['One', 'Two', 'Three']"
          ></v-combobox>
        </v-col>
        <v-col cols="10" class="bg-grey-lighten-3">
          <div id="openseadragon">Content</div>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
import HelloWorld from "./components/HelloWorld.vue";

export default {
  name: "App",

  components: {
    HelloWorld,
  },

  data: () => ({
    //
  }),
};
</script>

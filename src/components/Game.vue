<template>
  <v-container fluid class="bg-grey-lighten-1 fill-height pa-4">
    <v-row no-gutters class="fill-height">
      <v-col cols="4" class="bg-grey-lighten-4">
        <v-btn>Button</v-btn>
        <v-combobox
          label="Combobox"
          :items="['One', 'Two', 'Three']"
        ></v-combobox>
      </v-col>
      <v-col cols="8" class="bg-grey-lighten-3">
        <div class="align-stretch flex-grow-1" id="openseadragon">Content</div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import OpenSeadragon from "openseadragon";
import { getGames } from "@/services/repository";

export default {
  data: () => ({}),
  mounted() {
    let options = {
      id: "openseadragon",
      prefixUrl:
        "https://cdn.jsdelivr.net/npm/openseadragon@2.4/build/openseadragon/images/",
      tileSources:
        "https://iiif.saw-leipzig.de/iiif/2/kucha%2Fimages%2F26823.png/info.json",
      showRotationControl: true,
      showFlipControl: true,
      maxZoomLevel: 100,
      visibilityRatio: 1.0,
      defaultZoomLevel: 0,
      minZoomLevel: 0.001,
      loadTilesWithAjax: true,
    };
    options["showNavigationControl"] = true;
    this.imageViewer = OpenSeadragon(options);
    getGames()
      .then((res) => {
        console.log("Games are:", res);
      })
      .catch((err) => {
        console.log("error!", err.response);
      });
  },
};
</script>

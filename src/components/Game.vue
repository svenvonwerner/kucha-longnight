<template>
  <v-container fluid class="bg-grey-lighten-1 fill-height pa-4">
    <v-row no-gutters class="fill-height">
      <v-col cols="4" class="bg-grey-lighten-4">
        <v-combobox
          v-model="selectedGame"
          :items="gameData"
          :return-object="true"
          label="Level wählen"
        >
        </v-combobox>
      </v-col>
      <v-col cols="8" class="d-flex bg-grey-lighten-3">
        <div class="align-stretch flex-grow-1" id="openseadragon">Content</div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import OpenSeadragon from "openseadragon";
import { getGames } from "@/services/repository";
import Annotorious from "../../static/openseadragon-annotorious.min.js";
import SelectorPack from "../../static/annotorious-selector-pack.min.js";
import "../../static/annotorious.min.css";

export default {
  data: () => ({
    data() {
      return {
        imageViewer: null,
        annotoriousplugin: null,
        gameData: [],
        selectedGame: null,
        selectedLevel: null,
      };
    },
  }),
  mounted() {
    let options = {
      id: "openseadragon",
      prefixUrl:
        "https://cdn.jsdelivr.net/npm/openseadragon@2.4/build/openseadragon/images/",
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
    var MyHighlightFormatter = function (annotation) {
      if (annotation.motivation === "highlight") {
        return {
          style:
            "stroke-width:5px;stroke: gold; fill: rgba(0, 128, 0,0.55);vector-effect: none;cursor: auto;",
        };
      } else {
        return {
          style:
            "stroke-width:0px;stroke: gold; fill: rgba(0, 128, 0,0);vector-effect: none;cursor: auto;",
        };
      }
    };
    var config = {};
    config["readOnly"] = true;
    (config["disableSelect"] = true),
      (config["disableEditor"] = true),
      (config["widgets"] = [
        "COMMENT",
        { widget: "TAG", vocabulary: [], showDelete: false },
      ]);
    config["image"] = this.imageViewer;
    config["formatter"] = [MyHighlightFormatter];
    this.annotoriousplugin = Annotorious(this.imageViewer, config);
    SelectorPack(this.annotoriousplugin);
    var _self = this;
    this.imageViewer.setControlsEnabled(true);
    this.imageViewer.setMouseNavEnabled(true);
    //this.annotoriousplugin.disableEditor = true
    this.annotoriousplugin.on("clickAnnotation", function (annotation, evt) {
      if ((annotation.motivation = "hide")) {
        annotation.motivation = "highlight";
      }
      _self.annotoriousplugin.format(annotation);
    });

    getGames()
      .then((res) => {
        this.gameData = [];
        for (var level of res.data) {
          var newLevel = {
            text: "Level " + level.gameID,
            title: "Level " + level.gameID,
            value: level,
          };
          this.gameData.push(newLevel);
        }
      })
      .catch((err) => {
        console.log("error!", err);
      });
  },
  watch: {
    selectedGame(newVal, oldVal) {
      console.log("new game selected", newVal.value);
      this.annotoriousplugin.clearAnnotations();
      this.imageViewer.open(
        "https://iiif.saw-leipzig.de/iiif/2/kucha%2Fimages%2F" +
          newVal.value.imageID +
          "/info.json"
      );

      for (let anno of newVal.value.annotations) {
        anno["motivation"] = "hide";
        this.annotoriousplugin.addAnnotation(JSON.parse(anno.w3c));
      }
    },
  },
};
</script>

<template>
  <div class="bg-transparent headline text-center" v-html="getTitle"></div>
  <v-container fluid class="bg-grey-lighten-1 fill-height pa-4">
    <v-row no-gutters class="fill-height">
      <v-col cols="4" class="bg-grey-lighten-4 pa-3">
        <v-combobox
          v-model="selectedGame"
          :items="gameData"
          :return-object="true"
          label="Level wählen"
          variant="solo-inverted"
        >
        </v-combobox>

        <v-card class="pa-4" elevation="2">
          <v-card-text class="">
            {{ selectedGame === null ? "" : selectedGame.value.description }}
          </v-card-text>
          <v-list v-if="gameData.length > 0">
            <div v-for="(value, name, index) in statistics" :key="index">
              <v-list-item-title>{{ "Level " + name }}</v-list-item-title>
              <v-list-item-group :value="true">
                <v-list-item v-html="getRights(value)"> </v-list-item>
                <v-list-item v-html="getFails(value)"> </v-list-item>
              </v-list-item-group>
            </div>
          </v-list>
        </v-card>

        <v-btn class="my-5" block size="x-large">
          <template v-slot:append>
            <v-icon @click="clear()">mdi-restart</v-icon>
          </template>
        </v-btn>
      </v-col>

      <v-col cols="8" class="d-flex bg-grey-lighten-3">
        <div class="align-stretch flex-grow-1" id="openseadragon"></div>
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
  data() {
    return {
      imageViewer: null,
      annotoriousplugin: null,
      gameData: [],
      selectedGame: null,
      drag: false,
      lastDown: 0,
    };
  },
  computed: {
    getTitle() {
      if (this.selectedGame === null) {
        return "Finde die Figuren in den Kucha-Gemälden!";
      } else {
        return (
          "Finde <span style='color:red;''>" +
          this.selectedGame.value.name +
          "</span> in den Kucha-Gemälden!"
        );
      }
    },
    statistics: {
      get: function () {
        return this.$store.state.statistics;
      },
      set: function (newValue) {
        console.log("updating");
        this.$store.commit("setStatistics", newValue);
      },
    },
  },
  methods: {
    loadLevel(newLevel) {
      if (this.loadLevel) {
        this.annotoriousplugin.clearAnnotations();
        this.imageViewer.open(
          "https://iiif.saw-leipzig.de/iiif/2/kucha%2Fimages%2F" +
            newLevel.value.imageID +
            "/info.json"
        );
        for (let anno of newLevel.value.annotations) {
          console.log("anno", anno.annotoriousID);
          let w3cAnno = JSON.parse(anno.w3c);
          if (
            this.statistics[newLevel.value.gameID].annotations.includes(
              anno.annotoriousID
            )
          ) {
            console.log("anno ", anno.annotoriousID, " was already found!");
            w3cAnno["motivation"] = "highlight";
          } else {
            w3cAnno["motivation"] = "hide";
          }
          this.annotoriousplugin.addAnnotation(w3cAnno);
        }
      }
    },
    clear() {
      this.statistics = {};
      for (let level of this.gameData) {
        this.statistics[level.value.gameID] = {
          fails: 0,
          number: level.value.annotations.length,
          annotations: [],
        };
      }
      this.loadLevel(this.selectedGame);
    },
    getRights(item) {
      console.log("item", item);
      if (item) {
        return (
          "<span style='color:green;'>Gefunden: " +
          item.annotations.length +
          "/" +
          item.number +
          "</span>"
        );
      } else {
        return "";
      }
    },
    getFails(item) {
      console.log("item", item);
      if (item) {
        return "<span style='color:red;'>Daneben: " + item.fails + "</span>";
      } else {
        return "";
      }
    },
  },
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
    this.imageViewer.gestureSettingsMouse.clickToZoom = false;
    this.imageViewer.addHandler("canvas-press", () => {
      _self.lastDown = new Date().getTime();
    });
    this.imageViewer.addHandler("canvas-click", (e) => {
      const timeSinceMouseDown = new Date().getTime() - _self.lastDown;
      // Real click (no drag)
      console.log(timeSinceMouseDown);
      if (timeSinceMouseDown < 250) {
        _self.statistics[_self.selectedGame.value.gameID].fails += 1;
      }
    });

    this.annotoriousplugin.on("clickAnnotation", function (annotation, evt) {
      console.log("anno clicked! ", annotation);
      if (annotation.motivation === "hide") {
        console.log("found anno!", annotation);
        annotation.motivation = "highlight";
        _self.statistics[_self.selectedGame.value.gameID].fails -= 1;
        _self.statistics[_self.selectedGame.value.gameID].annotations.push(
          annotation.id
        );
        _self.annotoriousplugin.format(annotation);
      }
    });

    getGames()
      .then((res) => {
        console.log("data recieved:", res);
        console.log("statistics stored:", this.statistics);
        this.gameData = [];
        for (var level of res.data) {
          var newLevel = {
            text: "Level " + level.gameID,
            title: "Level " + level.gameID,
            value: level,
          };
          let annotations = [];
          let annotationIDs = [];
          for (let anno of level.annotations) {
            if (!annotationIDs.includes(anno.annotoriousID)) {
              annotationIDs.push(anno.annotoriousID);
              annotations.push(anno);
            }
          }
          level.annotations = annotations;
          console.log("annos after kicking out doubles: ", annotationIDs);
          if (!this.statistics[newLevel.value.gameID]) {
            this.statistics[newLevel.value.gameID] = {
              fails: 0,
              number: newLevel.value.annotations.length,
              annotations: [],
            };
          } else {
            this.statistics[newLevel.value.gameID].number =
              newLevel.value.annotations.length;
          }
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
      this.loadLevel(newVal);
    },
  },
};
</script>

<style>
.headline {
  font-size: 2em;
  padding: 0.5em;
}
</style>
var VUEPLAYER = function() {

  // Template for playlist items
  Vue.component('playlist-item', {
    template: '\
      <div class="playlist-item" v-bind:class="{ playing: (this.index == positionCache.val) }" >\
       <span  v-on:click="goToSong($event)" class="song-area">{{ comtext }}</span> <span v-on:click="removeSong($event)" class="removeSong">X</span>\
      </div>\
    ',

    props: [ 'index', 'song'],

    // We need the positionCache to track the currently playing song
    data: function(){
      return {
        positionCache: MSTREAM.positionCache,
      }
    },

    // Methods used by playlist item events
    methods: {
      // Go to a song on item click
      goToSong: function(event){
        MSTREAM.goToSongAtPosition(this.index);
      },
      // Remove song
      removeSong: function(event){
        MSTREAM.removeSongAtPosition(this.index, false);
      }
    },

    computed: {
      comtext: function() {
        var returnThis = this.song.filepath;

        if(this.song.metadata.title){
          returnThis = this.song.metadata.title;
          if(this.song.metadata.artist){
            returnThis = this.song.metadata.artist + ' - ' + returnThis;
          }

        }

        return returnThis;
      }
    }
  });

  // Code to update playlist
  var playlistElement = new Vue({
    el: '#playlist',
    data: {
      playlist: MSTREAM.playlist,
    },
    methods: {
      // checkMove is called when a drag-and-drop action happens
      checkMove: function (event) {
        MSTREAM.resetPositionCache();
      }
    }
  });


  var progressBar = new Vue({
    el: '#mstream-player',
    data: {
      playerStats: MSTREAM.playerStats,
      playlist: MSTREAM.playlist,
      positionCache: MSTREAM.positionCache,
      met: MSTREAM.playerStats.metadata
    },
    computed: {
      imgsrc: function () {
        return "/public/img/"+(this.playerStats.playing ? 'pause' : 'play')+"-white.svg";
      },
      widthcss: function ( ) {
        if(this.playerStats.duration === 0){
          return "width:0";
        }

        var percentage = 100 -  ((  this.playerStats.currentTime / this.playerStats.duration) * 100);
        return "width:calc(100% - "+percentage+"%)";
      },

      showTime: function(){
        if (this.playerStats.duration === 0) {
          return '';
        }

        var curr = this.playerStats.duration - this.playerStats.currentTime;
        var minutes = Math.floor(curr / 60);
        var secondsToCalc = Math.floor(curr % 60) + '';
        var currentText = minutes + ':' + (secondsToCalc.length < 2 ? '0' + secondsToCalc : secondsToCalc);

        return currentText;
      },

      currentSongText: function(){
        // TODO: Handle metadata

        // Call these vars so updates cahnge whenever they do
        var posit = this.positionCache.val;
        var plist = this.playlist;
        var playerStats = this.playerStats;
        var titleX =  this.met.title;
        var metx =  this.met;



        var currentSong = MSTREAM.getCurrentSong();

        if(currentSong === false){
          return '\u00A0\u00A0\u00A0Welcome To mStream!\u00A0\u00A0\u00A0';
        }

        // Get current song straight from the source
        var returnText = '';
        if(playerStats.metadata && titleX){
          returnText = titleX;
          if(playerStats.metadata.artist){
            returnText = playerStats.metadata.artist + ' - ' + returnText;
          }
        }else{
          // Use filepath instead
          var filepathArray = currentSong.filepath.split("/");
          returnText =  filepathArray[filepathArray.length-1]
        }

        console.log(MSTREAM.playerStats.metadata);


        return '\u00A0\u00A0\u00A0' + returnText + '\u00A0\u00A0\u00A0';
      }
    },
    methods: {
      toggleRepeat: function(){
        MSTREAM.toggleRepeat();
      },
      toggleShuffle: function(){
        MSTREAM.toggleShuffle();
      }
    }
  });


  var metadataPanel = new Vue({
    el: '#metadata-panel',
    data: {
      meta: MSTREAM.playerStats.metadata
    },
    computed: {
      albumArtPath: function(){
        if(!this.meta['album-art']){
          return '/album-art/default.png';
        }
        return '/album-art/' + this.meta['album-art'];
      }
    }

  });





  // Button Events
  document.getElementById( "progress-bar" ).addEventListener("click",function(event) {
    var relativeClickPosition = event.clientX - this.getBoundingClientRect().left;
    var totalWidth = this.getBoundingClientRect().width;
    var percentage = (relativeClickPosition / totalWidth) * 100;
    // Set Player time
    MSTREAM.seekByPercentage(percentage);
  });

  // Button Events
  document.getElementById( "next-button" ).addEventListener("click",function() {
    MSTREAM.nextSong();
  });
  document.getElementById( "play-pause-button" ).addEventListener("click", function() {
    MSTREAM.playPause();
  });
  document.getElementById("previous-button").addEventListener("click", function(){
    MSTREAM.previousSong();
  });

  // This makes the title text scroll back and forth
  var scrollTimer;
  var scrollRight = true; //Track Scroll Direction
  function startTime(interval = 100) {
    if (scrollTimer) { clearInterval(scrollTimer); }

    scrollTimer = setInterval( function(){
      // Get the max scroll distance
      var maxScrollLeft = document.getElementById('title-text').scrollWidth - document.getElementById('title-text').clientWidth;

      // Change the scroll direction if necessary
      // TODO: Pause for a second when these conditions are hit
      if(document.getElementById('title-text').scrollLeft > (maxScrollLeft - 1)){
        scrollRight = false;
      }
      if(document.getElementById('title-text').scrollLeft === 0){
        scrollRight = true;
      }

      // Do the scroll
      if(scrollRight === true){
        document.getElementById('title-text').scrollLeft = document.getElementById('title-text').scrollLeft + 2;
      }else{
        document.getElementById('title-text').scrollLeft = document.getElementById('title-text').scrollLeft - 2;
      }
    }, interval);
  }
  startTime(50);



  // Change spacebar behviour to Play/PauseListen to every key press user makes
    // Useful for adding media functionality to certain keys
  window.addEventListener("keydown", function(event){
    // Use default behavior if user is in a form
    var element = event.target.tagName.toLowerCase();
    if(element == 'input' || element == 'textarea'){
      return;
    }

    // Check the key
    switch (event.keyCode) {
      case 32: //SpaceBar
        event.preventDefault();
        MSTREAM.playPause();
        break;
    }
    return false;
  }, false);
};

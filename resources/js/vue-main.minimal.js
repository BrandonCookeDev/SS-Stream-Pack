import '../../node_modules/moment';
import '../../node_modules/axios';

/** FILE SYSTEMS */
const RESOURCES_DIR = '../resources'
const IMAGES_DIR    = join(RESOURCES_DIR, 'images');
const FONTS_DIR     = join(RESOURCES_DIR, 'fonts');
const STYLES_DIR    = join(RESOURCES_DIR, 'styles');
const VIDEOS_DIR    = join(RESOURCES_DIR, 'videos');

//Images
const CHARACTER_DIR   = join(IMAGES_DIR, 'Characters');
const PORT_DIR        = join(IMAGES_DIR, 'Ports');
const OVERLAY_DIR     = join(IMAGES_DIR, 'Overlays');
const SPONSOR_DIR     = join(IMAGES_DIR, 'Sponsors');
const FLAG_DIR        = join(IMAGES_DIR, 'Flags/64flat');
const EYES_DIR        = join(IMAGES_DIR, 'PlayerEyes');

//Videos
const WEBM_DIR        = join(VIDEOS_DIR, 'webm');
const MELEE_WEBM      = join(WEBM_DIR, 'Melee');
const SMASH4_WEBM     = join(WEBM_DIR, 'Smash4');
const MELEE_CHAR_DIR  = join(CHARACTER_DIR, 'Melee');
const SMASH4_CHAR_DIR = join(CHARACTER_DIR, 'Smash 4');

//JSON Polling and Intervals
var LEGAL_IMAGE_STATES = ['FLAG', 'SPONSOR'];
var LEGAL_NAMEPLATE_STATES = ['TAG', 'TWITTER'];
const POLL_INTERVAL = 500;
const IMAGE_STATE_INTERVAL = 5000;
const NAMEPLATE_STATE_INTERVAL = 5000;
const JSON_PATH = JSON_PATH || '../StreamControl_0_4b/streamcontrol.json';

var port         = 11769;
const ROUND_INTERVAL = 10000;
var smashGGinit  = 'http://localhost:'+port+'/init/';
var smashGGround = 'http://localhost:'+port+'/getMatch';

var currentTournament = '';

/**
 * Data Object to encapsulate player data
 */
class Player{
    constructor(name, score, character, isOut){
        this.name = name;
        this.score = score;
        this.character = character;
        this.isOut = isOut;
    }
}

/**
 * Data Object for encapsulating Crew information
 */
class Crew{
    constructor(name, players, score){
        this.name = name;
        this.players = players;
        this.score = score;
    }
}

function getMeleeChar(character){
  return join(MELEE_CHAR_DIR, character + '.png');
}

function getSmash4Char(character){
  return join(SMASH4_CHAR_DIR, character + '.png');
}

function getPort(color){
  return join(PORT_DIR, color + '.png');
}

function getFlag(name){
  return join(FLAG_DIR, name + '.png');
}

function getSponsor(sponsor){
  return join(SPONSOR_DIR, sponsor + '.png');
}

function getMeleeMUCharacter(character){
  return join(MELEE_WEBM, 'Characters', character + '.webm');
}

function getS4MUCharacter(character){
  return join(SMASH4_WEBM, 'Characters', character + '.webm');
}

/**
 * Vue Application
 */
var app = new Vue({
  el: '#app',
  data: {
    /* INFO OBJECT LINKS TO THE JSON CREATED BY STREAM CONTROL */
    info: {
        IMAGE_ROTATION_ON: false,
        NAMEPLATE_ROTATION_ON: false,
        IMAGE_STATE: 'FLAG',
        NAMEPLATE_STATE: 'TAG',

        pull_mode: 'PULL_ALL',
        event_countdown: 0,
        event_notice: '',
        event_name: '',
        event_round: '',
        best_of_x: '',

        p1_name: '',
        p2_name: '',

        p1_games: '',
        p2_games: '',

        // Setting a few default values for the flicker of time images take to load.
        p1_char: 'Default',
        p2_char: 'Default',

        leftCharacterVideo: '',
        rightCharacterVideo: '',
		
		//URL for automated round pulling
        smashggUrl: null
        
    },
    timestamp: new Date()
  },
  watch: {
    "info.IMAGE_STATE":{

    },
    "info.NAMEPLATE_STATE":{

    },
    "info.timer": {

    }
  },
  computed: {
    gameHeader: function(){
      return this.info.event_round + ' - ' + this.info.best_of_x;
    },
    player1FlagSponsor: function(){
      
    },
    player1Character: function(){
      return getMeleeChar(this.info.p1_char);
    },
    player2Character: function(){
      return getMeleeChar(this.info.p2_char);
    },
    player3Character: function(){
      return getMeleeChar(this.info.p3_char);
    },
    player4Character: function(){
      return getMeleeChar(this.info.p4_char);
    },
    player1CharacterS4: function(){
      return getSmash4Char(this.info.p1_char_s4);
    },
    player2CharacterS4: function(){
      return getSmash4Char(this.info.p2_char_s4);
    },
    player3CharacterS4: function(){
      return getSmash4Char(this.info.p3_char_s4);
    },
    player4CharacterS4: function(){
      return getSmash4Char(this.info.p4_char_s4);
    },
    player1PortImg: function(){
      return getPort(this.info.p1_port_color);
    },
    player2PortImg: function(){
      return getPort(this.info.p2_port_color);
    },
    player3PortImg: function(){
      return getPort(this.info.p3_port_color);
    },
    player4PortImg: function(){
      return getPort(this.info.p4_port_color);
    },
    player1PortImgS4: function(){
      return getPort(this.info.p1_port_color_s4);
    },
    player2PortImgS4: function(){
      return getPort(this.info.p2_port_color_s4);
    },
    player3PortImgS4: function(){
      return getPort(this.info.p3_port_color_s4);
    },
    player4PortImgS4: function(){
      return getPort(this.info.p4_port_color_s4);
    },
    player1FlagImg: function(){
      return getFlag(this.info.p1_country);
    },
    player2FlagImg: function(){
      return getFlag(this.info.p2_country);
    },
    player3FlagImg: function(){
      return getFlag(this.info.p3_country);
    },
    player4FlagImg: function(){
      return getFlag(this.info.p4_country);
    },
    player1FlagImgS4: function(){
      return getFlag(this.info.p1_country_p4);
    },
    player2FlagImgS4: function(){
      return getFlag(this.info.p2_country_p4);
    },
    player3FlagImgS4: function(){
      return getFlag(this.info.p3_country_p4);
    },
    player4FlagImgS4: function(){
      return getFlag(this.info.p4_country_p4);
    },
    player1Eyes: function(){
      return getEyes(this.info.p1_eyes_s4);
    },
    player2Eyes: function(){
      return getEyes(this.info.p2_eyes_s4);
    },
    player3Eyes: function(){
      return getEyes(this.info.p3_eyes_s4);
    },
    player4Eyes: function(){
      return getEyes(this.info.p4_eyes_s4);
    },
    player1EyesS4: function(){
      return (getEyes(this.info.p1_name_s4.replace(/[\s]*<T>[\s\S]*<\/T>[\s]*/, '')).trim());
    },
    player2EyesS4: function(){
      return (getEyes(this.info.p2_name_s4.replace(/[\s]*<T>[\s\S]*<\/T>[\s]*/, '')).trim());
    },
    player3EyesS4: function(){
      return (getEyes(this.info.p3_name_s4.replace(/[\s]*<T>[\s\S]*<\/T>[\s]*/, '')).trim());
    },
    player4EyesS4: function(){
      return (getEyes(this.info.p4_name_s4.replace(/[\s]*<T>[\s\S]*<\/T>[\s]*/, '')).trim());
    },
    formattedDate: function() {
      return months[
             this.timestamp.getMonth() + 1] + ' ' +
             this.timestamp.getDate() + ', ' +
             this.timestamp.getFullYear();
    },
    formattedTime: function() {
      return zeroPad(this.timestamp.getHours()) + ':' +
             zeroPad(this.timestamp.getMinutes()) + ':' +
             zeroPad(this.timestamp.getSeconds());
    }
  },
  methods: {
    loadJSON: function() {
      axios.get(JSON_PATH, { responseType: 'json' })
        .then(resp => { this.info = resp.data; })
        .catch(resp => { console.error(resp); });
    },
    changeImageState: function(){
      LEGAL_IMAGE_STATES = cycleArray(LEGAL_STATES);
      this.info.IMAGE_STATE = LEGAL_IMAGE_STATES[0];
    },
    changeNameplayState: function(){
      LEGAL_NAMEPLATE_STATES = cycleArray(LEGAL_NAMEPLATE_STATES);
      this.into.NAMEPLATE_STATE = LEGAL_NAMEPLATE_STATES[0];
    }
  },
  // Triggered when the vue instance is created, triggers the initial setup.
  created: function() {
    this.loadJSON();
    setInterval(() => { this.timestamp = new Date(); }, 1000);
    setInterval(this.loadJSON, POLL_INTERVAL);
    setInterval(this.changeImageState, IMAGE_STATE_INTERVAL);
    setInterval(this.changeNameplateState, NAMEPLATE_STATE_INTERVAL);
  }
});


/**
 * Left Pad a Number to Ensure that it is two digits.
 * @param  {int} number
 * @return {String} Left padded result
 */
function zeroPad(number) {
  return number < 10 ? '0' + number : '' + number;
}

/**
 * Cycle the first element of an array to the back
 * @param {Array} arr 
 */
function cycleArray(arr){
  let first = arr.shift();
  arr.push(first);
  return arr;
}

function fileExists(filepath){
  var http = new XMLHttpRequest();

  http.open('HEAD', filepath, false);
  http.send();

  return http.status != 404;
}

/**
 * Join a variable amount of arguments with '/' as a 
 * seperator
 */
function join(){
  let s = '';
  for(var i in arguments){
    var arg = arguments[i];
    s += arg 
    
    if(i != arguments.length - 1) 
      s += '/'
  };
  return s;
}

var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

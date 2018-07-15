
function join(){
  let s = '';
  for(var i in arguments){
    var arg = arguments[i];
    s += arg + '/'
  };
  return s;
}

/** FILE SYSTEMS */
const RESOURCES_DIR = '../resources'
const IMAGES_DIR    = join(RESOURCES_DIR, 'images');
const FONTS_DIR     = join(RESOURCES_DIR, 'fonts');
const STYLES_DIR    = join(RESOURCES_DIR, 'styles');
const VIDEOS_DIR    = join(RESOURCES_DIR, 'videos');

//These paths are relative to the Overlay file
//const CHARACTER_DIR = '../../Overlays/Characters/'
const CHARACTER_DIR   = join(IMAGES_DIR, 'Characters');
const PORT_DIR        = join(IMAGES_DIR, 'Ports');
const OVERLAY_DIR     = join(IMAGES_DIR, 'Overlays');
const FLAG_DIR        = join(IMAGES_DIR, 'Flags/64flat');
const MELEE_CHAR_DIR  = join(CHARACTER_DIR, 'Melee');
const SMASH4_CHAR_DIR = join(CHARACTER_DIR, 'Smash 4');
const EYES_DIR        = '../../CIlvanis Masks/Crops/'

var POLL_INTERVAL = 500;
var ROUND_INTERVAL = 10000;
var JSON_PATH = JSON_PATH || '../StreamControl_0_4b/streamcontrol.json';

var port         = 11769;
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

/**
 * Vue Application
 */
var app = new Vue({
  el: '#app',
  data: {
    /* INFO OBJECT LINKS TO THE JSON CREATED BY STREAM CONTROL */
    info: {
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
  },
  computed: {
    game_header: function(){
      return this.info.event_round + ' - ' + this.info.best_of_x;
    },
    char_1_img: function(){
      return getMeleeChar(this.info.p1_char);
    },
    char_2_img: function(){
      return getMeleeChar(this.info.p2_char);
    },
    char_3_img: function(){
      return getMeleeChar(this.info.p3_char);
    },
    char_4_img: function(){
      return getMeleeChar(this.info.p4_char);
    },
    char_1_img_s4: function(){
      return getSmash4Char(this.info.p1_char_s4);
    },
    char_2_img_s4: function(){
      return getSmash4Char(this.info.p2_char_s4);
    },
    char_3_img_s4: function(){
      return getSmash4Char(this.info.p3_char_s4);
    },
    char_4_img_s4: function(){
      return getSmash4Char(this.info.p4_char_s4);
    },
    p1_port_img: function(){
      return getPort(this.info.p1_port_color);
    },
    p2_port_img: function(){
      return getPort(this.info.p2_port_color);
    },
    p3_port_img: function(){
      return getPort(this.info.p3_port_color);
    },
    p4_port_img: function(){
      return getPort(this.info.p4_port_color);
    },
    p1_port_img_s4: function(){
      return getPort(this.info.p1_port_color_s4);
    },
    p2_port_img_s4: function(){
      return getPort(this.info.p2_port_color_s4);
    },
    p3_port_img_s4: function(){
      return getPort(this.info.p3_port_color_s4);
    },
    p4_port_img_s4: function(){
      return getPort(this.info.p4_port_color_s4);
    },
    p1_flag_img: function(){
      return getFlag(this.info.p1_country);
    },
    p2_flag_img: function(){
      return getFlag(this.info.p2_country);
    },
    p3_flag_img: function(){
      return getFlag(this.info.p3_country);
    },
    p4_flag_img: function(){
      return getFlag(this.info.p4_country);
    },
    p1_flag_img_s1: function(){
      return getFlag(this.info.p1_country_p4);
    },
    p2_flag_img_s2: function(){
      return getFlag(this.info.p2_country_p4);
    },
    p3_flag_img_s3: function(){
      return getFlag(this.info.p3_country_p4);
    },
    p4_flag_img_s4: function(){
      return getFlag(this.info.p4_country_p4);
    },
    p1_eyes_img_s4: function(){
      return getEyes(this.info.p1_eyes_s4);
    },
    p2_eyes_img_s4: function(){
      return getEyes(this.info.p2_eyes_s4);
    },
    p3_eyes_img_s4: function(){
      return getEyes(this.info.p3_eyes_s4);
    },
    p4_eyes_img_s4: function(){
      return getEyes(this.info.p4_eyes_s4);
    },
    p1_eyes_img_s42: function(){
      return (getEyes(this.info.p1_name_s4.replace(/[\s]*<T>[\s\S]*<\/T>[\s]*/, '')).trim());
    },
    p2_eyes_img_s42: function(){
      return (getEyes(this.info.p2_name_s4.replace(/[\s]*<T>[\s\S]*<\/T>[\s]*/, '')).trim());
    },
    p3_eyes_img_s42: function(){
      return (getEyes(this.info.p3_name_s4.replace(/[\s]*<T>[\s\S]*<\/T>[\s]*/, '')).trim());
    },
    p4_eyes_img_s42: function(){
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
    }
  },
  // Triggered when the vue instance is created, triggers the initial setup.
  created: function() {
    this.loadJSON();
    setInterval(() => { this.timestamp = new Date(); }, 1000);
    setInterval(this.loadJSON, POLL_INTERVAL);
  },
  portClass: function(left_right, color){
    return color + '-' + left_right;
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

var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

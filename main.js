window.init = window.init || function(lengthOfPeriodInSeconds) {
  // set up data in the timeline.
  window.gameInfo = {};
  window.gameInfo.homeTimeList = [];
  window.gameInfo.awayTimeList = [];
  window.gameInfo.teamTable = {
    'HOME': 'home',
    'AWAY': 'away'
  }
  window.gameInfo.actionWidth = 8;
  window.gameInfo.resizeTimer = undefined;
  window.gameInfo.lengthOfPeriodInSeconds = lengthOfPeriodInSeconds;
  createTimeline();
  // detect overlapping when resize
  $(window).on('resize', function(e) {
    var game = window.gameInfo;
    clearTimeout(game.resizeTimer);
    game.resizeTimer = setTimeout(function() {
      //resizing has "stopped"
      var homeActionList = $('.' + game.teamTable['HOME']);
      var awayActionList = $('.' + game.teamTable['AWAY']);
      // do update for home and away.
      var timelineWidth = $("#timeline").width();
      var homeTarget = $('#home-line');
      var awayTarget = $('#away-line');
      homeTarget.empty();
      awayTarget.empty();
      var homeCount = game.homeTimeList.length;
      var awayCount = game.awayTimeList.length;
      // update for HOME line
      for (home in game.homeTimeList) {
        var time = game.homeTimeList.shift();
        window.addAction(time, 'HOME');
      }
      // update for AWAY line
      for (home in game.awayTimeList) {
        var time = game.awayTimeList.shift();
        window.addAction(time, 'AWAY');
      }
    }, 100);
  });

}

window.addAction = window.addAction || function(timeInSeconds, team) {
  var game = window.gameInfo;
  if (team === 'HOME') {
    game.homeTimeList.push(timeInSeconds);
  } else if (team === 'AWAY') {
    game.awayTimeList.push(timeInSeconds);
  }

  var teamTable = game.teamTable;
  var displayLine;
  if (teamTable[team] === 'home') {
    displayLine = $('#home-line');
  } else if (teamTable[team] === 'away') {
    displayLine = $('#away-line');
  }
  var actionId = team.toLowerCase() + '-' + parseInt(timeInSeconds);
  var actionBlock = $('<div id="' + actionId + '" class="action"></div>')
  var teamClass = game.teamTable[team];
  actionBlock.addClass(teamClass);
  var timelineWidth = $("#timeline").width();

  actionBlock.css("width", game.actionWidth + "px");
  var posPer = calcPosition(timeInSeconds, game.lengthOfPeriodInSeconds, game.actionWidth, timelineWidth);
  var posPx = posPer * timelineWidth / 100;

  actionBlock.css('left', posPer + '%');
  var actionList = $('.' + teamTable[team]);
  displayLine.append(actionBlock);
  updateList(actionBlock[0], actionList, timelineWidth, game.actionWidth, game.lengthOfPeriodInSeconds);
}

//====test case=====
window.init(110);
// test case
window.addAction(1, 'HOME');
window.addAction(3, 'HOME');
window.addAction(1, 'AWAY');
window.addAction(4, 'HOME');
window.addAction(4, 'AWAY');
window.addAction(8, 'HOME');
window.addAction(52, 'AWAY');
window.addAction(50, 'AWAY');
window.addAction(100, 'AWAY');
window.addAction(100, 'AWAY')
window.addAction(20, 'HOME');
//===================
/*
            actionBlock: new position in the timeline
             actionList: action already in the list
          timelineWidth: the current timeline width
            actionWidth: width of each action dom in the timeline.
lengthOfPeriodInSeconds: whole game time.

this fucntion will detect collision and group.
*/
function updateList(actionBlock, actionList, timelineWidth, actionWidth, lengthOfPeriodInSeconds) {
  if (actionList.length < 1) {
    return;
  }
  var actionDom = $(actionBlock);
  var collisionList = [];

  for (var i = 0; i < actionList.length; i++) {
    var compareDom = $(actionList[i]);
    if (collision(actionDom, compareDom)) {
      collisionList.push(compareDom);
    }
  }
  if (collisionList.length === 1) {
    var dom = collisionList[0];
    if (dom.hasClass("combain")) {
      var combine = parseInt(dom.text());
      combine++;
      dom.text(combine);
    } else {
      dom.addClass("combain");
      dom.text("2");
    }
    actionDom.remove();
    var domSec = parseInt(dom.attr('id').split("-")[1])
    var actionSec = parseInt(actionDom.attr('id').split("-")[1])
    var newtimeInSeconds = (domSec + actionSec) / 2;
    // update to new postion
    var newposPer = calcPosition(newtimeInSeconds, lengthOfPeriodInSeconds, actionWidth, timelineWidth);
    dom.css("left", newposPer + "%");
  } else if (collisionList.length === 2) {
    // three group
    var count = 1;
    for (var j = 0; j < collisionList.length; j++) {
      var dom = collisionList[j];
      if (dom.text() === "") {
        count++;
      } else {
        count += parseInt(dom.text());
      }
      dom.remove();
    }
    actionDom.addClass("combain");
    actionDom.text(count);
  }
}
// according to timeInSeconds to calculate % of the whole timeline.
function calcPosition(timeInSeconds, lengthOfPeriodInSeconds, blockSize, timelineSize) {
  var timePer = timeInSeconds / lengthOfPeriodInSeconds;
  var limit = blockSize / timelineSize / 2;
  limit = limit
  if (timePer < limit) {
    return limit * 100;
  } else if (timePer > (1 - limit)) {
    return (1 - limit) * 100;
  } else {
    return timePer * 100;
  }
}
// create UI of timeline
function createTimeline() {
  var gSportTimeLineContainer = $('<div id="timeline-container"></div>')
  var homeLine = $('<div id="home-line"></div>')
  var timeline = $('<div id="timeline"></div>')
  var awayLine = $('<div id="away-line"></div>')
  var timelineBox = $('<div id="timelineBox"></div>')

  timelineBox.append(homeLine);
  timelineBox.append(timeline);
  timelineBox.append(awayLine);
  gSportTimeLineContainer.append(timelineBox);
  $('body').append(gSportTimeLineContainer);
  for (var i = 0; i < 9; i++) {
    var boxId = 'index-' + i;
    var indexBox = $('<div class="box" id="' + boxId + '"></div>')
    $('#timeline').append(indexBox);
  }
}
// detect if two dom have collision.
function collision($div1, $div2) {
  var x1 = $div1.offset().left;
  var y1 = $div1.offset().top;
  var h1 = $div1.outerHeight(true);
  var w1 = $div1.outerWidth(true);
  var b1 = y1 + h1;
  var r1 = x1 + w1;
  var x2 = $div2.offset().left;
  var y2 = $div2.offset().top;
  var h2 = $div2.outerHeight(true);
  var w2 = $div2.outerWidth(true);
  var b2 = y2 + h2;
  var r2 = x2 + w2;
  if (b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2) return false;
  return true;
}
$(document).ready(function(){
    initialize();
    handleIpad();
});
var scaleXX = 1;

function fillDiv(div, proportional) {
    setTimeout(function(){

        var currentWidth = div.outerWidth();
        var currentHeight = div.outerHeight();

        var availableHeight = window.innerHeight;
        var availableWidth = window.innerWidth;
        // if(availableHeight>availableWidth){
        //     return;
        // }
        var scaleX = availableWidth / currentWidth;
        var scaleY = availableHeight / currentHeight;
            scaleX = scaleY;
        var translationY = Math.round((availableHeight - (currentHeight * scaleY)) / 2);
        var translationX = Math.round((availableWidth - (currentWidth * scaleX)) / 2);

        $('.left_panel').css({     
            "transform": "translate(" + translationY + "px, "+ translationY + "px) scale(" + scaleX + ", " + scaleY + ")",
            "-webkit-transform": "translate(" + translationY + "px, "+ translationY + "px) scale(" + scaleX + ", " + scaleY + ")",
            "-moz-transform": "translate(" + translationY + "px, "+ translationY + "px) scale(" + scaleX + ", " + scaleY + ")",
            "-ms-transform": "translate(" + translationY + "px, "+ translationY + "px) scale(" + scaleX + ", " + scaleY + ")",
            "transform-origin": "0 0"
        });
        $('.right_panel').css({
            "right": $('.right_panel').outerWidth()*scaleX - $('.right_panel').outerWidth(),
            "transform": "translate(" + translationY + "px, "+ translationY + "px) scale(" + scaleX + ", " + scaleY + ")",
            "-webkit-transform": "translate(" + translationY + "px, "+ translationY + "px) scale(" + scaleX + ", " + scaleY + ")",
            "-moz-transform": "translate(" + translationY + "px, "+ translationY + "px) scale(" + scaleX + ", " + scaleY + ")",
            "-ms-transform": "translate(" + translationY + "px, "+ translationY + "px) scale(" + scaleX + ", " + scaleY + ")",
            "transform-origin": "0 0"
        });

        var scaleX = availableWidth / currentWidth;
        var scaleY = availableHeight / currentHeight;

        if (proportional) {
            scaleX = Math.min(scaleX, scaleY);
            scaleY = scaleX;
        }
        var translationX = Math.round((availableWidth - (currentWidth * scaleX)) / 2);
        var translationY = Math.round((availableHeight - (currentHeight * scaleY)) / 2);

        div.css({
            "position": "absolute",
            "left": "0px",
            "top": "0px",
            "transform": "translate(" + translationX + "px, "+ translationY + "px) scale(" + scaleX + ", " + scaleY + ")",
            "-webkit-transform": "translate(" + translationX + "px, "+ translationY + "px) scale(" + scaleX + ", " + scaleY + ")",
            "-moz-transform": "translate(" + translationX + "px, "+ translationY + "px) scale(" + scaleX + ", " + scaleY + ")",
            "-ms-transform": "translate(" + translationX + "px, "+ translationY + "px) scale(" + scaleX + ", " + scaleY + ")",
            "transform-origin": "0 0"
        });
        scaleXX = scaleX;
    },10);
    

}

function initialize() {
    var div = $(".main_wrapper");
    fillDiv(div, true);

    if ("onorientationchange" in window) {
        $(window).bind("orientationchange", function () { setTimeout(function () { fillDiv(div, true); }, 500) });
    } else if ("ondeviceorientation" in window) {
        $(window).bind("deviceorientation", function () { setTimeout(function () { fillDiv(div, true); }, 500) });
    } else {
        $(window).bind("resize", function () { fillDiv(div, true); });
    }
}

$(window).resize(initialize);

function handleIpad(){
    document.documentElement.addEventListener('touchstart', function (event) {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    }, false);
    document.ontouchmove = function(event){
        event.preventDefault();
    }
}
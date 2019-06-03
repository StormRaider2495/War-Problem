var slideDataArray = [],
    meterDataArray = [],
    currentSlide = '',
    previousSlide = '',
    indicator1 = [],
    indicator2 = [],
    animSpeeds = [1000, 1500, 2000, 2500, 3000],
    previousParams = [{
        'initParam1': '',
        'initParam2': '',
        'param1': '',
        'param2': ''
    }],

    monthLongArray = ['', 'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'],
    wasConnectionScreen = "false",
    isNextSlide = "",
    buttonClicked = false,
    clickCounter = 0;
var hasMinValue = "false";

$(document).ready(function() {
    getXmlData();

});


function getXmlData() {
    $.ajax({
        type: "GET",
        url: "data/data.xml",
        dataType: "xml",
        success: function(xml) {
            prepareDataArray(xml);
        },
        complete: function() {}
    });
};

function prepareDataArray(data) {
    $(data).find('slide').each(function() {
        var $t = $(this),
            id = $(this).attr('id'),
            type = $(this).attr('type'),
            nextScreen = $(this).attr('next_screen_id') ? $(this).attr('next_screen_id') : null,
            font = $(this).attr('font_variation') ? $(this).attr('font_variation') : null,
            animationTime = $(this).attr('animation_time') ? $(this).attr('animation_time') : 3,
            text1 = null,
            text2 = null,
            param1 = null,
            param2 = null,
            layout = null,
            options = [];

        switch (type) {
            case 'intro':
                text1 = $t.find('slidetext').eq(0).text();
                text2 = $t.find('slidetext').eq(1).text();
                break;
            case 'exposition':
                text1 = $t.find('slidetext').eq(0).text();
                break;
            case 'decision':
                layout = $t.attr('layout');
                text1 = $t.find('qtext').eq(0).text();
                text2 = $t.find('qtext').eq(1) ? $t.find('qtext').eq(1).text() : null;
                $(this).find('option').each(function() {
                    var $O = $(this);
                    options.push({
                        'id': $O.attr('id'),
                        'nextScreen': $O.attr('next_screen_id'),
                        'mainText': $O.find('main_text').text(),
                        'subText': $O.find('sub_text').text()
                    });
                });
                break;
            case 'result':
                param1 = $t.attr('param1');
                param2 = $t.attr('param2');
                text1 = $t.find('slidetext').eq(0).text(),
                    text2 = $t.find('slidetext').eq(1) ? $t.find('slidetext').eq(1).text() : null;
                break;
            case 'connection':
                text1 = $t.find('slidetext').eq(0).text();
                text2 = $t.find('slidetext').eq(1) ? $t.find('slidetext').eq(1).text() : null;
                break;
            case 'event':
                param1 = $t.attr('param1');
                param2 = $t.attr('param2');
                text1 = $t.find('slidetext').eq(0).text();
                text2 = $t.find('slidetext').eq(1) ? $t.find('slidetext').eq(1).text() : null;
                break;
            case 'termination':
                param1 = $t.attr('param1');
                param2 = $t.attr('param2');
                text1 = $t.find('slidetext').eq(0).text();
                text2 = $t.find('slidetext').eq(1) ? $t.find('slidetext').eq(1).text() : null;
                break;
            case 'warning':
                param1 = $t.attr('param1');
                param2 = $t.attr('param2');
                text1 = $t.find('slidetext').eq(0).text();
                text2 = $t.find('slidetext').eq(1) ? $t.find('slidetext').eq(1).text() : null;
                break;
        }
        slideDataArray.push({
            'id': id,
            'type': type,
            'nextScreen': nextScreen,
            'font': font,
            'animationTime': animationTime,
            'param1': param1,
            'param2': param2,
            'text1': text1,
            'text2': text2,
            'layout': layout,
            'options': options
        });

    });

    $.each(slideDataArray, function(i, val) {
        createSlides(val, val.type, i);
    });

    animateInitialBlocks();
    checkCurrentSlideBtnAndParams();
    if ($(data).find('meters').length != 0 &&
        $(data).find('meter').length != 0 &&
        $(data).find('meters').attr('display').toLowerCase() == 'on') {
        prepareMeterDataArray(data);
    }
    bindEvents();
};


function prepareMeterDataArray(data) {
    //debugger
    if ($(data).find('meters').length == 0 ||
        $(data).find('meter').length == 0 ||
        $(data).find('meters').attr('display').toLowerCase() != 'on') {
        hasMeter = "false";
        return;
    }
    $(data).find('meter').each(function() {
        var meterNodes = [],
            $m = $(this);

        if ($m.find('meterNode').length > 0) {
            $m.find('meterNode').each(function() {
                meterNodes.push({
                    'meterNode': $(this).text(),
                    'meterMax': $(this).attr('maxValue') ? $(this).attr('maxValue') : 25,
                    'meterMin': $(this).attr('minValue') ? $(this).attr('minValue') : 25
                });
            });
        }

        meterDataArray.push({
            'id': $m.attr('id'),
            'type': $m.attr('type'),
            'label': $m.attr('label'),
            'position': $m.attr('position'),
            'initialValue': $m.attr('initialValue'),
            'minValue': $m.attr('minValue'),
            'maxValue': $m.attr('maxValue'),
            'valueDiff': $m.attr('valueDiff'),
            'prefix': $m.attr('prefix'),
            'suffix': $m.attr('suffix'),
            'header': $m.attr('header'),
            'footer': $m.attr('footer'),
            'meterNodes': meterNodes

        });

    });

    $.each(meterDataArray, function(i, val) {
        createMeters(i, val, val.position);
    });

};


function createSlides(sData, slideType, index) {
    var currentBlock = "";
    switch (slideType) {
        case 'intro':
            currentBlock = createIntroSlide(sData);
            break;
        case 'exposition':
            currentBlock = createExpositionSlide(sData, index);
            break;
        case 'decision':
            currentBlock = createDecisionSlide(sData);
            break;
        case 'result':
            currentBlock = createResultSlide(sData);
            break;
        case 'connection':
            currentBlock = createConnectionSlide(sData);
            break;
        case 'event':
            currentBlock = createEventSlide(sData);
            break;
        case 'termination':
            currentBlock = createTerminationSlide(sData);
            break;
        case 'warning':
            currentBlock = createWarningSlide(sData);
            break;
    }
    $('.activity_area').append(currentBlock);
};



function createIntroSlide(sData) {
    var myString = '<section id=' + sData.id + ' data-type =' + sData.type + ' class="slide ' + sData.type + '">';
    myString += '<div class="topText" >' + sData.text1 + '</div>';
    myString += '<div class="midText">' + sData.text2 + '</div>';
    myString += '<div class="buttonHolder"><div class="buttonWrapper"><div class="myButton btnClk" tabindex="1" nextSlide="' + sData.nextScreen + '">START</div></div></div>';
    myString += '</section>';

    return myString;
};

function createExpositionSlide(sData, index) {
    var myString = '<section id=' + sData.id + ' data-type =' + sData.type + ' class="slide ' + sData.type + '" nextSlide="' + sData.nextScreen + '" animTime="' + sData.animationTime + '">';
    myString += '<div class="topText ' + sData.font + '">' + sData.text1 + '</div>';
    myString += '<div class="buttonHolder"><div class="buttonWrapper">';
    // var tabIndexValue=1;
    if (slideDataArray[index - 1].type == sData.type) {
        myString += '<div class="myButton btnClk"  tabindex=0 nextSlide="' + slideDataArray[index - 1].id + '">BACK</div>';
        //    tabIndexValue++;
    }
    myString += '<div class="myButton btnClk" tabindex=0 nextSlide="' + sData.nextScreen + '">CONTINUE</div></div></div>';
    myString += '</section>';
    return myString;
};

function createDecisionSlide(sData) {

    var myString = '<section id=' + sData.id + ' data-type =' + sData.type + ' class="slide ' + sData.type + '">';
    myString += '<div class="topText ' + sData.layout + '">' + sData.text1 + '</div>';

    switch (sData.layout) {
        case 'type1':
            myString += '<div class="topTextPartition  ' + sData.layout + '"></div>';

            myString += '<div class="verticalPartition"></div><div class="mainType1Parent type1"><div class="mainTextWrapper">';

            myString += '<div id=' + sData.id + '' + sData.options[0].id + ' class="option type1"><div class="optionText btnClk mainText optionTextLeft" tabindex=0  nextSlide="' + sData.options[0].nextScreen + '"><p><span>' + sData.options[0].mainText + '</span></p></div></div>';
            myString += '<div id=' + sData.id + '' + sData.options[1].id + ' class="option type1"><div class="optionText btnClk mainText optionTextRight" tabindex=0 nextSlide="' + sData.options[1].nextScreen + '"><p><span>' + sData.options[1].mainText + '</span></p></div></div>';

            myString += '</div>';
            myString += '<div style="clear:both;"></div>';

            myString += '<div class="optionText subText type1 optionTextLeft"><p>' + sData.options[0].subText + '</p></div>';
            myString += '<div class="optionText subText type1 optionTextRight"><p>' + sData.options[1].subText + '</p></div>';
            myString += '<div style="clear:both;"></div>';
            myString += '</div>';

            break;
        case 'type2':
            myString += '<div class="mainType1Parent type2">';
            myString += '<div id=' + sData.id + '' + sData.options[0].id + ' class="option type2"><div class="optionText mainText btnClk optionTextLeft" tabindex=0 nextSlide="' + sData.options[0].nextScreen + '"><p>' + sData.options[0].mainText + '</p></div></div>';

            myString += '<div class="partition type2"></div>';

            myString += '<div id=' + sData.id + '' + sData.options[1].id + ' class="option type2"><div class="optionText mainText btnClk optionTextRight" tabindex=0  nextSlide="' + sData.options[1].nextScreen + '"><p>' + sData.options[1].mainText + '</p></div></div></div>';

            break;
        case 'type3':
            myString += '<div class="container1"><ul>';
            $.each(sData.options, function(i, val) {
                myString += '<li><div class="orangeOpac"></div><div id=' + sData.id + '' + val.id + ' tabindex=0 class="option type3 btnClk" nextSlide="' + val.nextScreen + '"><div class="optionText mainText">' + val.mainText + '</div><div class="optionText subText">' + val.subText + '</div></div></li>';
            });
            myString += '<img src="images/right.png" tabindex="0" class="left"><img src="images/left.png" tabindex="0" class="right"></ul>';
            break;
    }
    myString += '</section>';
    return myString;
};

function createResultSlide(sData) {
    var myString = '<section id=' + sData.id + ' data-type =' + sData.type + ' class="slide ' + sData.type + '" param1="' + sData.param1 + '" param2="' + sData.param2 + '">';
    myString += '<div class="topText">' + sData.text1 + '</div>';
    myString += '<div class="topTextPartition"></div>'
    myString += '<div class="midText">' + sData.text2 + '</div>';
    myString += '<div class="buttonHolder"><div class="buttonWrapper"><div class="myButton btnClk" tabindex=0 nextSlide="prev">BACK</div>';
    myString += '<div class="myButton btnClk" tabindex=0 nextSlide="' + sData.nextScreen + '">CONTINUE</div></div></div>';
    myString += '</section>';

    return myString;
};

function createConnectionSlide(sData) {
    var myString = '<section id=' + sData.id + ' data-type =' + sData.type + ' class="slide ' + sData.type + ' ok"><div class="circle"><div class="content">';
    myString += '<div class="topText">' + sData.text1 + '</div>';
    myString += '<div class="buttonHolder"><div class="buttonWrapper"><div class="myButton btnClk" tabindex=0 nextSlide="' + sData.nextScreen + '">CONTINUE</div></div></div>';
    myString += '</div></div></section>';
    return myString;
};

function createEventSlide(sData) {
    var myString = '<section id=' + sData.id + ' data-type =' + sData.type + ' class="slide ' + sData.type + '"  param1="' + sData.param1 + '" param2="' + sData.param2 + '"><div class="circle"><div class="content">';
    myString += '<div class="topText">' + sData.text1 + '</div>';
    myString += '<div class="buttonHolder"><div class="buttonWrapper"><div class="myButton btnClk" tabindex=0 nextSlide="' + sData.nextScreen + '">CONTINUE</div></div></div>';
    myString += '</div></div></section>';
    return myString;
};

function createTerminationSlide(sData) {
    var myString = '<section id=' + sData.id + ' data-type =' + sData.type + ' class="slide ' + sData.type + '"  param1="' + sData.param1 + '" param2="' + sData.param2 + '"><div class="rhomBus"><div class="content">';
    myString += '<div class="topText">' + sData.text1 + '</div>';
    myString += '<div class="buttonHolder"><div class="buttonWrapper"><!--<div class="myButton btnClk" nextSlide="dispose">EXIT</div>-->';
    myString += '<div class="myButton btnClk startOver" tabindex=0 nextSlide="' + sData.nextScreen + '">START OVER</div></div</div>';
    myString += '</div></div></section>';

    return myString;
};

function createWarningSlide(sData) {
    var myString = '<section id=' + sData.id + ' data-type =' + sData.type + ' class="slide ' + sData.type + ' ok"><div class="circle"><div class="content">';
    myString += '<div class="topText">' + sData.text1 + '</div>';
    myString += '<div class="buttonHolder"><div class="buttonWrapper"><div class="myButton btnClk" tabindex=0 nextSlide="' + sData.nextScreen + '">CONTINUE</div></div></div>';
    myString += '</div></div></section>';
    return myString;
};

function bindEvents() {

    $(".btnClk").focus(function() {
        $(".btnClk").keypress(function(event) {
            console.log(2, buttonClicked);

            if (buttonClicked) {
                return;
            }
            console.log(222);

            buttonClicked = true;
            setTimeout(function() {
                buttonClicked = false;
            }, 200);
            clickCounter++;
            if (event.keyCode == 13) {
                var newSlide = $(this).attr('nextSlide');
                if (newSlide == 'prev') {
                    addRemovePointerEvent(true);
                    var param1 = '',
                        param2 = '';
                    if (previousParams.param1 != '') {
                        param1 = -1 * parseInt(previousParams.param1);
                    }
                    if (previousParams.param2 != '') {
                        param2 = -1 * parseInt(previousParams.param2)
                    }

                    ChangeParams(param1, param2);
                    previousParams.param1 = '';
                    previousParams.param2 = '';

                    newSlide = previousSlide;
                    backButtonTransitionHandler(newSlide);
                    return;
                }

                if ($(this).hasClass('startOver')) {
                    addRemovePointerEvent(true);
                    $('.left_panel').fadeOut();
                    $('.right_panel').fadeOut();
                    var param1 = previousParams.initParam1,
                        param2 = previousParams.initParam2;

                    if (param1 && param1 != '' && !$('#meter1').hasClass('inActive')) {
                        $('#param1').slider("value", param1);
                    }
                    if (param2 && param2 != '' && !$('#meter2').hasClass('inActive')) {
                        $('#param2').slider("value", param2);
                    }
                    //    ChangeParams(param1, param2);
                }
                slideTransition(newSlide);
            }
        });
    });
    $('.btnClk').on('click', function() {
        if (buttonClicked) {
            return;
        }
        buttonClicked = true;
        if (wasConnectionScreen) {
            setTimeout(function() {
                buttonClicked = false;
            }, 1);
        } else {
            setTimeout(function() {
                buttonClicked = false;
            }, animSpeeds[4]);
        }
        clickCounter++;

        var newSlide = $(this).attr('nextSlide');
        $(this).addClass('btnClkRemoveOutline');
        if (newSlide == 'prev') {
            addRemovePointerEvent(true);
            var param1 = '',
                param2 = '';
            if (previousParams.param1 != '') {
                param1 = -1 * parseInt(previousParams.param1);
            }
            if (previousParams.param2 != '') {
                param2 = -1 * parseInt(previousParams.param2)
            }

            ChangeParams(param1, param2);
            previousParams.param1 = '';
            previousParams.param2 = '';

            newSlide = previousSlide;
            backButtonTransitionHandler(newSlide);
            return;
        }

        if ($(this).hasClass('startOver')) {
            addRemovePointerEvent(true);
            $('.left_panel').fadeOut();
            $('.right_panel').fadeOut();
            var param1 = previousParams.initParam1,
                param2 = previousParams.initParam2;
            if (param1 && param1 != '' && !$('#meter1').hasClass('inActive')) {
                $('#param1').slider("value", param1);
            }
            if (param2 && param2 != '' && !$('#meter2').hasClass('inActive')) {
                $('#param2').slider("value", param2);
            }
            //ChangeParams(param1,param2);

        }

        slideTransition(newSlide);
    });

    $('.container1').each(function() {
        var liLength = $(this).find('ul > li').length,
            numOfCards;
        numOfCards = liLength < 5 ? 3 : 5;
        $(this).carousel({
            num: numOfCards,
            maxWidth: 430,
            maxHeight: 192,
            distance: 20,
            scale: 0.8,
            animationTime: 400,
            showTime: 4000000
        });
    });

};

function createMeters(index, sData, position) {
    var currentBlock = "";
    var paramID = position == 'Left' ? 1 : 2;

    if ((sData.type == "DAY") || (sData.type == "MONTH") || (sData.type == "HOUR")) {
        $('#meter' + paramID + ' .topLabel,#meter' + paramID + ' .botLabel').css('height', '6px');
        $('#meter' + paramID + ' .paramHolder').css('height', '480px');
    }

    if (sData.minValue > sData.maxValue) {

        sData.initialValue = -1 * (sData.minValue - sData.initialValue);
        sData.minValue = -1 * sData.minValue;
        sData.maxValue = -1 * sData.maxValue;
    }

    $("#param" + paramID)
        .attr('type', sData.type)
        .attr('sliderIndex', index)
        .attr('prefix', sData.prefix)
        .attr('suffix', sData.suffix)
        .addClass(sData.type)
        .slider({
            orientation: "vertical",
            range: "min",
            min: sData.minValue != "" ? parseInt(sData.minValue) : 0,
            max: sData.maxValue != "" ? parseInt(sData.maxValue) : 100,
            value: sData.initialValue,
            animate: true,
            change: function(event, ui) {
                meterChangeEventHandler(paramID, $(this).attr('type'));
            }
        });
    $("#param" + paramID + ' .ui-slider-handle.ui-corner-all.ui-state-default').attr("tabindex", "-1");
    $("#param" + paramID).attr('param' + paramID, sData.initialValue);
    previousParams['initParam' + paramID] = sData.initialValue;
    $('#meter' + paramID).removeClass('inActive');
    $('#meter' + paramID + ' .topLabel').html(sData.header);
    $('#meter' + paramID + ' .botLabel').html(sData.footer);
    $('#meter' + paramID + ' .paramTitle').html(sData.label);
    checkAndCreateMeterType(sData, paramID);
    meterChangeEventHandler(paramID, sData.type);
};

function checkAndCreateMeterType(sData, paramID) {
    var id = paramID;
    switch (sData.type) {
        case 'MONEY':
            var j = 1;
            var gap = (sData.maxValue - sData.minValue) / parseInt(sData.valueDiff);
            var disTgap = $('#param' + paramID).parent().height() / gap;
            for (var i = 0; i <= gap; i++) {
                if (sData.minValue > 0) {
                    hasMinValue = "true";
                    if (i == 0) {
                        var mySpan = $("<span>");
                        $(mySpan)
                            .css({
                                'bottom': disTgap * (i)
                            })
                            .addClass('paramPreLabels')
                            .attr('paramValue', sData.minValue)
                            .html(sData.prefix + "&nbsp;" + sData.minValue + "&nbsp;" + sdata.suffix);
                        $('#param' + paramID).append(mySpan);
                        $('#param' + paramID).attr('maxVal', sData.maxValue);
                        $('#param' + paramID).attr('minVal', sData.minValue);
                        if (paramID == 1) {
                            indicator1.push(sData.minValue);
                        } else {
                            indicator2.push(sData.minValue);
                        }
                    } else {
                        var mySpan = $("<span>");
                        var htmlValue = parseInt(sData.minValue) + parseInt(sData.valueDiff * (i));
                        $(mySpan)
                            .css({
                                'bottom': disTgap * (i)
                            })
                            .addClass('paramPreLabels')
                            .attr('paramValue', htmlValue)
                            .html(sData.prefix + "&nbsp;" + htmlValue + "&nbsp;" + sdata.suffix);
                        $('#param' + paramID).append(mySpan);
                        $('#param' + paramID).attr('maxVal', sData.maxValue);
                        $('#param' + paramID).attr('minVal', sData.minValue);
                        if (paramID == 1) {
                            indicator1.push(sData.valueDiff * (j + i));
                        } else {
                            indicator2.push(sData.valueDiff * (j + i));
                        }

                    }


                } else {

                    var mySpan = $("<span>");
                    $(mySpan)
                        .css({
                            'bottom': disTgap * (i)
                        })
                        .addClass('paramPreLabels')
                        .attr('paramValue', sData.valueDiff * i)
                        .html(sData.prefix + "&nbsp;" + (sData.valueDiff * i) + "&nbsp;" + sData.suffix);
                    $('#param' + paramID).append(mySpan);
                    $('#param' + paramID).attr('maxVal', sData.maxValue);
                    if (paramID == 1) {
                        indicator1.push(sData.valueDiff * i);
                    } else {
                        indicator2.push(sData.valueDiff * i);
                    }
                    // var mySpan = $("<span>");
                    // $(mySpan).css({
                    //     'bottom': $('#param'+paramID+' .ui-slider-handle').css('bottom')
                    // }).addClass('paramChangeLabels').html(sData.prefix +"&nbsp;" + $('#param'+paramID).slider("value") );
                    // //$('.left_panel .paramHolder').append(mySpan);
                    // $('#param'+paramID).append(mySpan);
                }
            }
            var mySpan = $("<span>");
            $(mySpan).css({
                'bottom': $('#param' + paramID + ' .ui-slider-handle').css('bottom')
            }).addClass('paramChangeLabels').html(sData.prefix + "&nbsp;" + $('#param' + paramID).slider("value"));
            //$('.left_panel .paramHolder').append(mySpan);
            $('#param' + paramID).append(mySpan);

            break;

            // HEALTH METER
        case 'HEALTH':
            var gap = $('#param' + paramID).parent().height() / sData.meterNodes.length;
            var colorPatch = ["Excellent", "Good", "Fair", "Critical"];

            $.each(sData.meterNodes, function(i, val) {
                var mySpan = $("<span>");
                $(mySpan)
                    .css({
                        'top': gap * (i + 1)
                    })
                    .addClass('paramPreLabels ' + colorPatch[i]) // + val.meterNode)
                    .attr('colorPath', colorPatch[i])
                    .attr('paramValue', val.meterMin + "_" + val.meterMax)
                    .html(val.meterNode);
                $('#param' + paramID).append(mySpan);
                if (paramID == 1) {
                    indicator1.push(val.meterMax);
                } else {
                    indicator2.push(val.meterMax);
                }

                var mySpan = $("<span>");
                var myGapHeight = val.meterMax ? (val.meterMax - val.meterMin + 1) : gap;
                myGapHeight = (myGapHeight * $('#param' + paramID).parent().height()) / 100;

                $(mySpan)
                    .css({
                        'height': myGapHeight + 'px'
                    })
                    .addClass('paramColorPatch ' + colorPatch[i]); // val.meterNode);
                $('#param' + paramID).append(mySpan);

            });

            var mySpan = $("<span>");
            $(mySpan).css({
                    'bottom': $('#param' + paramID + ' .ui-slider-handle').css('bottom')
                })
                .addClass('paramChangeLabels')
                .html(sData.prefix + "&nbsp;" + $('#param' + paramID)
                    .slider("value"));
            //$('.left_panel .paramHolder').append(mySpan);
            $('#param' + paramID).append(mySpan);
            break;
            // DAY METER
        case 'DAY':

            var divHeight = $('#param' + id).parent().height() / 30;
            var mySpan = $("<span>"),
                mySpan1 = $("<span>");
            var displayValue = parseInt(sData.minValue) < 0 ? (30 - $('#param' + id).slider("value")) : $('#param' + id).slider("value");
            $(mySpan).css({
                'bottom': $('#param' + id + ' .ui-slider-handle').css('bottom')
            }).addClass('paramChangeLabels').html(sData.prefix + " " + (displayValue) + " " + sData.suffix);

            $(mySpan1).css({
                'bottom': $('#param' + id + ' .ui-slider-handle').css('bottom')
            }).addClass('paramChangeSlider').html(displayValue);


            $('#param' + id).append(mySpan);
            $('#param' + id).append(mySpan1);

            $('#param' + id + '.ui-slider-handle').html(displayValue);
            for (var i = 0; i < 30; i++) {
                if (parseInt(sData.minValue) < 0) {
                    $('#param' + id).append('<div class="DayDiv">' + (i + 1) + '</div>');
                } else {
                    $('#param' + id).prepend('<div class="DayDiv">' + (i + 1) + '</div>');
                }

                $(".DayDiv").css('height', divHeight);

            }
            break;
            // HOUR METER
        case 'HOUR':
            var divHeight = $('#param' + id).parent().height() / 24;
            var mySpan = $("<span>"),
                mySpan1 = $("<span>");
            $(mySpan).css({
                'bottom': $('#param' + id + ' .ui-slider-handle').css('bottom')
            }).addClass('paramChangeLabels').html(sData.prefix + " " + (24 - $('#param' + id).slider("value")) + " " + sData.suffix);

            $(mySpan1).css({
                'bottom': $('#param' + id + ' .ui-slider-handle').css('bottom')
            }).addClass('paramChangeSlider').html(displayValue);

            $('#param' + id).append(mySpan);
            $('#param' + id).append(mySpan1);

            $('#param' + id + '.ui-slider-handle').html(24 - $('#param' + id).slider("value"));
            for (var i = 0; i < 24; i++) {

                if (parseInt(sData.minValue) < 0) {
                    $('#param' + id).append('<div class="HourDiv">' + (i + 1) + '</div>');
                } else {
                    $('#param' + id).prepend('<div class="HourDiv">' + (i + 1) + '</div>');
                }

                $(".HourDiv").css('height', divHeight);

            }
            break;
            // MONTH METER
        case 'MONTH':
            var divHeight = $('#param' + id).parent().height() / 12;
            var mySpan = $("<span>"),
                mySpan1 = $("<span>");
            $(mySpan).css({
                'bottom': $('#param' + id + ' .ui-slider-handle').css('bottom')
            }).addClass('paramChangeLabels').html(sData.prefix + " " + (monthLongArray[12 - $('#param' + id).slider("value")]) + " " + sData.suffix);

            $(mySpan1).css({
                'bottom': $('#param' + id + ' .ui-slider-handle').css('bottom')
            }).addClass('paramChangeSlider').html(displayValue);

            $('#param' + id).append(mySpan);
            $('#param' + id).append(mySpan1);
            var monthValue = $('#param' + id).slider("value") < 0 ? (12 + $('#param' + id).slider("value")) : (12 - $('#param' + id).slider("value"));

            $('#param' + id + '.ui-slider-handle').html(monthLongArray[monthValue].substr(0, 3));
            for (var i = 0; i < monthLongArray.length; i++) {
                if (i == 0) {

                } else {
                    if (parseInt(sData.minValue) < 0) {
                        $('#param' + id).append('<div class="MonthDiv">' + monthLongArray[i].substr(0, 3) + '</div>');
                    } else {
                        $('#param' + id).prepend('<div class="MonthDiv">' + monthLongArray[i].substr(0, 3) + '</div>');
                    }
                }
                $(".MonthDiv").css('width', '14px');
                $(".MonthDiv").css('height', divHeight);
                $(".MonthDiv").css('border-color', 'red');
            }
            break;
    }

};


function meterChangeEventHandler(id, type) {
    switch (type) {
        case 'MONEY':
            // check if id is equal to 2 i.e. its meter2 than increase height of toplabel
            if (id == 2) {
                $('#meter2 .topLabel').addClass('toplabelHeightMeter2');
            }
            if (hasMinValue == "true") {
                $('#param' + id + ' .paramChangeLabels').css('bottom', $('#param' + id + ' .ui-slider-handle').css('bottom') + '%');
                var sliderValue = $('#param' + id).slider("value");
                maxVal = $('#param' + id).attr('maxVal'),
                    minVal = $('#param' + id).attr('minVal'),
                    bottom = 0,
                    totalValue = parseInt(maxVal) - parseInt(minVal),
                    computeSlider = parseInt(sliderValue) - parseInt(minVal)
                bottom = (computeSlider / totalValue) * 100;
                $('#param' + id + ' .paramChangeLabels').css('bottom', bottom + '%');
                $('#param' + id + ' .paramChangeLabels').html($('#param' + id).attr('prefix') + "&nbsp;" + sliderValue + "&nbsp;" + $('#param' + id).attr('suffix'));
            } else {
                $('#param' + id + ' .paramChangeLabels').css('bottom', $('#param' + id + ' .ui-slider-handle').css('bottom') + '%');
                var sliderValue = $('#param' + id).slider("value"),
                    maxVal = $('#param' + id).attr('maxVal'),
                    bottom = 0;
                bottom = (sliderValue / maxVal) * 100;
                $('#param' + id + ' .paramChangeLabels').css('bottom', bottom + '%');
                $('#param' + id + ' .paramChangeLabels').html($('#param' + id).attr('prefix') + "&nbsp;" + sliderValue + "&nbsp;" + $('#param' + id).attr('suffix')); //
            }
            //highlight text and arrow
            var match = $.inArray(sliderValue, window['indicator' + id]);
            if (match != -1) {
                $('#param' + id + ' .paramPreLabels[paramValue="' + sliderValue + '"]').hide();
            } else {
                $('#param' + id + ' .paramPreLabels').show();
            }
            $.each(window["indicator" + id], function(i, val) {
                if (sliderValue > val) {
                    $('#param' + id + ' .paramPreLabels[paramValue="' + val + '"]').addClass('active');
                } else {
                    $('#param' + id + ' .paramPreLabels[paramValue="' + val + '"]').removeClass('active');
                }
            });

            break;
        case 'HEALTH':
            var sliderValue = $('#param' + id).slider("value");
            $('#param' + id + ' .paramChangeLabels').html(sliderValue);

            $.each($('#param' + id + ' .paramPreLabels'), function(i, val) {
                var myMeterValue = $(this).attr('paramValue');
                myMeterValue = myMeterValue.split('_');
                //debugger;
                if (sliderValue >= myMeterValue[0] && sliderValue <= myMeterValue[1]) {
                    $(this).addClass('active');
                    // console.log($(this).index());
                    $('#param' + id + ' .ui-slider-handle').removeClass().addClass('ui-slider-handle ui-corner-all ui-state-default ' + $(this).attr('colorPath'));
                } else {
                    $(this).removeClass('active');
                }
            });
            break;
        case 'DAY':
            var sliderValue = $('#param' + id).slider("value");
            var displayValue = sliderValue < 0 ? (30 + $('#param' + id).slider("value")) : $('#param' + id).slider("value");
            $('#param' + id + ' .ui-slider-handle,#param' + id + ' .paramChangeSlider').html(displayValue);
            var sliderValue = $('#param' + id).slider("value"),
                maxVal = 30,
                bottom = 0;
            if (sliderValue < 0) {
                bottom = ((-1 * sliderValue) / maxVal) * 100;
            } else {
                bottom = ((sliderValue - 1) / maxVal) * 100;
            }
            $('#param' + id + ' .paramChangeLabels,#param' + id + ' .paramChangeSlider').css('bottom', bottom + '%');

            $('#param' + id + ' .paramChangeLabels').html($('#param' + id).attr('prefix') + " " + (displayValue) + " " + $('#param' + id).attr('suffix'));
            break;
        case 'HOUR':
            var sliderValue = $('#param' + id).slider("value");
            var displayValue = sliderValue < 0 ? (24 + $('#param' + id).slider("value")) : $('#param' + id).slider("value");
            $('#param' + id + ' .ui-slider-handle,#param' + id + ' .paramChangeSlider').html(displayValue);
            var sliderValue = $('#param' + id).slider("value"),
                maxVal = 24,
                bottom = 0;
            if (sliderValue < 0) {
                bottom = ((-1 * sliderValue) / maxVal) * 100;
            } else {
                bottom = ((sliderValue - 1) / maxVal) * 100;
            }
            $('#param' + id + ' .paramChangeLabels,#param' + id + ' .paramChangeSlider').css('bottom', bottom + '%');

            $('#param' + id + ' .paramChangeLabels').html($('#param' + id).attr('prefix') + " " + (displayValue) + " " + $('#param' + id).attr('suffix'));
            break;
        case 'MONTH':
            var sliderValue = $('#param' + id).slider("value");
            var displayValue = sliderValue < 0 ? (12 + $('#param' + id).slider("value")) : $('#param' + id).slider("value");
            $('#param' + id + ' .ui-slider-handle,#param' + id + ' .paramChangeSlider').html(monthLongArray[displayValue].substr(0, 3));
            var sliderValue = $('#param' + id).slider("value"),
                maxVal = 12,
                bottom = 0;
            if (sliderValue < 0) {
                bottom = ((-1 * sliderValue) / maxVal) * 100;
            } else {
                bottom = ((sliderValue - 1) / maxVal) * 100;
            }
            $('#param' + id + ' .paramChangeLabels,#param' + id + ' .paramChangeSlider').css('bottom', bottom + '%');

            $('#param' + id + ' .paramChangeLabels').html($('#param' + id).attr('prefix') + " " + (monthLongArray[displayValue]) + " " + $('#param' + id).attr('suffix'));


            break;
    }
}



function checkCurrentSlideBtnAndParams() {
    currentAnimTime = parseInt($('#' + currentSlide).attr('animTime')) * 1000;
    if ($('#' + currentSlide + ' .btnClk').length == 0) {
        if ($('#' + currentSlide)[0].id != isNextSlide) {
            isNextSlide = $('#' + currentSlide)[0].id;
            setTimeout(function() {
                //     alert($('#'+currentSlide).attr('nextSlide'));
                var newSlide = $('#' + currentSlide).attr('nextSlide');
                //   isNextSlide=$('#'+currentSlide)[0].id;
                slideTransition(newSlide);
                //   isNextSlide=newSlide;
                //},5000);
            }, currentAnimTime);
        }

    }
    if (!$('#' + currentSlide).hasClass('intro') &&
        !$('#' + currentSlide).hasClass('exposition')) {

        if (!$('.left_panel').hasClass('inActive')) {
            $('.left_panel').fadeIn();
        }
        if (!$('.right_panel').hasClass('inActive')) {
            $('.right_panel').fadeIn();
        }

    }
    handleMeterValueChange();
    addRemovePointerEvent(false);
};


function handleMeterValueChange() {
    var param1 = '',
        param2 = '';
    if ($('#' + currentSlide).attr('param1')) {
        param1 = parseInt($('#' + currentSlide).attr('param1'));
        previousParams.param1 = param1;
    }
    if ($('#' + currentSlide).attr('param2')) {
        param2 = parseInt($('#' + currentSlide).attr('param2'));
        previousParams.param2 = param2;

    }

    ChangeParams(param1, param2);
}

function ChangeParams(param1, param2) {
    //    speed variable is defined and set later to animate according to type of meter
    var speedParam1 = 20;
    var speedParam2 = 20;
    if ($("#param1").attr('type') == 'MONEY') {
        speedParam1 = 150;
    }
    if ($("#param2").attr('type') == 'MONEY') {
        speedParam2 = 150;
    }

    if (param1 && param1 != '' && !$('#meter1').hasClass('inActive') && $("#param1").attr('type') != 'HEALTH') {
        // all variables in param one are provided prefix p
        var poldValue = $('#param1').slider("value"),
            pincrementalValue = 0,
            pnewValue = 0,
            pparamValue = param1;
        pnewValue = poldValue + pparamValue;
        if (pparamValue < 0) {
            pincrementalValue = (poldValue - pnewValue) / speedParam1;
        } else {
            pincrementalValue = (pnewValue - poldValue) / speedParam1;
        }
        if (($("#param1").attr('type') == 'DAY') || ($("#param1").attr('type') == 'HOUR') || ($("#param1").attr('type') == 'MONTH')) {
            pparamValue = -1 * pparamValue;
        }

        if (($("#param1").attr('type') == 'DAY') || ($("#param1").attr('type') == 'HOUR') || ($("#param1").attr('type') == 'MONTH')) {
            //$('#param1').slider("value", $('#param1').slider("value") - param1);
            pnewValue = poldValue - pparamValue;

            var pmyInterval = setInterval(function() {

                if (pparamValue > 0) {
                    poldValue -= pincrementalValue;
                    $('#param1').slider("value", poldValue);
                    addRemovePointerEvent(true);
                    if (pnewValue >= poldValue) {
                        $('#param1').slider("value", pnewValue);
                        clearInterval(pmyInterval);
                        addRemovePointerEvent(false);
                    }
                } else {

                    poldValue += pincrementalValue;
                    $('#param1').slider("value", poldValue);
                    addRemovePointerEvent(true);
                    if (pnewValue <= poldValue) {
                        $('#param1').slider("value", pnewValue);
                        clearInterval(pmyInterval);
                        addRemovePointerEvent(false);
                    }
                }
            }, 1);
        } else {

            var myInterval1 = setInterval(function() {
                if (pparamValue < 0) {
                    poldValue -= pincrementalValue;
                    $('#param1').slider("value", poldValue);
                    addRemovePointerEvent(true);
                    if (pnewValue >= poldValue) {
                        $('#param1').slider("value", pnewValue);
                        clearInterval(myInterval1);
                        addRemovePointerEvent(false);
                    }
                } else {
                    poldValue += pincrementalValue;
                    $('#param1').slider("value", poldValue);
                    addRemovePointerEvent(true);
                    if (pnewValue <= poldValue) {
                        $('#param1').slider("value", pnewValue);
                        clearInterval(myInterval1);
                        addRemovePointerEvent(false);
                    }
                }
            }, 1);
        }
    } else if (param1 && param1 != '' && !$('#meter1').hasClass('inActive')) {
        $('#param1').slider("value", $('#param1').slider("value") + param1);
    }

    if (param2 && param2 != '' && !$('#meter2').hasClass('inActive') && $("#param2").attr('type') != 'HEALTH') {
        var oldValue = $('#param2').slider("value"),
            incrementalValue = 0,
            newValue = 0,
            paramValue = param2;
        newValue = oldValue + paramValue;
        if (paramValue < 0) {
            incrementalValue = (oldValue - newValue) / speedParam2;
        } else {
            incrementalValue = (newValue - oldValue) / speedParam2;
        }

        if (($("#param2").attr('type') == 'DAY') || ($("#param2").attr('type') == 'HOUR') || ($("#param2").attr('type') == 'MONTH')) {
            paramValue = -1 * paramValue;
        }

        if (($("#param2").attr('type') == 'DAY') || ($("#param2").attr('type') == 'HOUR') || ($("#param2").attr('type') == 'MONTH')) {
            newValue = oldValue - paramValue;
            var myIntervalParam2 = setInterval(function() {
                if (paramValue > 0) {
                    oldValue -= incrementalValue;
                    $('#param2').slider("value", oldValue);
                    addRemovePointerEvent(true);
                    if (newValue >= oldValue) {
                        $('#param2').slider("value", newValue);
                        clearInterval(myIntervalParam2);
                        addRemovePointerEvent(false);
                    }
                } else {

                    oldValue += incrementalValue;
                    $('#param2').slider("value", oldValue);
                    addRemovePointerEvent(true);
                    if (newValue <= oldValue) {
                        $('#param2').slider("value", newValue);
                        clearInterval(myIntervalParam2);
                        addRemovePointerEvent(false);
                    }
                }
            }, 1);
        } else {

            var myIntervalMoney = setInterval(function() {
                if (paramValue < 0) {
                    oldValue -= incrementalValue;
                    $('#param2').slider("value", oldValue);
                    addRemovePointerEvent(true);
                    if (newValue >= oldValue) {
                        $('#param2').slider("value", newValue);
                        clearInterval(myIntervalMoney);
                        addRemovePointerEvent(false);
                    }
                } else {
                    oldValue += incrementalValue;
                    $('#param2').slider("value", oldValue);
                    addRemovePointerEvent(true);
                    if (newValue <= oldValue) {
                        $('#param2').slider("value", newValue);
                        clearInterval(myIntervalMoney);
                        addRemovePointerEvent(false);
                    }
                }
            }, 1);

            //      $('#param2').slider("value", newValue);
        }
    } else if (param2 && param2 != '' && !$('#meter2').hasClass('inActive')) {
        $('#param2').slider("value", $('#param2').slider("value") + param2);
    }
}


function animateInitialBlocks() {
    $('.slide').animate({
        opacity: 0
    }, 1).fadeOut();
    currentSlide = $('.slide').eq(0).attr('id');
    slideTransition(currentSlide);
};


function slideTransition(nSlide) {
    var slideType = $('#' + nSlide).attr("data-type");
    // $('#' + nSlide).focus();
    //   addRemovePointerEvent(true);
    switch (slideType) {
        case 'intro':
            $('#' + nSlide + ' .buttonHolder').animate({
                opacity: 0
            }, 1);
            $('#' + currentSlide).animate({
                'top': $('#' + currentSlide).hasClass('exposition') ? '150px' : '0px',
                opacity: 0

            }, animSpeeds[0], function() {

                $('#' + currentSlide).fadeOut(1).animate({}, 1, function() {
                    $('#' + nSlide).fadeIn();
                    $('#' + nSlide).animate({
                        //    transform: 'scale(1)',
                        opacity: 1

                    }, animSpeeds[1], function() {
                        $('#' + nSlide + ' .topText').animate({
                            //    transform: 'scale(1)',
                            opacity: 1
                        }, animSpeeds[1]);
                        $('#' + nSlide + ' .midText').animate({
                            //    transform: 'scale(1)',
                            opacity: 1
                        }, animSpeeds[1]);
                        $('#' + nSlide + ' .buttonHolder').animate({
                            //    transform: 'scale(1)',
                            opacity: 1
                        }, animSpeeds[1]);


                    });

                    previousSlide = currentSlide;
                    currentSlide = nSlide;
                    checkCurrentSlideBtnAndParams();
                });
            });
            wasConnectionScreen = "false";
            break;
        case 'exposition':
            $('#' + nSlide + ' .buttonHolder').animate({
                opacity: 0
            }, 1);
            $('#' + nSlide).css("top", "-150px");

            $('#' + currentSlide).animate({
                //    transform: 'scale(2.5)',
                'top': $('#' + currentSlide).hasClass('exposition') ? '150px' : '0px',
                opacity: 0

            }, animSpeeds[0], function() {
                $('#' + currentSlide).fadeOut().animate({
                    //  transform: 'scale(0.5)'
                }, 1, function() {
                    $('#' + nSlide).fadeIn();
                    $('#' + nSlide).animate({
                        //            transform: 'scale(1)',
                        'top': '0px',
                        opacity: 1
                    }, animSpeeds[1], function() {
                        $('#' + nSlide + ' .buttonHolder').animate({
                            //    transform: 'scale(1)',
                            opacity: 1
                        }, animSpeeds[1]);
                    });
                    previousSlide = currentSlide;
                    currentSlide = nSlide;
                    checkCurrentSlideBtnAndParams();
                });
            });
            wasConnectionScreen = "false";
            break;
        case 'decision':

            $('#' + nSlide + ' .mainType1Parent,#' + nSlide + ' .container1').animate({
                'height': '0px',
                transform: 'scale(0)'
            }, 1).fadeOut(1);

            $('#' + nSlide + ' .optionTextLeft').hide(); //.addClass('slideLeft');
            $('#' + nSlide + ' .optionTextRight').hide(); //.addClass('slideRight');
            $('#' + nSlide + ' .partition, #' + nSlide + ' .verticalPartition').animate({
                'height': '0px'
            }); //.addClass('slideRight');

            $('#' + currentSlide).animate({
                //            transform: 'scale(2.5)',
                'top': $('#' + currentSlide).hasClass('exposition') ? '150px' : '0px',
                opacity: 0
            }, animSpeeds[0], function() {
                $('#' + nSlide + ' .topText').animate({
                    'font-size': '24px' //,transform: 'scale(0)'
                }, 1);

                $('#' + nSlide + ' .topTextPartition').animate({
                    transform: 'scale(0)',
                }, 1);

                $('#' + currentSlide).fadeOut(1).animate({
                    //  transform: 'scale(0.5)'
                }, 1, function() {
                    $('#' + nSlide).fadeIn();
                    $('#' + nSlide).animate({
                        //    transform: 'scale(1)',
                        opacity: 1
                    }, 100, function() {
                        $('#' + nSlide + ' .topText').animate({
                            //    transform: 'scale(1)',
                            opacity: 1
                        }, animSpeeds[1], function() {

                            $('#' + nSlide + ' .topTextPartition').animate({
                                transform: 'scale(1)',
                            }, animSpeeds[2]);
                            $('#' + nSlide + ' .type1.mainType1Parent,#' + nSlide + ' .container1')
                                .fadeIn(1)
                                .animate({
                                    transform: 'scale(1)',
                                    opacity: 1,
                                    'height': '228px'
                                }, animSpeeds[2]);

                            $('#' + nSlide + ' .type2.mainType1Parent')
                                .fadeIn(1)
                                .animate({
                                    transform: 'scale(1)',
                                    opacity: 1,
                                    'height': '56px'
                                }, animSpeeds[2]);


                            $('#' + nSlide + ' .type2.partition').animate({
                                'height': '56px'
                            }, animSpeeds[0], function() {
                                $('#' + nSlide + ' .optionTextLeft').show().addClass('slideLeft');
                                $('#' + nSlide + ' .optionTextRight').show().addClass('slideRight');
                            });

                            if ($('#' + nSlide).find('.topTextPartition').length > 0) {
                                var addtop = $('#' + nSlide + ' .topText').height() - 29;
                                $('#' + nSlide).find('.verticalPartition').css('top', addtop + 60 + 'px');
                                var mainTextHeight = $('#' + nSlide + ' .mainText').height();
                                var subTextHeight = $('#' + nSlide + ' .subText.type1').height();
                                var totalOptionHeight = mainTextHeight + subTextHeight;
                            }

                            $('#' + nSlide + ' .verticalPartition').animate({
                                'height': totalOptionHeight + 10 + 'px'
                            }, animSpeeds[2], function() {
                                $('#' + nSlide + ' .optionTextLeft').show().addClass('slideLeft');
                                $('#' + nSlide + ' .optionTextRight').show().addClass('slideRight');
                            });
                            addRemovePointerEvent(false);
                        });

                    });
                    previousSlide = currentSlide;
                    currentSlide = nSlide;
                    checkCurrentSlideBtnAndParams();
                });
            });
            wasConnectionScreen = "false";
            break;
        case 'result':
            $('#' + currentSlide).animate({
                'top': $('#' + currentSlide).hasClass('exposition') ? '150px' : '0px',
                opacity: 0

            }, 1000, function() {
                $('#' + nSlide + ' .topTextPartition').animate({
                    transform: 'scale(0)'
                }, 1)

                $('#' + currentSlide).fadeOut(1).animate({}, 1, function() {
                    $('#' + nSlide).fadeIn();
                    $('#' + nSlide).animate({
                        opacity: 1
                    }, animSpeeds[1]);

                    $('#' + nSlide + ' .topTextPartition').animate({
                        transform: 'scale(1)',
                    }, animSpeeds[4]);

                    previousSlide = currentSlide;
                    currentSlide = nSlide;
                    checkCurrentSlideBtnAndParams();
                });
            });
            wasConnectionScreen = "false";
            break;
        case 'connection':
            if (wasConnectionScreen == "true") {
                $('#' + currentSlide).animate({
                    'top': $('#' + currentSlide).hasClass('exposition') ? '150px' : '0px',
                    opacity: 0
                }, 1, function() {
                    $('#' + currentSlide).css('display', 'none');
                    $('#' + nSlide).css('display', 'block');
                    $('#' + nSlide).css('opacity', '1');
                    previousSlide = currentSlide;
                    currentSlide = nSlide;
                    checkCurrentSlideBtnAndParams();
                });
            } else {
                $('#' + currentSlide).animate({
                    opacity: 0
                }, animSpeeds[2], function() {
                    $('#' + currentSlide).fadeOut().animate({}, 1, function() {
                        $('#' + nSlide).fadeIn();
                        $('#' + nSlide).animate({
                            opacity: 1
                        }, animSpeeds[2]);
                        previousSlide = currentSlide;
                        currentSlide = nSlide;
                        checkCurrentSlideBtnAndParams();
                    });
                });
            }
            wasConnectionScreen = "true";
            break;
        case 'event':
            $('#' + currentSlide).animate({
                'top': $('#' + currentSlide).hasClass('exposition') ? '150px' : '0px',
                opacity: 0
            }, animSpeeds[2], function() {
                $('#' + currentSlide).fadeOut().animate({}, 1, function() {
                    $('#' + nSlide).fadeIn();
                    $('#' + nSlide).animate({
                        opacity: 1
                    }, animSpeeds[2]);
                    previousSlide = currentSlide;
                    currentSlide = nSlide;
                    checkCurrentSlideBtnAndParams();
                });
            });
            wasConnectionScreen = "false";

            break;
        case 'termination':
            $('#' + currentSlide).animate({
                'top': $('#' + currentSlide).hasClass('exposition') ? '150px' : '0px',
                opacity: 0

            }, animSpeeds[2], function() {
                $('#' + currentSlide).fadeOut().animate({}, 1, function() {
                    $('#' + nSlide).fadeIn();
                    $('#' + nSlide).animate({
                        opacity: 1
                    }, animSpeeds[2]);
                    previousSlide = currentSlide;
                    currentSlide = nSlide;
                    checkCurrentSlideBtnAndParams();
                });
            });

            wasConnectionScreen = "false";

            break;
        case 'warning':
            $('#' + currentSlide).animate({
                opacity: 0
            }, animSpeeds[2], function() {
                $('#' + currentSlide).fadeOut().animate({}, 1, function() {
                    $('#' + nSlide).fadeIn();
                    $('#' + nSlide).animate({
                        opacity: 1
                    }, animSpeeds[2]);
                    previousSlide = currentSlide;
                    currentSlide = nSlide;
                    checkCurrentSlideBtnAndParams();
                });
            });
            wasConnectionScreen = "false";
            break;
    }
    $('#' + nSlide).focus();

};



function backButtonTransitionHandler(nSlide) {
    var slideType = $('#' + nSlide).attr("data-type");
    addRemovePointerEvent(true);

    switch (slideType) {
        case 'decision':

            $('#' + nSlide + ' .optionText').removeClass('slideLeft').removeClass('slideRight');
            //    $('.verticalPartition').removeClass('verticalAnim2');

            $('#' + currentSlide).animate({
                opacity: 0
            }, animSpeeds[0], function() {
                $('#' + nSlide + ' .topText').css({
                    transform: 'scale(1)'
                });
                $('#' + nSlide + ' .type1.mainType1Parent,#' + nSlide + ' .container1').css({
                    'height': '200px',
                    transform: 'scale(1)'
                }).fadeIn(1);
                $('#' + nSlide + ' .type2.mainType1Parent').css({
                    'height': '56px',
                    transform: 'scale(1)'
                }).fadeIn(1);

                $('#' + nSlide + ' .topTextPartition').css({
                    transform: 'scale(1)'
                });
                $('#' + currentSlide).fadeOut(1).css({ //transform: 'scale(0.5)'
                });
                $('#' + nSlide).fadeIn(1);
                $('#' + nSlide).animate({
                    'transform': 'scale(1)',
                    'opacity': '1'
                }, 1);
                previousSlide = currentSlide;
                currentSlide = nSlide;
                checkCurrentSlideBtnAndParams();
                addRemovePointerEvent(false);
            });
            break;
    }
};


function addRemovePointerEvent(flag) {
    if (flag) {
        $('body').addClass('pointerEventNone');
    } else {
        $('body').removeClass('pointerEventNone');
    }
}

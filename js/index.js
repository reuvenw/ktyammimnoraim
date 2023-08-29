const maxNumDaveners = 20;
var numDaveners = 0;
var submitAttempted = false;

const membershipFull = 800;
const membershipPartial = 1100;
const buildingFund = 3600;
const seatOne = 100;
const seatTwo = 150;

var membershipDue = 0;
var buildingFundDue = 0;
var seatsDue = 0;
var seatSummary = []

// TODO
// Hebrew

$( document ).ready(function() {
    for (i = 0; i < maxNumDaveners; i++) {
        $('#numDaveners').append($('<option>', {
            value: i + 1,
            text: i + 1
        }));
    }

    $('#numDaveners').on('change', function() {
        updateDaveners(this.value);
        validate();
    });

    $('#submitButton').on('click', function() {
        submitAttempted = true;
        if (validate()) {
            submit();
        }
    });

    stashEnglish();

    $('#he').on('click', function() {
        $("html").children().css("direction","rtl");

        $('#logo').css('padding-right', '0em');
        $('#logo').css('padding-left', '1em');
        $('#logo').css('float', 'right');

        $('#locale').css('float', 'left');

        $('.davenerWidget').css('margin-right', '0em');
        $('.davenerWidget').css('margin-left', '1em');

        localize("he");
    });

    $('#en').on('click', function() {
        $("html").children().css("direction","ltr");

        $('#logo').css('padding-right', '1em');
        $('#logo').css('padding-left', '0em');
        $('#logo').css('float', 'left');

        $('#locale').css('float', 'right');

        $('.davenerWidget').css('margin-right', '1em');
        $('.davenerWidget').css('margin-left', '0em');

        localize("en");
    });
});

function stashEnglish() {
    localizations["en"] = [];
    for (const [key, value] of Object.entries(localizations["he"])) {
        localizations["en"][key] = $('#' + key).html()
    }
    localizations["en"]['name'] = "Name"

}

function localize(locale) {
    for (const [key, value] of Object.entries(localizations[locale])) {
        $('#' + key).html(value)
    }

    const daveners = $("#daveners");
    daveners.find('span[id="davenerTitleStart"]').html(localizations[locale]['davenerTitleStart'])
    daveners.find('input[class="name davenerWidget"]').attr('placeholder', localizations[locale]['name']);

    daveners.find('label[class="maleLabel"]').html(localizations[locale]['maleLabelX']);
    daveners.find('label[class="femaleLabel"]').html(localizations[locale]['femaleLabelX']);

    daveners.find('option[id="optionType"]').html(localizations[locale]['optionType']);
    daveners.find('option[id="optionMember"]').html(localizations[locale]['optionMember']);
    daveners.find('option[id="optionYoungKid"]').html(localizations[locale]['optionYoungKid']);
    daveners.find('option[id="optionOldKid"]').html(localizations[locale]['optionOldKid']);
    daveners.find('option[id="optionGuest"]').html(localizations[locale]['optionGuest']);

    daveners.find('option[id="optionGrade"]').html(localizations[locale]['optionGrade']);
    daveners.find('option[id="optionGan"]').html(localizations[locale]['optionGan']);
    daveners.find('option[id="optionFirst"]').html(localizations[locale]['optionFirst']);
    daveners.find('option[id="optionSecond"]').html(localizations[locale]['optionSecond']);
    daveners.find('option[id="optionThird"]').html(localizations[locale]['optionThird']);
    daveners.find('option[id="optionFourth"]').html(localizations[locale]['optionFourth']);

    daveners.find('label[class="roshHaShanahLabel"]').html(localizations[locale]['roshHaShanahLabelX']);
    daveners.find('label[class="yomKippurLabel"]').html(localizations[locale]['yomKippurLabelX']);
}

function submit() {
    var data = {};
    data['Name'] = $('#name').first().val();
    data['Email'] = $('#email').first().val();

    switch ($('#membership').val()) {
        case "fullMember":
            data['Membership'] = "Previously paid building fund; paying annual membership";
            break;
        case "becomingFullMember":
            data['Membership'] = "Did not yet pay building fund but would like to now, along with annual membership";
            break;
        case "partialMember":
            data['Membership'] = "Will pay annual membership this year, not building fund";
            break;
        case "notAMember":
            data['Membership'] = "Not yet a member";
            break;
    }

    seatSummary["rh"] = []
    seatSummary["yk"] = []
    seatSummary["rh"]["men"] = 0
    seatSummary["rh"]["women"] = 0
    seatSummary["yk"]["men"] = 0
    seatSummary["yk"]["women"] = 0

    data['Number of daveners'] = numDaveners;
    for (i = 0; i < numDaveners; i++) {
        data['Davener #' + (i+1)] = getDavenerText(i);
    }

    data["Rosh HaShanah summary"] = seatSummary["rh"]["men"] + " men, " + seatSummary["rh"]["women"] + " women"
    data["Yom Kippur summary"] = seatSummary["yk"]["men"] + " men, " + seatSummary["yk"]["women"] + " women"

    data['Membership due'] = membershipDue + "₪";
    data['Building fund due'] = buildingFundDue + "₪";
    data['Seats due'] = seatsDue + "₪";
    data['Total due'] = (membershipDue + buildingFundDue + seatsDue) + "₪";
    
    sendEmail("https://public.herotofu.com/v1/4b2f5a60-45d1-11ee-afc4-2f612dbc7441", data, onSuccess, onError);

}

function getDavenerText(number) {
    var male = $('#maleButton' + number).prop("checked");
    var text = $('input[name="name' + number + '"]').first().val() + "; " +
        (male ? "Male" : "Female") + "; ";

    const typeInput = $('select[name="type' + number + '"]').first();
    var type = "-";
    switch (typeInput.val()) {
        case "member":
            type = "Member";
            break;
        case "youngKid":
            type = "Child under grade 5 (";
            
            switch ($('select[name="grade' + number + '"]').val()) {
                case "gan":
                    type += "Gan";
                    break;
                case "1":
                    type += "1st";
                    break;
                case "2":
                    type += "2nd";
                    break;
                case "3":
                    type += "3rd";
                    break;
                case "4":
                    type += "4th";
                    break;
            }
            
            type += ")";
            break;
        case "oldKid":
            type = "Child - grade 5+";
            break;
        case "guest":
            type = "Married child / guest";
            break;
        default:
            break;
    }

    text += type + "; ";

    const roshHaShanah = $('#roshHaShanah' + number);
    const yomKippur = $('#yomKippur' + number);
    if (roshHaShanah.prop("checked") && yomKippur.prop("checked")) {
        seatSummary["rh"][male ? "men" : "women"] = seatSummary["rh"][male ? "men" : "women"] + 1
        seatSummary["yk"][male ? "men" : "women"] = seatSummary["yk"][male ? "men" : "women"] + 1
        text += "Both"
    } else if (roshHaShanah.prop("checked")) {
        seatSummary["rh"][male ? "men" : "women"] = seatSummary["rh"][male ? "men" : "women"] + 1
        text += "Rosh HaShanah"
    } else if (yomKippur.prop("checked")) {
        seatSummary["yk"][male ? "men" : "women"] = seatSummary["yk"][male ? "men" : "women"] + 1
        text += "Yom Kippur"
    }

    return text;
}

var onSuccess = function(response) {
    alert("Form successfully submitted!\nIf you have not already done so, please visit the JGive links to complete your reservation by paying any amounts due.");
    console.log(response);
};

var onError = function(err) {
    alert("Error submitting form");
    $("#submitButton"). attr("disabled", false);
    console.error(err);
};

function sendEmail(endpointUrl, data, onSuccess, onError) {
    $("#submitButton"). attr("disabled", true);
    $.ajax({
        type: "POST",
        url: endpointUrl,
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: onSuccess,
        error: function(xhr, status) {
            if (typeof this.statusCode[xhr.status] !== 'undefined') {
                return false;
            }

            onError(err);
        },
        statusCode: {
            // Endpoint thinks that it's likely a spam/bot request, you need to change "spam protection mode" to "never" in HeroTofu forms
            422: function(response) {
            alert("Cannot send request, are you robot?");
            },
        }
    });
}

function updateDaveners(newValue) {
    const oldNumDaveners = parseInt(numDaveners);
    const newNumDaveners = parseInt(newValue);
    numDaveners = newNumDaveners;
    
    if (newNumDaveners > oldNumDaveners) {
        for (i = oldNumDaveners; i < newNumDaveners; i++) {
            const davenerX = $('#davenerX').clone();
            adjustIdsAndNames(davenerX, i);
            davenerX.appendTo('#daveners');
        }
    } else if (newNumDaveners < oldNumDaveners) {
        for (i = oldNumDaveners - 1; i >= newNumDaveners; i--) {
            $('#davener' + i).remove();
        }
    }

    if (newNumDaveners > 0) {
        $('#summary').removeClass('gone');
    } else {
        $('#summary').addClass('gone');
    }
}

function adjustIdsAndNames(davener, number) {
    davener.find('#davenerNumber').text(parseInt(number) + 1);

    $('#name').on('change', function() {
        validate();
    });

    $('#email').on('change', function() {
        validate();
    });

    $('#membership').on('change', function() {
        validate();
    });

    $('#numDaveners').on('change', function() {
        validate();
    });

    davener.find('input[name="nameX"]').on('change', function() {
        validate();
    });

    davener.find('#maleButtonX').on('change', function() {
        validate();
    });

    davener.find('#femaleButtonX').on('change', function() {
        validate();
    });

    davener.find('select[name="typeX"]').on('change', function() {
        validate();
    });

    davener.find('select[name="gradeX"]').on('change', function() {
        validate();
    });

    davener.find('#roshHaShanahX').on('change', function() {
        validate();
    });

    davener.find('#yomKippurX').on('change', function() {
        validate();
    });

    davener.attr('id', 'davener' + number);
    davener.find('input[name="nameX"]').attr('name', 'name' + number);
    davener.find('input[name="genderX"]').attr('name', 'gender' + number);
    davener.find('#maleLabelX').attr('for', 'maleButton' + number);
    davener.find('#femaleLabelX').attr('for', 'femaleButton' + number);
    davener.find('#maleButtonX').attr('id', 'maleButton' + number);
    davener.find('#maleLabelX').attr('id', 'maleLabel' + number);
    davener.find('#femaleButtonX').attr('id', 'femaleButton' + number);
    davener.find('#femaleLabelX').attr('id', 'femaleLabel' + number);
    davener.find('select[name="typeX"]').attr('name', 'type' + number);
    davener.find('select[name="gradeX"]').attr('name', 'grade' + number);
    davener.find('input[name="roshHaShanahX"]').attr('name', 'roshHaShanah' + number);
    davener.find('input[name="yomKippurX"]').attr('name', 'yomKippur' + number);
    davener.find('#roshHaShanahX').attr('id', 'roshHaShanah' + number);
    davener.find('#yomKippurX').attr('id', 'yomKippur' + number);
    davener.find('#roshHaShanahLabelX').attr('for', 'roshHaShanah' + number);
    davener.find('#yomKippurLabelX').attr('for', 'yomKippur' + number);
    davener.find('#roshHaShanahLabelX').attr('id', 'roshHaShanahLabel' + number);
    davener.find('#yomKippurLabelX').attr('id', 'yomKippurLabel' + number);
    davener.find('#dueX').attr('id', 'due' + number);
    davener.find('#dueAmountX').attr('id', 'dueAmount' + number);
}

function validate() {
    var valid = true;

    const nameInput0 = $('#name').first();
    if (!nameInput0.val().trim()) {
        valid = false;
        if (submitAttempted) {
            nameInput0.addClass('error');
        }
    } else {
        nameInput0.removeClass('error');
    }

    const emailInput = $('#email').first();
    if (!emailInput.val().trim()) {
        valid = false;
        if (submitAttempted) {
            emailInput.addClass('error');
        }
    } else {
        emailInput.removeClass('error');
    }

    const membershipInput = $('#membership').first();
    if (membershipInput.val() == "-") {
        valid = false;
        if (submitAttempted) {
            membershipInput.addClass('error');
        }
    } else {
        membershipInput.removeClass('error');
    }

    var seatTotal = 0;

    for (i = 0; i < numDaveners; i++) {
        const davener = $('#davener' + i);

        const nameInput = davener.find('input[name="name' + i + '"]').first();
        if (!nameInput.val().trim()) {
            valid = false;
            if (submitAttempted) {
                nameInput.addClass('error');
            }
        } else {
            nameInput.removeClass('error');
        }

        const male = davener.find('#maleButton' + i);
        const female = davener.find('#femaleButton' + i);
        if (!male.prop("checked") && !female.prop("checked")) {
            valid = false;
            if (submitAttempted) {
                davener.find('#maleLabel' + i).addClass('error');
                davener.find('#femaleLabel' + i).addClass('error');
            }
        } else {
            davener.find('#maleLabel' + i).removeClass('error');
            davener.find('#femaleLabel' + i).removeClass('error');
        }

        const typeInput = davener.find('select[name="type' + i + '"]').first();
        if (typeInput.val() == "-") {
            valid = false;
            if (submitAttempted) {
                typeInput.addClass('error');
            }
        } else {
            typeInput.removeClass('error');
        }

        const gradeInput = davener.find('select[name="grade' + i + '"]');
        if (typeInput.val() == "youngKid") {
            gradeInput.removeClass('gone');                    
            if (gradeInput.val() == "-") {
                valid = false;
                if (submitAttempted) {
                    gradeInput.addClass('error');
                }
            } else {
                gradeInput.removeClass('error');
            }

        } else {
            gradeInput.addClass('gone');
        }

        const roshHaShanah = davener.find('#roshHaShanah' + i);
        const yomKippur = davener.find('#yomKippur' + i);
        if (!roshHaShanah.prop("checked") && !yomKippur.prop("checked")) {
            valid = false;
            if (submitAttempted) {
                davener.find('#roshHaShanahLabel' + i).addClass('error');
                davener.find('#yomKippurLabel' + i).addClass('error');
            }
        } else {
            davener.find('#roshHaShanahLabel' + i).removeClass('error');
            davener.find('#yomKippurLabel' + i).removeClass('error');
        }

        $('#due' + i).addClass('gone');
        if (typeInput.val() == "guest") {
            if (roshHaShanah.prop("checked") && yomKippur.prop("checked")) {
                seatTotal += seatTwo;
                $('#dueAmount' + i).html(seatTwo + "&#8362;");
                $('#due' + i).removeClass('gone');
            } else if (roshHaShanah.prop("checked") || yomKippur.prop("checked")) {
                seatTotal += seatOne;
                $('#dueAmount' + i).html(seatOne + "&#8362;");
                $('#due' + i).removeClass('gone');
            }
        }

    }

    switch (membershipInput.val()) {
        case "fullMember":
        case "becomingFullMember":
            membershipDue = membershipFull;
            break;
        case "partialMember":
            membershipDue = membershipPartial;
            break;
        default:
            membershipDue = 0;
            break;
    }
    switch (membershipInput.val()) {
        case "becomingFullMember":
            buildingFundDue = buildingFund;
            break;
        default:
            buildingFundDue = 0;
            break;
    }
    seatsDue = seatTotal;
    
    $('#membershipDue').text(membershipDue);
    $('#buildingFundDue').text(buildingFundDue);
    $('#seatsDue').text(seatTotal);


    return valid;
}
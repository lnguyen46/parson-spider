var fs = require('fs');
var _ = require('lodash');
var vo = require('vo');

var Nightmare = require('nightmare');
var nightmare = Nightmare({
    show: true,
    executionTimeout: 20000, // 20s
    dock: true
});

// A Helper function that we use to get financial aid information of each college.
Nightmare.action('getUniversityInfo', function(schoolName, done) {
    this.evaluate_now(function(name) {
	
	function formatMoney(x) {
	    return "$" + x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	var res = {
	    name: 1,
	    address: 1,
	    tuition_and_fees: 1,
	    average_aid_award: 1,
	};

	res.name = name;

	var address = document.querySelector('h2.marginTopTen.marginBtmTen.museoSeven.bold.inactive.copyXXLrg.clearfix').textContent;
	res.address = address;
	
	//	var fin_aid_type = document.querySelectorAll('ul.smallDottedList span.madlibBrder');
	var tuition = document.querySelector('td.rightBrdrThin.alignRight.horizCenter.padTen.padRightOnly span').textContent;
	res.tuition_and_fees = tuition;
	
	var awardInfo = document.querySelectorAll('ul.smallDottedList span.bold');

	if (awardInfo) {
	    var numberOfStudents = awardInfo[0].textContent;
	    var totalAward = awardInfo[1].textContent.replace(/[$,]/g, '');
	    var avgAward;
	    
	    if (numberOfStudents === '--' || totalAward === '--') {
		avgAward = '--';
	    } else {
		var tmp;
		
		if (parseInt(totalAward) === 0 || parseInt(numberOfStudents) === 0) {
		    tmp = 0;
		} else {
		    tmp = Math.round(parseInt(totalAward) / parseInt(numberOfStudents));		    
		}

		avgAward = formatMoney(tmp);
	    }
	    
	    res.average_aid_award = avgAward;
	    
	} else {
	    return "failed";
	}
	
	return res;

    }, done, schoolName);
    
});


var uniqueCollegeData = require('./data/college_name/unique.json');
var duplicateCollegeData = require('./data/college_name/duplicate.json');

var ERR_UNIVERSITY = [];

// brokenLinkData is an output file of ERR_UNIVERSITY. I correct manually each link and then use them for our final scraping.
var brokenLinkData = require('./data/college_name/unique_but_link_broken.json');


/// ==== MAIN FUNCTION ======

// This function helps us run through the college names we have collected before
// - First, we run through the college names in unique.json
// - Second, we run though the college names in duplicate.json
// - Finally, we run through the college names in unique_but_link_broken.json

// I don't write three functions for three searches. For each search, I change the `universities` variable and custom the name of output file and restart the program.

var run = function * () {
    var universities = uniqueCollegeData;
    // var universities = duplicateCollegeData;
    // var universities = brokenLinkData;
    var final_res = [];


    function createUrlWith(schoolName) {
	var query = schoolName.toLowerCase().replace(/\W+/g, '-');
	return 'https://bigfuture.collegeboard.org/college-university-search/' + query;
    }
    
    for (var i=0; i<universities.length; i++) {
	var url = createUrlWith(universities[i]);
	
	var university = yield nightmare
	    .goto(url)
	    .wait(2000)
	    .exists('div#cpProfile_tabs_forInternationalStudents_anchor a.clusterText')
	    .then((goodLink) => {
		if (goodLink) {
		    return nightmare
		    	.click('div#cpProfile_tabs_forInternationalStudents_anchor a.clusterText')
			.wait(2000)
			.getUniversityInfo(universities[i]);
		} else {
		    console.log("Broken Link with " + universities[i]);
		    
		    ERR_UNIVERSITY.push(universities[i]);
		    return "failed";
		}
	    });
	
	final_res.push(university);
	
	if (_.includes(final_res, "failed")) {
	    _.remove(final_res, function(warning) {
		return warning === "failed";
	    });
	    continue;
	}
    }
    
    yield nightmare.end(); // End the nightmare instance and the Electron window.

    return final_res;
};

vo(run) (function(err, result) {
    if (err) console.log(err);
    else {
	fs.writeFile('./data/financial_aid/aid_unique.json', JSON.stringify(result, null, 2), (err) => {
	    if (err) throw err;
	    console.log("Write to file successfully");
	});

	fs.writeFile('./data/college_name/unique_but_link_broken.json', JSON.stringify(ERR_UNIVERSITY, null, 2), (err) => {
	    if (err) throw err;
	    console.log("Write to file successfully");
	});

    }
    
});



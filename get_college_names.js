var fs = require('fs');
var _ = require('lodash');
var Nightmare = require('nightmare');
var nightmare = Nightmare({
    show: true,
    executionTimeout: 20000, // 20s
    dock: true
});


nightmare
    .goto('https://bigfuture.collegeboard.org/college-search?navId=www-cs')
    .click('div#collegeSearch_searchCriteria_typeOfSchoolTab_anchor a.button') // choose type school
    .wait('#gwt-uid-374')
    .wait(2000)
    .click('input#gwt-uid-374')  // select 4-year universities
    .wait(2000)
    .click('input#gwt-uid-381') // select "Public" school
    .wait(2000)
    .click('input#gwt-uid-382') // select "Private" school
    .wait(2000)
    .click('button.closeLink.right')
    .wait(2000)
    .click('div#collegeSearch_searchCriteria_paying_anchor a.button') // choosing paying
    .wait('#gwt-uid-265')
    .click('#gwt-uid-265') // Financial Aid for International Students.
    .wait(2000)
    .click('button.closeLink.right')
    .wait(function() {
	var link = document.querySelector('a.padLeftOnly');
	link.setAttribute('target', '_self'); // Open link with current Electron window. If we don't do this, the program crashes.
	return true;
    })
    .click('a.padLeftOnly') // here we come to the page with 1454 college names that satisfy our selections above.
    .wait(3000)
    .evaluate(function() {

	var names = [];
	
	var school_name = document.querySelectorAll('td.col2 p.bold');

	if (school_name.length === 0) { return names; }
	
	else {
	    for (var i=0; i<school_name.length; i++) {
		
		var final_string = school_name[i].textContent;
		names.push(final_string);
	    }
	    return names;
	}
    }) 
    .end()
    .then(function(result) {

	if (result.length === 0) { console.log("Failed"); }

	else {
	    console.log(result.length);

	    // Count the college name's frequency.
	    var counts = _.countBy(result);

	    // Unique college names.
	    var unique_colleges = _.transform(counts, function(result, value, key) {
		if (value === 1) { result[key] = value; }
		return result;
	    }, {});

	    // Duplicate college names.
	    var duplicate_colleges = _.transform(counts, function(result, value, key) {
		if (value > 1) { result[key] = value; }
		return result;
	    }, {});

	    // Write unique colleges to file.
	    fs.writeFile('./data/college_name/unique.json', JSON.stringify(unique_colleges, null, 2), (err) => {
    		if (err) throw err;
    		console.log("Write to file successfully!");
    	    });

	    // Write duplicate colleges to file.
	    fs.writeFile('./data/college_name/duplicate.json', JSON.stringify(duplicate_colleges, null, 2), (err) => {
    		if (err) throw err;
    		console.log("Write to file successfully!");
    	    });

	}
    })
    .catch(function(err) {
	console.log(err);
    });

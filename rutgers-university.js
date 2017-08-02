var request = require('request');
var cheerio = require('cheerio');
var VCalendar = require('cozy-ical').VCalendar;
var VEvent = require('cozy-ical').VEvent;
var fs = require('fs');
 
var cal = new VCalendar({
  organization: 'University of Illinois',
  title: 'Academic Calendar'
});

var getNumberForMonth = function(month){

	switch(month.toLowerCase()){
		case "january":
			return "01";
		case "february":
			return "02";
		case "march":
			return "03";
		case "april":
			return "04";
		case "may":
			return "05";
		case "june":
			return "06";
		case "july":
			return "07";
		case "august":
			return "08";
		case "september":
			return "09";
		case "october":
			return "10";
		case "november":
			return "11";
		case "december":
			return "12";
	}

}

request("https://scheduling.rutgers.edu/scheduling/academic-calendar", function(err, res, body){

	var $ = cheerio.load(body);

	var counter = 0;

	$('tr').each(function(){

		if ($(this).children().length == 4 && $(this).children()[2].children[0].data.trim() != "2017-2018"){

			var date = $(this).children()[2].children[0].data;

			var endDate = "";

			var endDateDay = "";

			if ($(this).children()[2].children[2] && $(this).children()[2].children[2].data.toString().indexOf("(") == -1){

				date = date.replace(/-/g, "");

				endDate = $(this).children()[2].children[2].data.toString().trim();

				endDateDay = endDate.substring(endDate.length - 2);

				endDateDay = (parseInt(endDateDay) + 1).toString();

				if (endDateDay.length == 1){

					endDateDay = "0" + endDateDay;

				}

			}
			
			var description = $(this).children()[0].children[0].data;

			var year = "2018";

			if (date.toLowerCase().indexOf("september") != -1 || date.toLowerCase().indexOf("october") != -1 || date.toLowerCase().indexOf("november") != -1 || date.toLowerCase().indexOf("december") != -1){
				
				year = "2017";

			}

			date = date.trim();

			day = date.substring(date.length - 2);

			day = (parseInt(day) + 1).toString();

			if (day.length == 1){

				day = "0" + day;

			}

			var vevent;

			if (endDate.toString().length > 0){

				vevent = new VEvent({
				  stampDate: new Date(year + "-" + getNumberForMonth(date.replace(/\s\s+/g, ' ').split(" ")[1].replace(/ /g, "")) + "-" + day + " 00:00:00"),
				  startDate: new Date(year + "-" + getNumberForMonth(date.replace(/\s\s+/g, ' ').split(" ")[1].replace(/ /g, "")) + "-" + day + " 00:00:00"),
				  endDate: new Date(year + "-" + getNumberForMonth(endDate.replace(/\s\s+/g, ' ').split(" ")[1].replace(/ /g, "")) + "-" + endDateDay + " 00:00:00"),
				  description: description,
				  uid: counter
				});

			}
			else {

				vevent = new VEvent({
				  stampDate: new Date(year + "-" + getNumberForMonth(date.replace(/\s\s+/g, ' ').split(" ")[1].replace(/ /g, "")) + "-" + day + " 00:00:00"),
				  startDate: new Date(year + "-" + getNumberForMonth(date.replace(/\s\s+/g, ' ').split(" ")[1].replace(/ /g, "")) + "-" + day + " 00:00:00"),
				  endDate: new Date(year + "-" + getNumberForMonth(date.replace(/\s\s+/g, ' ').split(" ")[1].replace(/ /g, "")) + "-" + day + " 00:00:00"),
				  description: description,
				  uid: counter
				});

			}

			cal.add(vevent);

			counter++;

		}

	});

	fs.writeFileSync("rutgers.ics", cal.toString().replace(/DESCRIPTION/g, "SUMMARY"));

});
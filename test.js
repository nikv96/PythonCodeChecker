var PythonShell = require('python-shell');
var fs = require("fs");

var data = fs.readFileSync('my_script.py');
var dataList = data.toString().split("\n");
var pyshell = new PythonShell('my_script.py');

var messages = {};
var out_count = 1;
pyshell.send("BC");


pyshell.on('message', function (message) {
	console.log(message);
	messages[out_count] = message;
	out_count += 1;
});

function getPosition(str, m, i) {
   return str.split(m, i).join(m).length;
}

pyshell.end(function (err) {
	if (err) {
		var errorName = err.stack.substring(7, err.stack.indexOf('\n'));
		var errorType = errorName.substring(0, errorName.indexOf(':'));
		var errorDescription = errorName.substring(errorName.indexOf(':')+2);

		var traceback = err.traceback.split("\n");

		var lineNumber = traceback[1].split(",")[1];
		//console.log(traceback);
		if (errorType == "NameError"){
			var spellcheck = new PythonShell('SpellCheck/SpellCheck.py');
			var dat = errorDescription.substring(errorDescription.indexOf("'")+1, getPosition(errorDescription, "'", 2));
			spellcheck.send(dat);
			errorDescription.substring(errorDescription.indexOf("'")+1, getPosition(errorDescription, "'", 2));
			console.log("Don't you know how to spell " 
				+ errorDescription.substring(errorDescription.indexOf("'")+1, getPosition(errorDescription, "'", 2)));
			spellcheck.on('message', function (message) {
				console.log(message);
			});
			spellcheck.end(function(error){
				if (error){
					console.log(error.stack);
				}
			});
		} else if (errorType == "IndexError"){

			//var declare = dataList.indexOf( traceback[2].substring(traceback[2].indexOf("[")-2,traceback[2].indexOf("["))+" =");
			//console.log(declare);
			console.log("Looks like you are trying to access a list element with an index value outside your list. To learn more about it, ask me about Index Errors!");
			console.log("Anyway, to fix the error all you need to do is change the index value @"+ lineNumber + " \"" + traceback[2] + "\" to something lesser");
			console.log("The particular index you need to change is " + traceback[2].substring(traceback[2].indexOf("[")-2, traceback[2].indexOf("]")+1) +" going by your code.");

		} else if (errorType == "TypeError"){
			console.log("Looks like you need to refresh your datatypes concepts.");
			console.log("Your error is here "+ lineNumber + " \"" + traceback[2]);
		} else if (errorType == "ValueError"){
			console.log("Looks like you need to refresh your Values.");
			console.log("Your error is here "+ lineNumber + " \"" + traceback[2]);
		} else if (errorType == "MemoryError"){
			console.log("Looks like you have memory errors");
			console.log("Your error is here "+ lineNumber + " \"" + traceback[2]);
			
		} else if (errorType == "ImportError"){
			console.log("Your error is here "+ lineNumber + " \"" + traceback[2]);
		}
	}
	//console.log(messages);
});
var PythonShell = require('python-shell');
var fs = require("fs");
//CREATE PY SCRIPT
//var pyFile = fs.createWriteStream('my_script.py', {
//			flags: "w",
//	});
//pyFile.write("print('1')\nprint('2')\nprint('3')");

var data = fs.readFileSync('my_script.py');
var bigFile = fs.createWriteStream('SpellCheck/big.txt', {
  flags: "a"
});
var bigString = fs.readFileSync("SpellCheck/big.txt").toString();
var dataList = data.toString().split("\n");
var pyshell = new PythonShell('my_script.py');
var out_count = 0;
var actual_outputs = ["1","4","4"]
var flag = false
var finalMessage = []

//HELPER FUNCTION
function getPosition(str, m, i) {
   return str.split(m, i).join(m).length;
}

//PYTHON SHELL COMMANDS
pyshell.send("Hey");
pyshell.on('message', function (message) {
	finalMessage.push(message);
	console.log(message);
	if (message != actual_outputs[out_count]){
		finalMessage.push("This output is wrong. Try to implement it in a different way. You may have missed a trick here!");
		console.log("This output is wrong. Try to implement it in a different way. You may have missed a trick here!");
	}
	out_count += 1;
});
pyshell.end(function (err) {
	if (err) {
		if (err.stack.indexOf("SyntaxError")>=0){
			console.log(err.stack.substring(err.stack.indexOf("SyntaxError"),getPosition(err.stack,"\n", 4)));
			console.log(err.stack.substring(err.stack.indexOf("line"), err.stack.indexOf("\n")));
			console.log("You forgot the colon here: "+ err.stack.substring(err.stack.indexOf("if"), err.stack.indexOf("^")));
		} else{
			var errorName = err.stack.substring(7, err.stack.indexOf('\n'));
			var errorType = errorName.substring(0, errorName.indexOf(':'));
			var errorDescription = errorName.substring(errorName.indexOf(':')+2);
			var traceback = err.traceback.split("\n");
			var lineNumber = traceback[1].split(",")[1];
			if (errorType == "NameError"){

				if (traceback[2].indexOf("input(") >=0 && traceback[2].indexOf("_input(") <0){
					console.log("Looks like you are using input()! Ask me about input through terminal for python.");
					console.log("Anyway, to fix the error all you need to do is change <span class=\"code\">input</span> @"+ lineNumber + " \"<span class=\"code\">" + traceback[2] + "</span>\" to raw_input");
				
				} else {
					console.log("Looks like you have a NameError! Ask me more about it! To fix, do the following: ");
					for (i in dataList){
						if (dataList[i].substring(0,dataList[i].search("=")).length != 0)
							if (bigString.indexOf((dataList[i].substring(0,dataList[i].search("=")))) < 0)
								bigFile.write(dataList[i].substring(0,dataList[i].search("="))+"\n");
					}
					var spellcheck = new PythonShell('SpellCheck/SpellCheck.py');
					var dat = errorDescription.substring(errorDescription.indexOf("'")+1, getPosition(errorDescription, "'", 2));
					spellcheck.send(dat);
					console.log("You might have mispelled <span class=\"code\">" 
						+ errorDescription.substring(errorDescription.indexOf("'")+1, getPosition(errorDescription, "'", 2)) + "</span> @"+ lineNumber);
					spellcheck.on('message', function (message) {
						console.log(message);
					});
					spellcheck.end(function(error){
						if (error){
							console.log(error.stack);
						}
					});
				}
			} else if (errorType == "IndexError"){
				var arrayElement = traceback[2].substring(0,traceback[2].indexOf("]")+1);
				var finalElement = "";
				for (i=arrayElement.length-1;i>= 0; i--){
					if (arrayElement[i] == " "){
						finalElement = arrayElement.substring(i+1, arrayElement.length);
						break;
					}
				}
				console.log("Looks like you are trying to access a list element with an index value outside your list. To learn more about it, ask me about Index Errors!");
				console.log("Anyway, to fix the error all you need to do is change the index value @"+ lineNumber + " \"<span class=\"code\">" + traceback[2] + "</span> to something lesser");
				console.log("The particular index you need to change is <span class=\"code\">" + finalElement +"</span> going by your code.");

			} else if (errorType == "TypeError"){
				console.log("Looks like you need to refresh your datatypes concepts.");
				console.log("Your error is here "+ lineNumber + " \"" + traceback[2]);
				var op = errorDescription.substring(errorDescription.indexOf(":")-1,errorDescription.indexOf(":"));
				var datatypes = [];
				if(errorDescription.indexOf('int') > -1)
					datatypes.push('int');
				if(errorDescription.indexOf('long') > -1)
					datatypes.push('long');
				if(errorDescription.indexOf('str') > -1)
					datatypes.push('string');
				if(errorDescription.indexOf('double') > -1)
					datatypes.push('double');
				if(errorDescription.indexOf('bool') > -1)
					datatypes.push('bool');
				if(datatypes.length > 1) {
					if(errorDescription.indexOf('concatenate') > -1)
						console.log(datatypes[0]+" "+ datatypes[1]+' cannot be concatenated');
					else if(errorDescription.indexOf('convert') > -1)
						console.log(datatypes[0]+" "+ datatypes[1]+'Cannot be implicity converted. Please use ' + datatypes[0] + '()');
					else
						console.log("For this operation " + op + " your datatypes," + datatypes[0]+" and "+ datatypes[1]+ " are wrong")
				}else if(datatypes.length == 1){
					if(errorDescription.indexOf('__getitem__') > -1)
						console.log('You are trying to get a value from a ' + datatypes[0] + ' variable');
					else	
						console.log(datatypes[0] + ' can\'t be used with this function since it is the wrong data type');
				}

			} else if (errorType == "ValueError"){
				console.log("Your error is here "+ lineNumber + " \"" + traceback[2]);
				var datatypes = [];
				if(errorDescription.indexOf('int') > -1)
					datatypes.push('int');
				if(errorDescription.indexOf('long') > -1)
					datatypes.push('long');
				if(errorDescription.indexOf('float') > -1)
					datatypes.push('float');
				if(datatypes.length == 1) {
					var value = errorDescription.substring(errorDescription.lastIndexOf(" "), errorDescription.length);
					console.log('Cannot convert' + value + ' to ' + datatypes[0]);
				}
			} else if (errorType == "ImportError") {
				console.log("Your error is here "+ lineNumber + " \"" + traceback[2]);
				var value = errorDescription.substring(errorDescription.lastIndexOf(" "), errorDescription.length);
				console.log('Cannot find the package ' + value);
			}
		}
	}
});
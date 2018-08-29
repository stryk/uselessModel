var fs = require('fs');
var mysql = require('mysql');
var moment = require('moment')
var recordCount = 0

const outputFile = "training_input.csv"
var header = []
var connection = mysql.createConnection({
    host: "162.243.94.68",
    user: "amazonbot",
    password: "w3w177w1N",
    database: 'amazonbot'
  });
  fs.truncate(outputFile, 0, function(){console.log('File emptied')})

  connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  })

function processRow (row) {
    recordCount++

    if(recordCount === 1){
        //file header
        header = [];
        for (var propertyName in row) {
            console.log(row[propertyName])
            console.log('Propertname:', row[propertyName].name)
            header.push(row[propertyName].name);
        }
        fs.appendFile(outputFile, header.join(',') + "\n", function (err) {
            connection.resume();
        });
    }else{

    let fields = [];
    for (var propertyName of header) {
        let field = row[propertyName]
        if(propertyName.toLowerCase().indexOf('time') > 0){
            let newDate = new Date(field)
            field = Math.round(newDate.getTime()/1000)
        }
       fields.push(String(field).trim());
    }
    fs.appendFile(outputFile, fields.join(',') + "\n", function (err) {
        connection.resume();
    });
}
}

var query = connection.query("select  * from training_data where startTime like '%2018%' and NOT(isNUll(hasVideo))");
query
  .on('error', function(err) {
    // do something when an error happens
  })
 .on('fields', function(fields) {
   processRow(fields);
 })
 .on('result', function(row) {
   // Pausing the connnection is useful if your processing involves I/O
   connection.pause();
   processRow(row, function (err) {
     connection.resume();
   });
 })
 .on('end', function() {
     console.log('Done!', 'View ./' + outputFile)
     process.exit()
    // now you can mail your user
 });    
var fs = require('fs')
  , os = require('os')

const fileName = '../combatlog.txt';

var getFileDate = function(){
  var date = new Date();
  var fileDate = date.getFullYear()+'-'+date.getMonth()+'-'+date.getDay()+'_'+date.getHours()+'-'+date.getMinutes()+'-'+date.getSeconds();
  return fileDate;
}

var writeStream = null
  , startDate = null
  , endDate = null
  , lineCount = 0
  , finalArray = Array()
  , foundDates = Array()
  , spellsApplied = Array()

var WoWLogLine = function(logline){
  this.dateTime = logline[0];
  this.event = logline[1] ? logline[1].replace(/"/g,'') : null;
  this.spell = logline[11] ? logline[11].replace(/"/g,'') : null;
  this.source = logline[3] ? logline[3].replace(/"/g,'') : null;
  this.dest = logline[7] ? logline[7].replace(/"/g,'') : null;
}

var readLogFile = function(fileName){
  writeStream = fs.createWriteStream('../output_'+getFileDate()+'.html');
  writeStream.on('open', function(e){
    fs.readFile(fileName, function(err,data){
      if(err) throw err;

      var array = data.toString().split("\n");
      for (i in array){
        var line = array[i];
        var lineArr = line.split(',');

        var firstFields = lineArr[0].split("  ");
        lineArr.shift();

        var obj = new WoWLogLine(firstFields.concat(lineArr));
        searchLogLine(obj);
      }
      searchLogLines();
      endDate = new Date;
      console.log('End:', endDate.toTimeString());
      console.log('Duration:', ((endDate.getTime() - startDate.getTime())/1000) + 's');
      console.log('Lines wrote:',lineCount);

      writeFooter();
    });
  });
}

var searchLogLines = function(){
  for(i in foundDates){
    var picked = spellsApplied.filter(function(e){ return e.dateTime==foundDates[i].dateTime;})
    writeLog(picked);
  }
}

var writeLog = function(arr){
  if(arr.length>0){
    writeContent(foundDates[i],true);
    for(i in arr){
      writeContent(arr[i]);
    }
  }
}

var searchLogLine = function(line){
  lineCount++;
  if(line.event=='SPELL_AURA_REMOVED'){
    if(line.spell=="Winter's Chill"){
      foundDates.push(line);
    }
  }
  if(line.event=='SPELL_AURA_APPLIED'){
    spellsApplied.push(line);
  }
}

var writeContent = function(line,colored){
  var logline = '<tr>';
  if(colored) logline = '<tr class="table-active">';

  logline += '<td>' + line.dateTime + '</td>' +
    '<td>' + line.event + '</td>' +
    '<td>' + line.spell + '</td>' +
    '<td>' + line.source + '</td>' +
    '<td>' + line.dest + '</td>' +
    '</tr>';
  writeStream.write(logline + os.EOL);
}

var writeHeader = function(){
  fs.readFile("dependencies/header.html", "utf8", function(err, data) {
    writeStream.write(data + os.EOL);
  });
}

var writeFooter = function(){
  fs.readFile("dependencies/footer.html", "utf8", function(err, data) {
    writeStream.write(data + os.EOL);
  });
}

startDate = new Date;
writeHeader();
console.log('Start:', startDate.toTimeString());
readLogFile(fileName);
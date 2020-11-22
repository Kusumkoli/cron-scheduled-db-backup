const cron = require('node-cron');
const express = require('express');
const spawn = require('child_process').spawn;
const fs = require('fs');
const crypto = require('crypto');

const AppendInitVec = require('./appendInitVec');

const password = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3';

function getCipherKey(password) {
  return crypto.createHash('sha256').update(password).digest();
}

app = express();

cron.schedule('* * * * * *', function() {

	console.log('calling function every second');
	
    var backUpCommand = spawn('mongodump', [
    	'--host', '<hostname>', '--port', '<port>',
		'--username=<username>', '--password=<password>',
		'--archive=./mongoBackup/test_dump.gz', '--gzip']);

    backUpCommand.stdout.on('data', function (data) {
        console.log('stdout: ' + data);	
		encrypt({file :'./mongoBackup/test_dump.gz' , password: password});
    });
    backUpCommand.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
    });
    backUpCommand.on('exit', function (code) {
      console.log('mongodump exited with code ' + code);
    });

		
}); 

function encrypt({ file, password }) {

  const initVect = crypto.randomBytes(16);
  
  
  const CIPHER_KEY = getCipherKey(password);
  const readStream = fs.createReadStream(file);
  const cipher = crypto.createCipheriv('aes256', CIPHER_KEY, initVect);
  console.log(cipher);
  const appendInitVec = new AppendInitVec(initVect);
  
  const writeStream = fs.createWriteStream('./mongoBackup/encrypted_test_dump.gz');
  console.log('file encrypted!');
  console.log('File: ', readStream);
  readStream
    .pipe(cipher)
    .pipe(appendInitVec)
    .pipe(writeStream);
}